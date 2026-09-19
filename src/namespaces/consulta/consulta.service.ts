import { Injectable } from "@nestjs/common";
import { randomUUID } from "crypto";
import { RabbitmqService } from "src/rabbitmq/rabbitmq.service";


@Injectable()
export class ConsultaService {

    constructor(
        private readonly rabbit: RabbitmqService
    ) { }

    async rastrear(dados: { codigo: string }): Promise<string | null> {
        const id = randomUUID();
        const resultado = await this.rabbit.publicar('rastrear', { id, ...dados });
        return resultado.ok ? id : null;
    }

}