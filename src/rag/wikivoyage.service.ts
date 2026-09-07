// wikivoyage.service.ts
import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class WikivoyageService {
  async fetchArticle(placeName: string): Promise<string | null> {
    try {
      const response = await axios.get('https://en.wikivoyage.org/w/api.php', {
        params: {
          action: 'query',
          titles: placeName,
          prop: 'extracts',
          explaintext: true,
          format: 'json',
          redirects: 1,
        },
        headers: {
          'User-Agent': 'TravelGenie/1.0 (contact@example.com)',
        },
      });

      const pages = response.data.query.pages;
      const page: any = Object.values(pages)[0];

      if (page.missing !== undefined || !page.extract) {
        return null;
      }

      return page.extract;
    } catch (error) {
      console.error(`Wikivoyage fetch failed for ${placeName}:`, error.message);
      return null;
    }
  }
}