// File: server/src/services/llm.service.ts
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { logger } from '../utils/logger';

const LLM_PROVIDER = process.env.LLM_PROVIDER || 'openai';
const MOCK_MODE = process.env.MOCK_MODE === 'true';

let openaiClient: OpenAI | null = null;
let anthropicClient: Anthropic | null = null;

// Initialize clients
if (process.env.OPENAI_API_KEY && !MOCK_MODE) {
  openaiClient = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
}

if (process.env.ANTHROPIC_API_KEY && !MOCK_MODE) {
  anthropicClient = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
  });
}

// Mock responses for testing
const getMockResponse = (prompt: string): string => {
  if (prompt.includes('risk') || prompt.includes('Risk')) {
    return `Based on current environmental conditions, your health risk is moderate. The elevated temperature and air quality index suggest taking precautions such as limiting outdoor activities during peak hours and staying hydrated. If you experience any respiratory symptoms or heat-related discomfort, please consult a healthcare provider.`;
  }
  
  if (prompt.includes('jog') || prompt.includes('exercise')) {
    return `Given current conditions, light indoor exercise is recommended over outdoor jogging. If you do go outside, early morning (before 8 AM) is safest when air quality is better and temperatures are cooler. Stay hydrated and watch for any signs of discomfort.`;
  }

  return `Based on your query and current climate conditions in your area, I recommend following general health safety guidelines: stay hydrated, avoid peak sun hours (11 AM - 4 PM), monitor air quality alerts, and consult a healthcare provider if you experience any concerning symptoms. Your wellbeing is important!`;
};

export const getLLMResponse = async (prompt: string): Promise<string> => {
  try {
    // Use mock response if in mock mode or no API keys available
    if (MOCK_MODE || (!openaiClient && !anthropicClient)) {
      logger.info('Using mock LLM response');
      return getMockResponse(prompt);
    }

    // Use OpenAI
    if (LLM_PROVIDER === 'openai' && openaiClient) {
      const response = await openaiClient.chat.completions.create({
        model: 'gpt-5-nano',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful climate-health AI assistant. Provide accurate, evidence-based advice. Always prioritize safety and recommend consulting healthcare providers for serious concerns.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      });

      return response.choices[0].message.content || 'I apologize, but I cannot generate a response at this time.';
    }

    // Use Anthropic Claude
    if (LLM_PROVIDER === 'anthropic' && anthropicClient) {
      const response = await anthropicClient.messages.create({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 500,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        system: 'You are a helpful climate-health AI assistant. Provide accurate, evidence-based advice. Always prioritize safety and recommend consulting healthcare providers for serious concerns.'
      });

      const content = response.content[0];
      if (content.type === 'text') {
        return content.text;
      }
    }

    // Fallback to mock if provider not configured
    logger.warn('LLM provider not properly configured, using mock response');
    return getMockResponse(prompt);

  } catch (error) {
    logger.error('LLM service error:', error);
    return getMockResponse(prompt);
  }
};