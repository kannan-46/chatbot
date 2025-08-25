import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ChatModule } from './chat/chat.module';
import { GeminiModule } from './gemini/gemini.module';
import { DynamoModule } from './dynamo/dynamo.module';
// import { WikiModule } from './wiki/wiki.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ChatModule,
    GeminiModule,
    DynamoModule,
    // WikiModule,
    UserModule,
  ],
  providers: [],
})
export class AppModule {}