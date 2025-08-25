import { Module } from '@nestjs/common';
import { GeminiService } from './gemini.service';
import { DynamoModule } from 'src/dynamo/dynamo.module';

@Module({
  imports: [DynamoModule],
  providers: [GeminiService],
  exports: [GeminiService],
})
export class GeminiModule {}