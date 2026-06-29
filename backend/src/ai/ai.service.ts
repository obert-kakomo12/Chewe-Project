import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AiService {
  constructor(private configService: ConfigService) {}

  private async callOpenRouter(systemPrompt: string, userPrompt: string) {
    const apiKey = this.configService.get<string>('OPENROUTER_API_KEY');
    
    if (!apiKey) {
      throw new InternalServerErrorException('OPENROUTER_API_KEY is not configured in .env');
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3.1-8b-instruct',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new InternalServerErrorException(`OpenRouter API error: ${errorData}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  async generateReportComment(data: any) {
    const systemPrompt = "You are a professional administrative assistant for a school. Given a report's details, write a concise, professional, 1-2 sentence summary comment about the report status or contents. Be encouraging but formal.";
    const userPrompt = `Report details: ${JSON.stringify(data)}`;
    return this.callOpenRouter(systemPrompt, userPrompt);
  }

  async generateExecutiveAnalysis(data: any) {
    const systemPrompt = "You are a high-level executive business analyst for an educational institution. Analyze the following dashboard data (bottlenecks, outliers, correlation). Provide a concise, highly strategic, data-driven analysis with specific recommendations. Use markdown, keeping it under 150 words.";
    const userPrompt = `Dashboard data: ${JSON.stringify(data)}`;
    return this.callOpenRouter(systemPrompt, userPrompt);
  }

  async generateCounselingSuggestion(data: any) {
    const systemPrompt = "You are an empathetic, professional school counseling assistant. Based on the case data provided, suggest a brief, supportive, and highly actionable phrase or response the counselor could use, or a short strategic approach. Keep it under 2 sentences.";
    const userPrompt = `Case data: ${JSON.stringify(data)}`;
    return this.callOpenRouter(systemPrompt, userPrompt);
  }
}
