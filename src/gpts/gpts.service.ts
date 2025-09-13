import { Injectable } from '@nestjs/common';
import { DynamoService } from 'src/dynamo/dynamo.service';
import { GeminiService } from 'src/gemini/gemini.service';

@Injectable()
export class GptsService {
  constructor(
    private readonly client: DynamoService,
    private readonly gemini: GeminiService,
  ) {}

  async createGpt(userId: string, gptData: any) {
    const { name, description, avatarPrompt, persona, isPublic } = gptData;
    const avatarUrl = await this.gemini.generateAndUpload(avatarPrompt, userId);

    return this.client.createGpt(
      userId,
      name,
      description,
      avatarUrl,
      persona,
      isPublic,
    );
  }

  async getGpt(gptId:string){
    return this.client.getGpt(gptId)
  }

  async getPublicGpt(){
    return this.client.getPublicGpts()
  }

  async *generateGptStream(
    userId:string,
    prompt:string,
    model:string,
    systemInstruction:string
  ):AsyncGenerator<string>{
    yield* this.gemini.generateTextStream(
        prompt,
        [],
        model,
        0.7,
        userId,
        false,
        systemInstruction
    )
  }
}
