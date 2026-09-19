import { Module } from '@nestjs/common';
import { ConsultaModule } from './namespaces/consulta/consulta.module';
import { ConfigModule } from '@nestjs/config';
import { RabbitmqModule } from './rabbitmq/rabbitmq.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ConsultaModule,
    RabbitmqModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
