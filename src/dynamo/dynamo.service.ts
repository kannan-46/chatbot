import { Injectable } from '@nestjs/common';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
  GetCommand,
} from '@aws-sdk/lib-dynamodb';

@Injectable()
export class DynamoService {
  private readonly client: DynamoDBDocumentClient;
  private readonly messageTableName = 'chatMessages';

  constructor() {
    const client = new DynamoDBClient({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });
    this.client = DynamoDBDocumentClient.from(client);
  }

  async saveMessage(userId: string, role: 'user' | 'model', content: string) {
    const timeStamp = new Date().toISOString();
    const command = new PutCommand({
      TableName: this.messageTableName,
      Item: {
        PK: userId,
        SK: `MSG#${timeStamp}`,
        role: role,
        content: content,
      },
    });
    return this.client.send(command);
  }

  async getMessagesByUserId(userId: string) {

    const command = new QueryCommand({
      TableName: this.messageTableName,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
      ExpressionAttributeValues: {
        ':pk': userId,
        ':sk':'MSG#'
      },
      // FilterExpression: 'attribute_exists(#r) AND attribute_exists(#c)',
      // ExpressionAttributeNames: { '#r': 'role', '#c': 'content' },
    });

    const { Items } = await this.client.send(command);
    return Items || [];
  }

  // async savePreference(userId: string, key: string, value: any): Promise<void> {
  //   console.log(`[DynamoService] Attempting to save to DynamoDB. Table: ${this.tableName}`);

  //   const command = new PutCommand({
  //     TableName: this.tableName,
  //     Item: {
  //       userId: userId,   // Your table's Partition Key
  //       prefKey: key,     // Your table's Sort Key (if you have one, adjust if not)
  //       prefValue: value,
  //       updatedAt: new Date().toISOString(),
  //     },
  //   });

  //   try {
  //     console.log('[DynamoService] Sending PutCommand to AWS...');
  //     await this.client.send(command);
  //     console.log('[DynamoService] Successfully saved preference to DynamoDB.');
  //   } catch (error) {
  //     console.error('[DynamoService] FAILED to save preference to DynamoDB:', error);
  //     // Re-throw the error so the Gemini service's catch block can handle it
  //     throw new Error('Could not save preference to the database.');
  //   }
  // }
  // async getPreference(userId: string, key: string): Promise<any | null> {
  //   const command = new QueryCommand({
  //     TableName: this.preferenceTable,
  //     KeyConditionExpression: 'userId = :uid and preferenceKey=:pkey',
  //     ExpressionAttributeValues: {
  //       ':uid': userId,
  //       ':pkey': key,
  //     },
  //   });
  //   const { Items } = await this.client.send(command);

  //   return Items || [];
  // }

  async saveUserProfile(
    userId: string,
    profile: { name: string; about: string },
  ): Promise<void> {
    const command = new PutCommand({
      TableName: this.messageTableName,
      Item: {
        PK: userId,
        SK: '#PROFILE',
        name: profile.name,
        about: profile.about,
        updatedAt: new Date().toISOString(),
      },
    });
    await this.client.send(command);
    console.log('profile saved');
  }

  async getUserProfile(
    userId: string,
  ): Promise<{ name?: string; about?: string } | null> {
    const command = new GetCommand({
      TableName: this.messageTableName,
      Key: {
        PK: userId,
        SK: '#PROFILE',
      },
    });
    const res = await this.client.send(command);
    return res.Item as { name?: string; about?: string } | null;
  }
}
