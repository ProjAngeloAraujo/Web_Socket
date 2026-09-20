import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { io, Socket } from 'socket.io-client';

export type StatusConsulta = { id: string; status: string; dados?: unknown };

@Injectable()
export class SocketService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(SocketService.name);
  private socket!: Socket;

  constructor(private readonly config: ConfigService) {}

  onModuleInit(): void {
    this.socket = io(this.config.getOrThrow<string>('SOCKET_URL'), {
      auth: { token: this.config.getOrThrow<string>('SOCKET_TOKEN') },
      transports: ['websocket'],
    });

    this.socket.on('connect', () => this.logger.log('conectado ao servidor WebSocket'));
    this.socket.on('disconnect', (motivo) => this.logger.warn(`desconectado do servidor: ${motivo}`));
    this.socket.on('connect_error', (err) => this.logger.warn(`erro de conexão: ${err.message}`));
  }

  async emitirStatus(dados: StatusConsulta): Promise<boolean> {
    try {
      const resposta = await this.socket.timeout(5000).emitWithAck('status', dados);
      return resposta?.ok === true;
    } catch {
      return false;
    }
  }

  onModuleDestroy(): void {
    this.socket?.close();
  }
}