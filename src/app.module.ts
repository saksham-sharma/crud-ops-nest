import { Module } from '@nestjs/common';
import { CatsModule } from './cats/cats.module';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    CatsModule,
    MongooseModule.forRoot('mongodb://127.0.0.1:27017/local'),
  ],
})
export class AppModule {}
