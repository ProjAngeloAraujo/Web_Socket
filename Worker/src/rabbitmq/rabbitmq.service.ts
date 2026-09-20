import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { connect } from 'amqp-connection-manager';
import type { AmqpConnectionManager, ChannelWrapper } from 'amqp-connection-manager';
import type { Channel, ConsumeMessage } from 'amqplib';

@Injectable()
export class RabbitmqService implements OnModuleDestroy {
  private readonly logger = new Logger(RabbitmqService.name);
  private readonly connection: AmqpConnectionManager;
  private readonly channel: ChannelWrapper;

  constructor(config: ConfigService) {
    this.connection = connect([config.getOrThrow<string>('RABBITMQ_URL')]);

    this.connection.on('connect', () => this.logger.log('conectado ao RabbitMQ'));
    this.connection.on('disconnect', ({ err }) =>
      this.logger.warn(`desconectado do RabbitMQ: ${err?.message ?? 'sem detalhe'}`),
    );

    this.channel = this.connection.createChannel();
  }

  consumir<T>(fila: string, handler: (mensagem: T) => Promise<void>, prefetch = 1): void {
    this.channel
      .addSetup(async (ch: Channel) => {
        await ch.assertQueue(fila, { durable: true });
        await ch.prefetch(prefetch);
        await ch.consume(fila, (msg) => {
          if (msg) void this.processar(ch, msg, handler);
        });
      })
      .then(() => this.logger.log(`consumindo a fila "${fila}"`))
      .catch((err: unknown) =>
        this.logger.error(`falha ao configurar a fila "${fila}": ${err instanceof Error ? err.message : err}`),
      );
  }

  private async processar<T>(
    ch: Channel,
    msg: ConsumeMessage,
    handler: (mensagem: T) => Promise<void>,
  ): Promise<void> {
    try {
      const mensagem = JSON.parse(msg.content.toString()) as T;
      await handler(mensagem);
      this.confirmar(() => ch.ack(msg));
    } catch (err) {
      this.logger.error(`falha ao processar mensagem: ${err instanceof Error ? err.message : err}`);
      this.confirmar(() => ch.nack(msg, false, false));
    }
  }

  private confirmar(acao: () => void): void {
    try {
      acao();
    } catch (err) {
      this.logger.warn(`não foi possível confirmar a mensagem: ${err instanceof Error ? err.message : err}`);
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.channel.close();
    await this.connection.close();
  }
}