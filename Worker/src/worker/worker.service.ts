import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RabbitmqService } from '../rabbitmq/rabbitmq.service';
import { SocketService } from '../socket/socket.service';

type MensagemRastrear = { id: string };

const ETAPAS = ['recebido', 'consultando', 'concluido'];

@Injectable()
export class WorkerService implements OnModuleInit {
  private readonly logger = new Logger(WorkerService.name);

  constructor(
    private readonly rabbit: RabbitmqService,
    private readonly socket: SocketService,
  ) {}

  onModuleInit(): void {
    this.rabbit.consumir<MensagemRastrear>('rastrear', (mensagem) => this.rastrear(mensagem));
  }

  private async rastrear({ id }: MensagemRastrear): Promise<void> {
    this.logger.log(`processando consulta ${id}`);

    for (const status of ETAPAS) {
      await this.simularTrabalho(1000);

      const enviado = await this.socket.emitirStatus({ id, status });
      if (!enviado) throw new Error(`não foi possível enviar o status "${status}" da consulta ${id}`);
    }

    this.logger.log(`consulta ${id} finalizada`);
  }

  private simularTrabalho(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}