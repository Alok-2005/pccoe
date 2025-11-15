// File: server/src/services/rag.service.ts
import { IUser } from '../models/User';
import { IConversation } from '../models/Conversation';
import { logger } from '../utils/logger';
import { getVectorStore } from './vector.service';
import { getLLMResponse } from './llm.service';

const MOCK_MODE = process.env.MOCK_MODE === 'true';

interface RiskPredictionResult {
  riskScores: {
    overall: number;
    heatwave: number;
    airQuality: number;
    uvExposure: number;
    disease: number;
  };
  evidence: Array<{
    source: string;
    content: string;
    relevanceScore: number;
  }>;
  recommendations: Array<{
    category: string;
    action: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
  }>;
  explanation: string;
}

interface ChatResponse {
  content: string;
  evidence: Array<{
    source: string;
    snippet: string;
  }>;
}

// Calculate risk scores based on environment data
const calculateRiskScores = (envData: any, userHealth: any) => {
  const { temperature, aqi, uvIndex, humidity } = envData;
  const { age, comorbidities } = userHealth;

  // Heatwave risk
  let heatwave = 0;
  if (temperature > 40) heatwave = 90;
  else if (temperature > 35) heatwave = 70;
  else if (temperature > 30) heatwave = 50;
  else heatwave = 20;

  // Air quality risk
  let airQuality = 0;
  if (aqi > 300) airQuality = 95;
  else if (aqi > 200) airQuality = 80;
  else if (aqi > 100) airQuality = 60;
  else if (aqi > 50) airQuality = 30;
  else airQuality = 10;

  // UV exposure risk
  let uvExposure = 0;
  if (uvIndex > 10) uvExposure = 90;
  else if (uvIndex > 7) uvExposure = 70;
  else if (uvIndex > 5) uvExposure = 50;
  else uvExposure = 20;

  // Disease risk (based on temperature, humidity, and AQI)
  let disease = (temperature > 30 ? 40 : 20) + (humidity > 70 ? 30 : 10) + (aqi > 100 ? 30 : 10);

  // Adjust for vulnerable populations
  const vulnerabilityMultiplier = 
    (age < 12 || age > 65) ? 1.2 : 
    comorbidities.length > 0 ? 1.3 : 1.0;

  heatwave = Math.min(100, heatwave * vulnerabilityMultiplier);
  airQuality = Math.min(100, airQuality * vulnerabilityMultiplier);
  disease = Math.min(100, disease * vulnerabilityMultiplier);

  const overall = Math.round((heatwave + airQuality + uvExposure + disease) / 4);

  return {
    overall,
    heatwave: Math.round(heatwave),
    airQuality: Math.round(airQuality),
    uvExposure: Math.round(uvExposure),
    disease: Math.round(disease)
  };
};

// Generate recommendations based on risk scores
const generateRecommendations = (riskScores: any, envData: any) => {
  const recommendations: any[] = [];

  if (riskScores.heatwave > 70) {
    recommendations.push({
      category: 'Heat Protection',
      action: 'Avoid outdoor activities between 11 AM - 4 PM. Stay hydrated and wear light clothing.',
      priority: 'critical'
    });
  } else if (riskScores.heatwave > 50) {
    recommendations.push({
      category: 'Heat Protection',
      action: 'Limit outdoor exposure during peak hours. Drink plenty of water.',
      priority: 'high'
    });
  }

  if (riskScores.airQuality > 70) {
    recommendations.push({
      category: 'Air Quality',
      action: 'Wear N95 mask outdoors. Keep windows closed. Use air purifier indoors.',
      priority: 'critical'
    });
  } else if (riskScores.airQuality > 50) {
    recommendations.push({
      category: 'Air Quality',
      action: 'Sensitive groups should limit outdoor activities. Consider wearing a mask.',
      priority: 'high'
    });
  }

  if (riskScores.uvExposure > 70) {
    recommendations.push({
      category: 'UV Protection',
      action: 'Apply SPF 50+ sunscreen every 2 hours. Wear sunglasses and protective clothing.',
      priority: 'high'
    });
  }

  if (riskScores.disease > 60) {
    recommendations.push({
      category: 'Disease Prevention',
      action: 'Maintain hygiene. Avoid crowded places. Consult doctor if symptoms appear.',
      priority: 'medium'
    });
  }

  // Eco-friendly recommendations
  recommendations.push({
    category: 'Sustainable Living',
    action: 'Use public transport or carpool to reduce emissions and improve air quality.',
    priority: 'low'
  });

  return recommendations;
};

// Mock evidence for testing
const getMockEvidence = (riskScores: any) => {
  const evidence = [];

  if (riskScores.heatwave > 60) {
    evidence.push({
      source: 'WHO Climate Health Report 2024',
      content: 'Extreme heat events are associated with increased mortality, especially among elderly and those with cardiovascular conditions.',
      relevanceScore: 0.92
    });
  }

  if (riskScores.airQuality > 60) {
    evidence.push({
      source: 'Lancet Study on Air Pollution',
      content: 'PM2.5 levels above 100 μg/m³ are linked to respiratory illnesses and increased hospital admissions.',
      relevanceScore: 0.88
    });
  }

  evidence.push({
    source: 'Indian Meteorological Department',
    content: 'Regional climate patterns show increasing frequency of extreme weather events requiring adaptive health measures.',
    relevanceScore: 0.75
  });

  return evidence;
};

