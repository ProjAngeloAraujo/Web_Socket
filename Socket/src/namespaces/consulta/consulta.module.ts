import { Module } from "@nestjs/common";
import { ConsultaGateway } from "./consulta.gateway";
import { ConsultaService } from "./consulta.service";
import { RabbitmqModule } from "src/rabbitmq/rabbitmq.module";

@Module({
    providers: [ConsultaGateway, ConsultaService],
    imports: [RabbitmqModule],
})
export class ConsultaModule {}