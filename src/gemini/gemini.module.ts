import { Module } from '@nestjs/common';
import { GeminiService } from './gemini.service';
import { DynamoModule } from 'src/dynamo/dynamo.module';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
@Module({
  imports: [DynamoModule,CloudinaryModule],
  providers: [GeminiService,CloudinaryService],
  exports: [GeminiService],
})
export class GeminiModule {}