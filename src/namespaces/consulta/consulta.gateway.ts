import { Logger } from "@nestjs/common";
import { MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway } from "@nestjs/websockets";
import { Namespace, Socket } from 'socket.io';
import { ConsultaService } from "./consulta.service";

@WebSocketGateway({ namespace: '/consulta' })
export class ConsultaGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    private readonly logger = new Logger('/consulta');

    constructor(
        private readonly consultaService: ConsultaService
    ) { }

    afterInit(nsp: Namespace) {
        nsp.use((socket, next) => {
            const token = socket.handshake.auth?.token ?? socket.handshake.query?.token;
            if (!process.env.TOKEN_CONSULTA || token !== process.env.TOKEN_CONSULTA) {
                return next(new Error('unauthorized'));
            }
            next();
        });
    }

    async handleConnection(client: Socket) {
        const id = client.handshake.query.id ?? client.handshake.auth?.id;

        if (typeof id !== 'string' || !/^\w+$/.test(id)) return;

        try {
            await client.join(`consulta:${id}`);                     
            const filaId = await this.consultaService.rastrear({ codigo: id.toString() });  

            if (!filaId) {
                client.emit('status', { id, message: 'não há fila disponível' });
                return;
            }

            client.emit('status', { id, message: `cliente ${id} adicionado à fila #${filaId}` });
            this.logger.log(`conectou: ${client.id} (consulta ${id})`);
        } catch (err) {
            this.logger.error(`falha ao iniciar consulta ${id}: ${err instanceof Error ? err.message : err}`);
        }
    }


    handleDisconnect(client: Socket) {
        this.logger.log(`desconectou: ${client.id}`);
    }

}