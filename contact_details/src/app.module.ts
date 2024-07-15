import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ContactModule } from './contact/contact.module';
import { MongooseModule } from '@nestjs/mongoose';
import { CorsMiddleware } from './cors.middleware';
import { NestModule } from '@nestjs/common';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://http://62.146.178.245/Contact_Details'),
    ContactModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorsMiddleware).forRoutes('*');
  }
}
