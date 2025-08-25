import { Body, Controller, Param, Put,Get } from '@nestjs/common';
import { DynamoService } from 'src/dynamo/dynamo.service';

class userProfile{
    name:string
    about:string
}
@Controller('user')
export class UserController {
    constructor(private readonly client:DynamoService){}
    
      @Get(':userId/profile')
  async getUserProfile(@Param('userId') userId: string) {
    console.log(`[UserController] Received request to get profile for userId: ${userId}`);

      const profile = await this.client.getUserProfile(userId);
      return profile || {}; // Return profile or an empty object if not found
    
  }
    @Put(':userId/profile')
    async saveUserProfile(
        @Param('userId')userId:string,
        @Body()userProfile:userProfile
    ){
        console.log(`recieved request to save user profile ${userId}`);
        await this.client.saveUserProfile(userId,userProfile)
        console.log('profile saved');
        
    }
}
