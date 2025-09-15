// src/gpts/gpts.controller.ts

import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Get,
  Param,
  Res,
} from '@nestjs/common';
import { ClerkAuthGuard } from '../auth/clerk.guard';
import { GptsService } from './gpts.service';
import type { Response } from 'express';

interface AuthenticatedRequest extends Request {
  auth: { userId: string };
}

class CreateGptDto {
  name: string;
  description: string;
  avatarPrompt: string;
  persona: string;
  isPublic: boolean;
}
class gptPromptDto {
  prompt: string;
  model: string;
  systemInstruction: string;
}

@Controller('gpts')
export class GptsController {
  constructor(private readonly gptsService: GptsService) {}

  @Post('stream')
  @UseGuards(ClerkAuthGuard)
  async gptChatStream(
    @Req() request: any,
    @Body() gptPromptDto: gptPromptDto,
    @Res() response: Response,
  ) {
    const userId = request.auth.userId;

    // Set SSE headers
    response.setHeader('Content-Type', 'text/event-stream');
    response.setHeader('Cache-Control', 'no-cache');
    response.setHeader('Connection', 'keep-alive');

    try {
      const stream = this.gptsService.generateGptStream(
        userId,
        gptPromptDto.prompt,
        gptPromptDto.model,
        gptPromptDto.systemInstruction,
      );

      for await (const chunk of stream) {
        if (chunk) {
          response.write(`data: ${chunk}\n\n`);
        }
      }
      response.write('data: [DONE]\n\n');
      response.end();
    } catch (error) {
      console.error('GPT Streaming error:', error);
      response.write(`data: Error: ${error.message}\n\n`);
      response.write('data: [DONE]\n\n');
      response.end();
    }
  }
  @Post('create')
  @UseGuards(ClerkAuthGuard)
  async createGpt(
    @Req() request: AuthenticatedRequest,
    @Body() createGptDto: CreateGptDto,
  ) {
    const userId = request.auth.userId;
    const gpt = await this.gptsService.createGpt(userId, createGptDto);
    return { success: true, gpt };
  }

  @Get('list')
  async getPublicGpts() {
    const gpts = await this.gptsService.getPublicGpts();
    return { gpts };
  }

  @Get(':gptId')
  @UseGuards(ClerkAuthGuard)
  async getGpt(@Param('gptId') gptId: string) {
    const gpt = await this.gptsService.getGpt(gptId);
    return { gpt };
  }
}




  