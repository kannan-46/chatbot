// src/chat/chat.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { Content } from '@google/generative-ai';
import { DynamoService } from 'src/dynamo/dynamo.service';
import { GeminiService } from 'src/gemini/gemini.service';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    private readonly client: DynamoService,
    private readonly gemini: GeminiService,
  ) {}

  async *generateStreamWithHistory(
    prompt: string,
    userId: string,
    model: string,
    webSearch = false,
    temperature = 0.7,
  ): AsyncGenerator<string> {
    try {
      this.logger.log(`Processing request for user ${userId} | model: ${model} | webSearch: ${webSearch} | temp: ${temperature}`);

      // Pull prior history
      const historyItems = await this.client.getMessagesByUserId(userId);
      this.logger.log(`Retrieved ${historyItems.length} history items for user ${userId}`);

      // Build history - limit to last 20 messages for performance
      const recentHistory = historyItems.slice(-20);
      const history: Content[] = recentHistory.map((item) => ({
        role: item.role as 'user' | 'model',
        parts: [{ text: item.content }],
      }));

      const updatedHistory: Content[] = [
        ...history,
        { role: 'user', parts: [{ text: prompt }] }
      ];

      // Save user prompt
      await this.client.saveMessage(userId, 'user', prompt);
      this.logger.log(`Saved user message to database`);

const stream = this.gemini.generateTextStream(
  prompt,
  updatedHistory,
  model,
  temperature, 
  userId,
  webSearch,     
);


      let fullResponse = '';
      let chunkCount = 0;
      
      for await (const chunk of stream) {
        fullResponse += chunk;
        chunkCount++;
        yield chunk;
      }

      if (fullResponse.trim()) {
        await this.client.saveMessage(userId, 'model', fullResponse.trim());
        this.logger.log(`Saved assistant response to database (${fullResponse.length} chars, ${chunkCount} chunks)`);
      }

    } catch (error) {
      this.logger.error('Stream generation error:', error);
      yield `Error: ${error.message}`;
    }
  }
}
