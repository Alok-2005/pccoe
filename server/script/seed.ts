// File: server/src/scripts/seed.ts
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';
import Family from '../models/Family';
import Prediction from '../models/Prediction';
import { logger } from '../utils/logger';

dotenv.config();

const seedData = async () => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/climate-health';
    await mongoose.connect(MONGODB_URI);
    
    logger.info('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Family.deleteMany({});
    await Prediction.deleteMany({});
    
    logger.info('Cleared existing data');

    // Create users
    const users = await User.create([
      {
        email: 'john.doe@example.com',
        password: 'password123',
        name: 'John Doe',
        role: 'citizen',
        location: {
          city: 'Pune',
          coordinates: { lat: 18.5204, lng: 73.8567 }
        },
        healthProfile: {
          age: 35,
          gender: 'male',
          comorbidities: [],
          allergies: [],
          medications: []
        }
      },
      {
        email: 'sarah.admin@example.com',
        password: 'password123',
        name: 'Sarah Admin',
        role: 'family_admin',
        location: {
          city: 'Mumbai',
          coordinates: { lat: 19.0760, lng: 72.8777 }
        },
        healthProfile: {
          age: 42,
          gender: 'female',
          comorbidities: ['Asthma'],
          allergies: ['Pollen'],
          medications: ['Inhaler']
        }
      },
      {
        email: 'ngo.admin@example.com',
        password: 'password123',
        name: 'NGO Administrator',
        role: 'ngo_admin',
        location: {
          city: 'Delhi',
          coordinates: { lat: 28.7041, lng: 77.1025 }
        },
        healthProfile: {
          age: 50,
          gender: 'male',
          comorbidities: [],
          allergies: [],
          medications: []
        }
      }
    ]);

    logger.info(`Created ${users.length} users`);

    // Create family for Sarah
    const family = await Family.create({
      name: 'Admin Family',
      adminUserId: users[1]._id,
      members: [
        {
          name: 'Emma Admin',
          age: 8,
          relation: 'Daughter',
          healthProfile: {
            comorbidities: [],
            allergies: ['Nuts']
          }
        },
        {
          name: 'Robert Admin',
          age: 72,
          relation: 'Father',
          healthProfile: {
            comorbidities: ['Diabetes', 'Hypertension'],
            allergies: []
          }
        }
      ],
      sharedLocation: {
        city: 'Mumbai',
        coordinates: { lat: 19.0760, lng: 72.8777 }
      }
    });

    // Update Sarah's familyId
    users[1].familyId = family._id;
    await users[1].save();

    logger.info('Created family group');

    // Create sample predictions
    const predictions = await Prediction.create([
      {
        userId: users[0]._id,
        location: {
          city: 'Pune',
          coordinates: { lat: 18.5204, lng: 73.8567 }
        },
        environmentData: {
          temperature: 32,
          humidity: 60,
          aqi: 95,
          uvIndex: 8,
          windSpeed: 10,
          pressure: 1012,
          description: 'Partly cloudy'
        },
        riskScores: {
          overall: 62,
          heatwave: 55,
          airQuality: 65,
          uvExposure: 70,
          disease: 58
        },
        evidence: [
          {
            source: 'WHO Guidelines',
            content: 'Moderate air quality may cause breathing discomfort for sensitive groups',
            relevanceScore: 0.85
          }
        ],
        recommendations: [
          {
            category: 'Air Quality',
            action: 'Limit prolonged outdoor activities',
            priority: 'medium'
          }
        ],
        explanation: 'Current conditions show moderate risk levels. Stay hydrated and avoid outdoor activities during peak hours.'
      },
      {
        userId: users[1]._id,
        location: {
          city: 'Mumbai',
          coordinates: { lat: 19.0760, lng: 72.8777 }
        },
        environmentData: {
          temperature: 34,
          humidity: 75,
          aqi: 145,
          uvIndex: 9,
          windSpeed: 8,
          pressure: 1010,
          description: 'Hazy'
        },
        riskScores: {
          overall: 78,
          heatwave: 72,
          airQuality: 85,
          uvExposure: 80,
          disease: 75
        },
        evidence: [
          {
            source: 'Air Quality Study',
            content: 'Poor air quality significantly increases respiratory health risks',
            relevanceScore: 0.92
          }
        ],
        recommendations: [
          {
            category: 'Air Quality',
            action: 'Wear N95 mask outdoors. Use air purifier indoors.',
            priority: 'critical'
          },
          {
            category: 'Heat Protection',
            action: 'Avoid outdoor activities between 11 AM - 4 PM',
            priority: 'high'
          }
        ],
        explanation: 'High risk due to poor air quality and elevated temperatures. Take immediate precautions, especially for family members with asthma.'
      }
    ]);

    logger.info(`Created ${predictions.length} predictions`);

    logger.info('✅ Seed data created successfully!');
    logger.info('\nTest accounts:');
    logger.info('1. Citizen: john.doe@example.com / password123');
    logger.info('2. Family Admin: sarah.admin@example.com / password123');
    logger.info('3. NGO Admin: ngo.admin@example.com / password123');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    logger.error('Seed error:', error);
    process.exit(1);
  }
};

seedData();