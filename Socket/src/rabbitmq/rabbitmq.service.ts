
import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { connect } from 'amqp-connection-manager';
import type { AmqpConnectionManager, ChannelWrapper } from 'amqp-connection-manager';
import type { Channel } from 'amqplib';

export type ResultadoPublicacao = { ok: true } | { ok: false; erro: string };

const TIMEOUT_MS = 5000;

@Injectable()
export class RabbitmqService implements OnModuleDestroy {
  private readonly logger = new Logger(RabbitmqService.name);
  private readonly connection: AmqpConnectionManager;
  private readonly channel: ChannelWrapper;
  private readonly filasDeclaradas = new Set<string>();

  constructor(config: ConfigService) {
    this.connection = connect([config.getOrThrow<string>('RABBITMQ_URL')]);

    this.connection.on('connect', () => this.logger.log('conectado ao RabbitMQ'));
    this.connection.on('disconnect', ({ err }) =>
      this.logger.warn(`desconectado do RabbitMQ: ${err?.message ?? 'sem detalhe'}`),
    );

    this.channel = this.connection.createChannel({ json: true });
  }

  async publicar(fila: string, mensagem: unknown): Promise<ResultadoPublicacao> {
    try {
      await this.garantirFila(fila);
      await this.channel.sendToQueue(fila, mensagem, {
        persistent: true,
        timeout: TIMEOUT_MS,
      });
      return { ok: true };
    } catch (err) {
      const erro = err instanceof Error ? err.message : String(err);
      this.logger.error(`falha ao publicar em "${fila}": ${erro}`);
      return { ok: false, erro };
    }
  }

  private async garantirFila(fila: string): Promise<void> {
    if (this.filasDeclaradas.has(fila)) return;

    if (!this.connection.isConnected()) {
      throw new Error('RabbitMQ indisponível');
    }

    await this.channel.addSetup((ch: Channel) =>
      ch.assertQueue(fila, { durable: true }),
    );
    this.filasDeclaradas.add(fila);
  }

  async onModuleDestroy(): Promise<void> {
    await this.channel.close();
    await this.connection.close();
  }
}