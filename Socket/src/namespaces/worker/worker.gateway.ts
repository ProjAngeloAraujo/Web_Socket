import { Logger } from '@nestjs/common';
import {
  MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit,
  SubscribeMessage, WebSocketGateway, WebSocketServer,
} from '@nestjs/websockets';
import { Namespace, Socket } from 'socket.io';
import { EVENTOS_CONSULTA, salaConsulta } from '../consulta/consulta.events';

@WebSocketGateway({ namespace: '/worker' })
export class WorkerGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() nsp!: Namespace;
  private readonly logger = new Logger('/worker');

  afterInit(nsp: Namespace) {
    nsp.use((socket, next) => {
      const token = socket.handshake.auth?.token ?? socket.handshake.query?.token;
      if (!process.env.TOKEN_WORKER || token !== process.env.TOKEN_WORKER) {
        return next(new Error('unauthorized'));
      }
      next();
    });
  }

  handleConnection(client: Socket) {
    this.logger.log(`worker conectou: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`worker desconectou: ${client.id}`);
  }

  @SubscribeMessage('status')
  onStatus(@MessageBody() body: { id?: string; status?: string; dados?: unknown }) {
    if (!body?.id || !body?.status) {
      return { ok: false, erro: 'id_e_status_obrigatorios' };
    }

    this.nsp.server
      .of('/consulta')
      .to(salaConsulta(body.id))
      .emit(EVENTOS_CONSULTA.STATUS, { id: body.id, status: body.status, dados: body.dados });

    return { ok: true };
  }
}