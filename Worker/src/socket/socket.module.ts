import { Module } from "@nestjs/common";
import { SocketService } from "./socket.service";

@Module({
    exports: [SocketService],
    providers: [SocketService]
})
export class SocketModule {}