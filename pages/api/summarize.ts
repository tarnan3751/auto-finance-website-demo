import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.OPENAI_API_KEY) {
    console.error('[Summarize API] OpenAI API key not configured');
    return res.status(500).json({ error: 'OpenAI API key not configured' });
  }

  try {
    const { articles } = req.body;
    
    if (!articles || !Array.isArray(articles)) {
      return res.status(400).json({ error: 'Invalid articles data' });
    }

    // Generate summaries for all articles in parallel
    const summariesPromises = articles.map(async (article) => {
      try {
        const response = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are an expert auto finance journalist. Create engaging, informative 2-3 sentence summaries of auto finance news articles. Focus on the key financial implications, market impacts, and relevance to industry professionals. Be specific with numbers and data when available.'
            },
            {
              role: 'user',
              content: `Create a 2-3 sentence summary for this auto finance article:
              
Title: ${article.title}
Current summary: ${article.summary}

Provide a more detailed summary that expands on the key points, includes specific data or percentages if mentioned, and explains the significance for auto finance professionals. Keep it engaging and informative.`
            }
          ],
          temperature: 0.7,
          max_tokens: 150,
        });

        return {
          ...article,
          aiSummary: response.choices[0].message.content?.trim() || article.summary
        };
      } catch (error) {
        console.error('Error generating summary for article:', article.title, error);
        // Fallback to original summary if AI fails
        return {
          ...article,
          aiSummary: article.summary
        };
      }
    });

    const articlesWithSummaries = await Promise.all(summariesPromises);
    
    res.status(200).json({ articles: articlesWithSummaries });
  } catch (error) {
    console.error('Summarize API error:', error);
    res.status(500).json({ error: 'Failed to generate summaries' });
  }
}