export const getRiskPrediction = async (
  user: IUser,
  envData: any
): Promise<RiskPredictionResult> => {
  try {
    // Calculate risk scores
    const riskScores = calculateRiskScores(envData, {
      age: user.healthProfile.age || 30,
      comorbidities: user.healthProfile.comorbidities
    });

    // Generate recommendations
    const recommendations = generateRecommendations(riskScores, envData);

    // Get evidence from vector store or use mock
    let evidence;
    if (MOCK_MODE) {
      evidence = getMockEvidence(riskScores);
    } else {
      const vectorStore = getVectorStore();
      const query = `health risks for temperature ${envData.temperature}°C, AQI ${envData.aqi}, UV index ${envData.uvIndex}`;
      evidence = await vectorStore.similaritySearch(query, 3);
    }

    // Generate explanation using LLM
    const prompt = `Based on the following environmental conditions and health risk scores, provide a clear, concise explanation:

Environment:
- Temperature: ${envData.temperature}°C
- Air Quality Index: ${envData.aqi}
- UV Index: ${envData.uvIndex}
- Humidity: ${envData.humidity}%

Risk Scores:
- Overall: ${riskScores.overall}/100
- Heatwave: ${riskScores.heatwave}/100
- Air Quality: ${riskScores.airQuality}/100
- UV Exposure: ${riskScores.uvExposure}/100
- Disease: ${riskScores.disease}/100

User Profile:
- Age: ${user.healthProfile.age || 'Not specified'}
- Health Conditions: ${user.healthProfile.comorbidities.join(', ') || 'None reported'}

Provide a 2-3 sentence explanation of the overall health risk and why certain factors are elevated. Be reassuring but informative.`;

    const explanation = await getLLMResponse(prompt);

    return {
      riskScores,
      evidence,
      recommendations,
      explanation
    };

  } catch (error) {
    logger.error('Risk prediction error:', error);
    
    // Fallback response
    const riskScores = calculateRiskScores(envData, {
      age: user.healthProfile.age || 30,
      comorbidities: user.healthProfile.comorbidities
    });
    
    return {
      riskScores,
      evidence: getMockEvidence(riskScores),
      recommendations: generateRecommendations(riskScores, envData),
      explanation: `Based on current conditions (${envData.temperature}°C, AQI ${envData.aqi}), your overall health risk is ${riskScores.overall}/100. ${riskScores.overall > 70 ? 'Take immediate precautions.' : 'Follow general safety guidelines.'}`
    };
  }
};

export const getChatResponse = async (
  user: IUser,
  conversation: IConversation,
  message: string
): Promise<ChatResponse> => {
  try {
    // Get relevant context from vector store
    let contextDocs = [];
    if (!MOCK_MODE) {
      const vectorStore = getVectorStore();
      contextDocs = await vectorStore.similaritySearch(message, 3);
    }

    // Build conversation history
    const conversationHistory = conversation.messages
      .slice(-6) // Last 3 exchanges
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n');

    // Create prompt for LLM
    const prompt = `You are a helpful Climate-Health AI Assistant. Provide accurate, evidence-based health advice related to climate and environmental factors.

User Context:
- Location: ${user.location.city}
- Age: ${user.healthProfile.age || 'Not specified'}
- Health Conditions: ${user.healthProfile.comorbidities.join(', ') || 'None reported'}

Recent Conversation:
${conversationHistory}

${contextDocs.length > 0 ? `Relevant Information:\n${contextDocs.map((doc: any, i: number) => `${i + 1}. ${doc.content}`).join('\n')}` : ''}

User Question: ${message}

Guidelines:
1. Provide clear, actionable advice
2. Be safety-first: if serious symptoms, recommend consulting a doctor
3. Cite evidence when available
4. Keep response concise (3-4 sentences)
5. Be empathetic and reassuring

Response:`;

    const content = await getLLMResponse(prompt);

    const evidence = contextDocs.slice(0, 2).map((doc: any) => ({
      source: doc.source || 'Health Database',
      snippet: doc.content.substring(0, 150) + '...'
    }));

    return {
      content,
      evidence
    };

  } catch (error) {
    logger.error('Chat response error:', error);
    
    // Fallback response
    return {
      content: `I understand your question about "${message}". While I'm experiencing some technical difficulties accessing my full knowledge base, I recommend: 1) Check current weather conditions in ${user.location.city}, 2) Follow general health safety guidelines, 3) Consult a healthcare provider if you have specific health concerns. Stay safe!`,
      evidence: []
    };
  }
};

export const addDocumentsToVectorStore = async (
  documents: Array<{ content: string; metadata?: any }>,
  source: string
): Promise<{ count: number }> => {
  try {
    if (MOCK_MODE) {
      logger.info(`Mock mode: Would add ${documents.length} documents from ${source}`);
      return { count: documents.length };
    }

    const vectorStore = getVectorStore();
    
    // Add documents with metadata
    const docsWithMetadata = documents.map(doc => ({
      ...doc,
      metadata: {
        ...doc.metadata,
        source,
        addedAt: new Date().toISOString()
      }
    }));

    await vectorStore.addDocuments(docsWithMetadata);

    logger.info(`Added ${documents.length} documents from ${source} to vector store`);
    return { count: documents.length };

  } catch (error) {
    logger.error('Add documents error:', error);
    throw error;
  }
};