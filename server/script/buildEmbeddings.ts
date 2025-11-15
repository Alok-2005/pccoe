// File: server/src/scripts/buildEmbeddings.ts
import dotenv from 'dotenv';
import { getVectorStore } from '../services/vector.service';
import { logger } from '../utils/logger';

dotenv.config();

const sampleHealthDocuments = [
  {
    content: 'Extreme heat exposure increases risk of heat stroke, dehydration, and cardiovascular stress. Vulnerable populations include elderly, children, and those with pre-existing conditions.',
    metadata: { source: 'WHO Heat Health Guidelines', category: 'heat' }
  },
  {
    content: 'Air Quality Index (AQI) above 150 indicates unhealthy conditions. PM2.5 particles can penetrate deep into lungs causing respiratory issues and aggravating asthma.',
    metadata: { source: 'EPA Air Quality Standards', category: 'air_quality' }
  },
  {
    content: 'UV Index above 8 is very high. Prolonged exposure without protection can cause skin damage and increase cancer risk. Use SPF 50+ sunscreen and protective clothing.',
    metadata: { source: 'Skin Cancer Foundation', category: 'uv' }
  },
  {
    content: 'Climate change increases disease vector habitats. Warmer temperatures and increased rainfall expand mosquito breeding grounds, raising dengue and malaria risk.',
    metadata: { source: 'Lancet Climate Health Report', category: 'disease' }
  },
  {
    content: 'Elderly individuals (65+) are at higher risk during heat waves due to reduced thermoregulation. Monitor hydration and avoid outdoor activities during peak heat hours.',
    metadata: { source: 'Geriatric Health Association', category: 'elderly' }
  },
  {
    content: 'Children under 12 have higher metabolic rates and are more susceptible to heat stress. Ensure adequate hydration and monitor for signs of heat exhaustion.',
    metadata: { source: 'Pediatric Health Guidelines', category: 'children' }
  },
  {
    content: 'Individuals with asthma should avoid outdoor activities when AQI exceeds 100. Use prescribed inhalers and keep emergency medications accessible.',
    metadata: { source: 'Asthma and Allergy Foundation', category: 'respiratory' }
  },
  {
    content: 'Cardiovascular patients are at increased risk during extreme heat. Heat stress can trigger heart attacks. Stay in cool environments and follow medication schedules.',
    metadata: { source: 'American Heart Association', category: 'cardiovascular' }
  },
  {
    content: 'Hydration guidelines: Drink 8-10 glasses of water daily, increase to 12-15 during hot weather. Avoid caffeinated and alcoholic beverages which cause dehydration.',
    metadata: { source: 'Nutrition and Hydration Board', category: 'hydration' }
  },
  {
    content: 'Indoor air quality management: Use HEPA filters, keep windows closed during high pollution periods, and maintain 40-60% humidity levels.',
    metadata: { source: 'Indoor Air Quality Council', category: 'indoor_health' }
  },
  {
    content: 'Exercise during climate stress: Choose early morning (6-8 AM) or evening (after 6 PM) for outdoor activities. Monitor heart rate and stop if feeling dizzy.',
    metadata: { source: 'Sports Medicine Institute', category: 'exercise' }
  },
  {
    content: 'Diabetes management in hot weather: Heat affects blood sugar levels. Check glucose more frequently and store insulin properly in cool conditions.',
    metadata: { source: 'Diabetes Care Foundation', category: 'diabetes' }
  },
  {
    content: 'Pregnant women are vulnerable to heat stress and air pollution. Avoid prolonged outdoor exposure and maintain regular prenatal checkups.',
    metadata: { source: 'Maternal Health Organization', category: 'pregnancy' }
  },
  {
    content: 'Mental health impacts: Climate anxiety and heat stress can worsen depression and anxiety. Practice stress management and seek support when needed.',
    metadata: { source: 'Mental Health Climate Initiative', category: 'mental_health' }
  },
  {
    content: 'Emergency signs requiring immediate medical attention: confusion, rapid heartbeat, nausea, severe headache, difficulty breathing. Call emergency services immediately.',
    metadata: { source: 'Emergency Medicine Guidelines', category: 'emergency' }
  },
  {
    content: 'Sustainable lifestyle reduces climate impact: Use public transport, reduce meat consumption, conserve water, and minimize plastic use.',
    metadata: { source: 'Environmental Health Institute', category: 'sustainability' }
  },
  {
    content: 'Air pollution and immunity: Long-term exposure to poor air quality weakens immune system. Boost immunity with vitamin C, D, and antioxidant-rich foods.',
    metadata: { source: 'Immunology Research Center', category: 'immunity' }
  },
  {
    content: 'Sleep quality in hot weather: Maintain room temperature at 18-22°C, use breathable fabrics, and avoid heavy meals before bedtime.',
    metadata: { source: 'Sleep Medicine Society', category: 'sleep' }
  },
  {
    content: 'Food safety during heat: Refrigerate perishables immediately. Bacteria multiply rapidly in warm conditions. Avoid street food during heat waves.',
    metadata: { source: 'Food Safety Authority', category: 'food_safety' }
  },
  {
    content: 'Water-borne disease prevention: Boil water during floods and monsoons. Climate change increases contamination risk. Use water purification methods.',
    metadata: { source: 'Water Health Organization', category: 'waterborne' }
  }
];

const buildEmbeddings = async () => {
  try {
    logger.info('Starting embeddings build process...');

    const vectorStore = getVectorStore();

    logger.info(`Processing ${sampleHealthDocuments.length} documents...`);

    await vectorStore.addDocuments(sampleHealthDocuments);

    logger.info('✅ Embeddings built successfully!');
    logger.info(`Added ${sampleHealthDocuments.length} health documents to vector store`);
    logger.info('Vector store is ready for RAG queries');

    process.exit(0);
  } catch (error) {
    logger.error('Build embeddings error:', error);
    process.exit(1);
  }
};

buildEmbeddings();