import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { DynamoModule } from 'src/dynamo/dynamo.module';

@Module({
  controllers: [UserController],
  imports:[DynamoModule]
})
export class UserModule {}
