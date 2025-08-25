// // src/wiki/wiki.service.ts
// import { Injectable, Logger } from '@nestjs/common';
// import fetch from 'node-fetch';

// interface SearchResult {
//   title: string;
//   link: string;
//   snippet: string;
//   displayLink?: string;
//   formattedUrl?: string;
// }

// @Injectable()
// export class WikiService {
//   private readonly logger = new Logger(WikiService.name);
//   private readonly apikey = process.env.GOOGLE_API_KEY;
//   private readonly searchId = process.env.GOOGLE_CX;

//   constructor() {
//     if (!this.apikey || !this.searchId) {
//       this.logger.error(
//         'Google API Key or Search Engine ID is not configured in .env',
//       );
//       throw new Error('Missing Google Search credentials.');
//     }
//   }

//   async searchWeb(query: string): Promise<string> {
//     this.logger.log(`🔍 Performing Google search for: "${query}"`);
    
//     // Optimize search query
//     const optimizedQuery = this.optimizeSearchQuery(query);
//     const url = `https://www.googleapis.com/customsearch/v1?key=${this.apikey}&cx=${this.searchId}&q=${encodeURIComponent(optimizedQuery)}&num=5&sort=date&gl=in&hl=en`;

//     try {
//       const response = await fetch(url);
//       if (!response.ok) {
//         const error = await response.text();
//         this.logger.error(
//           `Google Search API responded with status ${response.status}: ${error}`,
//         );
//         return 'Sorry, the web search service is currently unavailable.';
//       }

//       const data: any = await response.json();
      
//       if (!data.items || data.items.length === 0) {
//         this.logger.log(`No search results found for "${optimizedQuery}".`);
//         return `No relevant search results were found for "${optimizedQuery}".`;
//       }

//       this.logger.log(`✅ Found ${data.items.length} search results`);

//       let summary = `Here are the current search results for "${query}":\n\n`;
      
//       data.items.forEach((item: SearchResult, index: number) => {
//         // Clean up snippet text
//         const cleanSnippet = item.snippet
//           .replace(/\n/g, ' ')
//           .replace(/\s+/g, ' ')
//           .replace(/\.\.\./g, '')
//           .trim();
        
//         // Clean up title
//         const cleanTitle = item.title
//           .replace(/\s+/g, ' ')
//           .trim();
        
//         summary += `**${index + 1}. ${cleanTitle}**\n`;
//         summary += `${cleanSnippet}\n`;
        
//         // Add source with cleaner formatting
//         const source = item.displayLink || this.extractDomain(item.link);
//         summary += `*Source: ${source}*\n\n`;
//       });

//       // Add search metadata
//       if (data.searchInformation?.totalResults) {
//         const totalResults = parseInt(data.searchInformation.totalResults).toLocaleString();
//         summary += `\n*Search completed: ${totalResults} total results found (showing top ${data.items.length})*`;
//       }

//       return summary;

//     } catch (error) {
//       this.logger.error('Failed to fetch from Google Search API', error);
//       return 'An unexpected error occurred while performing a web search. Please try again.';
//     }
//   }

//   private optimizeSearchQuery(query: string): string {
//     // Add current year for better results
//     const currentYear = new Date().getFullYear().toString();
    
//     // Don't add year if already present
//     if (!query.includes(currentYear) && !query.includes('2024') && !query.includes('2023')) {
//       // Add year for product/news queries
//       if (query.match(/(price|review|news|update|release|launch|specs|comparison)/i)) {
//         query += ` ${currentYear}`;
//       }
//     }
    
//     return query;
//   }

//   private extractDomain(url: string): string {
//     try {
//       const domain = new URL(url).hostname;
//       return domain.replace('www.', '');
//     } catch {
//       return url;
//     }
//   }
// }
