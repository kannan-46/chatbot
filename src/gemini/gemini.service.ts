import {  Injectable } from "@nestjs/common";
import { GoogleGenerativeAI,Content,Tool,GoogleSearchRetrieval } from "@google/generative-ai";
import { DynamoService } from "src/dynamo/dynamo.service";

@Injectable()
export class GeminiService{
  private readonly genAi:GoogleGenerativeAI

  constructor(private readonly client:DynamoService){
    this.genAi=new GoogleGenerativeAI(process.env.GEMINI_API!)
  }
  async *generateTextStream(
    prompt:string,
    history:Content[],
    modelName:string,
    temperature:number,
    userId:string,
    webSearch:boolean
  ):AsyncGenerator<string>{
    try {
      const userProfile=await this.client.getUserProfile(userId)
            let systemInstruction = `You are a friendly and helpful AI assistant named "Kannan's AI".
IMPORTANT: Your responses must be brief and concise. Use markdown for formatting (like **bold** for emphasis or bullet points).`;

      if (userProfile) {
        const nameLine = userProfile.name ? `- The user's name is "${userProfile.name}".` : '';
        const aboutLine = userProfile.about ? `- About the user: "${userProfile.about}".` : '';
        systemInstruction += `

### User Context
${nameLine}
${aboutLine}`;
      }

      const tools:Tool[]=webSearch?[{googleSearchRetrieval:{}as GoogleSearchRetrieval}]:[]

      const model=this.genAi.getGenerativeModel({
        model:modelName,
        generationConfig:{temperature},
        tools,
        systemInstruction
      })

      const chat=model.startChat({history})
      const result=await chat.sendMessageStream(prompt)

      for await (const chunk of result.stream){
        const text=chunk.text()
        if(text){
          yield text
        }
      }
    } catch (error) {
       console.error('An error occurred in generateTextStream:', error);
      yield 'Sorry, something went wrong while processing your request. Please try again.';
    }
  }
    }
  
