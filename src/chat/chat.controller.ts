// src/chat/chat.controller.ts
import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Get,
  Param,
  Logger,
  Res,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { ChatService } from './chat.service';
import { ClerkAuthGuard } from '../auth/clerk.guard';
import { DynamoService } from 'src/dynamo/dynamo.service';

interface AuthenticatedRequest extends Request {
  auth: { userId: string };
}

class ChatPromptDto {
  prompt: string;
  model: string;
  webSearch: boolean;
  temperature: number;
}

@Controller('chat')
export class ChatController {
  private readonly logger = new Logger(ChatController.name);

  constructor(
    private readonly chatService: ChatService,
    private readonly dynamoDbService: DynamoService,
  ) {}

  @Post('stream')
  @UseGuards(ClerkAuthGuard)
  async chatStream(
    @Req() request: AuthenticatedRequest,
    @Body() chatPromptDto: ChatPromptDto,
    @Res() response: Response,
  ): Promise<void> {
    const userId = request.auth.userId;
    
    this.logger.log(`Chat request from user ${userId}: webSearch=${chatPromptDto.webSearch}, model=${chatPromptDto.model}, temp=${chatPromptDto.temperature}`);
    
    // Set SSE headers manually
    response.setHeader('Content-Type', 'text/event-stream');
    response.setHeader('Cache-Control', 'no-cache');
    response.setHeader('Connection', 'keep-alive');
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Headers', 'Cache-Control, Authorization, Content-Type');

    try {
      const stream = this.chatService.generateStreamWithHistory(
        chatPromptDto.prompt,
        userId,
        chatPromptDto.model,
        chatPromptDto.webSearch,
        chatPromptDto.temperature,
      );

      let chunkCount = 0;
      for await (const chunk of stream) {
        if (chunk) {
          chunkCount++;
          response.write(`data: ${chunk}\n\n`);
        }
      }

      this.logger.log(`Stream completed for user ${userId}: ${chunkCount} chunks sent`);
      response.write('data: [DONE]\n\n');
      response.end();
    } catch (error) {
      this.logger.error('Streaming error:', error);
      response.write(`data: Error: ${error.message}\n\n`);
      response.write('data: [DONE]\n\n');
      response.end();
    }
  }

  @Get('history/:userId')
  @UseGuards(ClerkAuthGuard)
  async getHistory(@Req() request: AuthenticatedRequest) {
    const userId = request.auth.userId;
    const messages = await this.dynamoDbService.getMessagesByUserId(userId);
    this.logger.log(`Retrieved ${messages.length} history items for user ${userId}`);
    return { messages };
  }
}
