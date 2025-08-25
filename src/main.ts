// src/main.ts

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {


  const app = await NestFactory.create(AppModule);

  // Replace the simple app.enableCors(); with this more detailed object
  app.enableCors({
    origin: 'http://localhost:3000', // The specific origin of your frontend
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Accept, Authorization, X-User-ID', // IMPORTANT: Explicitly allow your custom headers
  });

  await app.listen(3001);
  console.log(`🚀 Server running at http://localhost:3001`);
}
bootstrap();





// import { Injectable } from '@nestjs/common';
// import fetch from 'node-fetch';

// @Injectable()
// export class WikiService {
//   private readonly API_KEY = process.env.GOOGLE_API_KEY;
//   private readonly CX = process.env.GOOGLE_CX; // Custom Search Engine ID

//   private extractKeywords(query: string): string[] {
//     const questionWords = [
//       'tell', 'me', 'about', 'what', 'is', 'how', 'why',
//       'when', 'where', 'recent', 'latest', 'a', 'an', 'the'
//     ];
//     const words = query.toLowerCase().split(/\s+/);

//     const keywords = words.filter(
//       word =>
//         word.length > 2 &&
//         !questionWords.includes(word) &&
//         !word.match(/^(and|or|but|for|of|in|on|at)$/)
//     );

//     const searchTerms: string[] = [];

//     if (keywords.length > 0) {
//       searchTerms.push(keywords.slice(0, 3).join(' '));
//     }

//     searchTerms.push(query);

//     return searchTerms;
//   }

//   async searchWeb(query: string) {
//     try {
//       console.log(`🔎 GoogleSearchService called with query: "${query}"`);

//       const searchTerms = this.extractKeywords(query);
//       console.log(`🎯 Generated search terms:`, searchTerms);

//       for (const searchTerm of searchTerms) {
//         console.log(`🔍 Trying Google search term: "${searchTerm}"`);

//         const searchUrl = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(
//           searchTerm
//         )}&key=${this.API_KEY}&cx=${this.CX}&num=3`;

//         const controller = new AbortController();
//         const timeoutId = setTimeout(() => controller.abort(), 10000);

//         const searchRes = await fetch(searchUrl, { signal: controller.signal });
//         clearTimeout(timeoutId);

//         if (!searchRes.ok) {
//           console.log(`❌ Google search failed for "${searchTerm}": ${searchRes.status}`);
//           continue;
//         }

//         const searchData: any = await searchRes.json();
//         const items = searchData.items || [];
//         console.log(`📊 Found ${items.length} results for "${searchTerm}"`);

//         if (items.length > 0) {
//           const firstResult = items[0];
//           const title = firstResult.title;
//           const snippet = firstResult.snippet;
//           const link = firstResult.link;

//           console.log(`🎯 Selected result: "${title}"`);

//           return `Based on Google Search result:\n\n"${title}"\n${snippet}\n\nRead more: ${link}`;
//         }
//       }

//       return `No Google results found for any variation of "${query}".`;
//     } catch (error: any) {
//       console.error('Google Search API error:', error);
//       if (error.name === 'AbortError') {
//         return 'Google search timed out.';
//       }
//       return 'Error fetching Google search data.';
//     }
//   }
// }
