import { Module } from '@nestjs/common';
import { CatsModule } from './cats/cats.module';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    CatsModule,
    MongooseModule.forRoot('mongodb://127.0.0.1:27017/local'),
    AuthModule,
    UserModule,
  ],
})
export class AppModule {}
