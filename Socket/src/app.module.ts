import { Module } from '@nestjs/common';
import { ConsultaModule } from './namespaces/consulta/consulta.module';
import { ConfigModule } from '@nestjs/config';
import { RabbitmqModule } from './rabbitmq/rabbitmq.module';
import { WorkerModule } from './namespaces/worker/worker.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ConsultaModule,
    RabbitmqModule,
    WorkerModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
