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

  async createNewChat(userId: string, title: string) {
    console.log(
      `creating new chat for user ${userId}`,
    );
      const chat = await this.client.createChat(
        userId,
        title || 'new chat',
      );
      this.logger.log(`Created chat ${chat.chatId} with default avatar`);
      return chat;
  }

  async *generateStreamWithHistory(
    prompt: string,
    userId: string,
    chatId: string,
    model: string,
    webSearch = false,
    temperature = 0.7,
    systemInstruction?:string
  ): AsyncGenerator<string> {
    try {
      this.logger.log(
        `Processing request for user ${userId} | model: ${model} | webSearch: ${webSearch} | temp: ${temperature}`,
      );
      const chatMessages = await this.client.getChatMessage(userId, chatId);
      console.log(`Retrieved ${chatMessages.length} for chatId: ${chatId}`);

      const recentHistory = chatMessages.slice(-20);
      const history: Content[] = recentHistory.map((item) => ({
        role: item.role as 'user' | 'model',
        parts: [{ text: item.content }],
      }));

      const updatedHistory: Content[] = [
        ...history,
        { role: 'user', parts: [{ text: prompt }] },
      ];

      // Save user prompt
      await this.client.saveChatMessage(userId, chatId, 'user', prompt);
      this.logger.log(`Saved user message to database`);

      const stream = this.gemini.generateTextStream(
        prompt,
        updatedHistory,
        model,
        temperature,
        userId,
        webSearch,
        systemInstruction
      );

      let fullResponse = '';
      let chunkCount = 0;

      for await (const chunk of stream) {
        fullResponse += chunk;
        chunkCount++;
        yield chunk;
      }

      if (fullResponse.trim()) {
        await this.client.saveChatMessage(
          userId,
          chatId,
          'model',
          fullResponse.trim(),
        );
        this.logger.log(
          `Saved assistant response to database (${fullResponse.length} chars, ${chunkCount} chunks)`,
        );
        const currentMessage=chatMessages.length + 2

        await this.autoGenerateChatTitle(userId,chatId,prompt,currentMessage)
      }
    } catch (error) {
      this.logger.error('Stream generation error:', error);
      yield `Error: ${error.message}`;
    }
  }

  private async autoGenerateChatTitle(
    userId: string,
    chatId: string,
    firstMessage: string,
    messageCount: number,
  ) {
    if (messageCount !== 1) return; 

    try {
      const titlePrompt = `Generate a short 2-4 word title for this conversation: "${firstMessage}"`;

      const titleStream = this.gemini.generateTextStream(
        titlePrompt,
        [],
        'gemini-1.5-flash-latest',
        0.3,
        userId,
        false,
      );

      let generatedTitle = '';
      for await (const chunk of titleStream) {
        generatedTitle += chunk;
      }

      const cleanTitle = generatedTitle
        .trim()
        .replace(/['"]/g, '')
        .substring(0, 30);

      if (cleanTitle) {
        await this.client.updateChatTitle(userId, chatId, cleanTitle);
        this.logger.log(
          `Auto-generated title for chat ${chatId}: ${cleanTitle}`,
        );
      }
    } catch (error) {
      this.logger.error('Failed to generate chat title:', error);
    }
  }
}
