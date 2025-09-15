import { Injectable } from '@nestjs/common';
import { DynamoService, Gpt } from 'src/dynamo/dynamo.service';
import { GeminiService } from 'src/gemini/gemini.service';

class CreateGptDto {
  name: string;
  description: string;
  avatarPrompt: string;
  persona: string;
  isPublic: boolean;
}

@Injectable()
export class GptsService {
  constructor(
    private readonly client: DynamoService,
    private readonly gemini: GeminiService,
  ) {}

  async createGpt(userId: string, gptData: CreateGptDto): Promise<Gpt> {
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

  async getGpt(userId:string,gptId:string): Promise<Gpt | null> {
    return this.client.getGpt(userId,gptId);
  }

  async getPublicGpts(): Promise<Gpt[]> {
    return this.client.getPublicGpts();
  }
  
  async getUserGpts(userId: string): Promise<Gpt[]> {
  return this.client.getUserGpts(userId);
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
    );
  }
}