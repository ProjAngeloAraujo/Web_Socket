import { Module } from '@nestjs/common';
import { RabbitmqModule } from './rabbitmq/rabbitmq.module';
import { WorkerModule } from './worker/worker.module';
import { SocketModule } from './socket/socket.module';
import { ConfigModule } from '@nestjs/config';

@Module({
 imports: [ConfigModule.forRoot({ isGlobal: true }), RabbitmqModule, SocketModule, WorkerModule],
})
export class AppModule {}
