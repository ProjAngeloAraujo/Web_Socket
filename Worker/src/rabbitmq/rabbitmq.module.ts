import { Module } from "@nestjs/common";
import { RabbitmqService } from "./rabbitmq.service";

@Module({
    exports: [RabbitmqService],
    providers: [RabbitmqService]
})
export class RabbitmqModule {}