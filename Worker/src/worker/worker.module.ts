import { Module } from "@nestjs/common";
import { WorkerService } from "./worker.service";
import { RabbitmqModule } from "src/rabbitmq/rabbitmq.module";
import { SocketModule } from "src/socket/socket.module";

@Module({
    imports: [RabbitmqModule, SocketModule],
    exports: [WorkerService],
    providers: [WorkerService]
})
export class WorkerModule {}