// File: server/src/services/weather.service.ts
import axios from 'axios';
import { logger } from '../utils/logger';
import { cacheGet, cacheSet } from '../config/redis';

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const MOCK_MODE = process.env.MOCK_MODE === 'true';

interface EnvironmentData {
  temperature: number;
  humidity: number;
  aqi: number;
  uvIndex: number;
  windSpeed: number;
  pressure: number;
  description: string;
  timestamp: Date;
}

// Mock data for testing without API key
const getMockData = (city?: string): EnvironmentData => {
  const baselines: { [key: string]: Partial<EnvironmentData> } = {
    'Pune': { temperature: 28, aqi: 85, uvIndex: 7 },
    'Mumbai': { temperature: 32, aqi: 120, uvIndex: 9 },
    'Delhi': { temperature: 35, aqi: 180, uvIndex: 10 },
    'Bangalore': { temperature: 26, aqi: 65, uvIndex: 6 }
  };

  const baseline = baselines[city || 'Pune'] || baselines['Pune'];
  
  return {
    temperature: baseline.temperature || 28,
    humidity: 65,
    aqi: baseline.aqi || 85,
    uvIndex: baseline.uvIndex || 7,
    windSpeed: 12,
    pressure: 1013,
    description: 'Partly cloudy',
    timestamp: new Date()
  };
};

export const getEnvironmentData = async (
  city?: string,
  coordinates?: { lat: number; lng: number }
): Promise<EnvironmentData> => {
  try {
    // Check cache first
    const cacheKey = `weather:${city || `${coordinates?.lat},${coordinates?.lng}`}`;
    const cached = await cacheGet(cacheKey);
    if (cached) {
      logger.info(`Returning cached weather data for ${city || 'coordinates'}`);
      return JSON.parse(cached);
    }

    // Return mock data if in mock mode or no API key
    if (MOCK_MODE || !OPENWEATHER_API_KEY) {
      logger.info('Using mock weather data');
      const mockData = getMockData(city);
      await cacheSet(cacheKey, JSON.stringify(mockData), 300);
      return mockData;
    }

    // Fetch from OpenWeather API
    let weatherUrl: string;
    if (city) {
      weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${OPENWEATHER_API_KEY}&units=metric`;
    } else if (coordinates) {
      weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${coordinates.lat}&lon=${coordinates.lng}&appid=${OPENWEATHER_API_KEY}&units=metric`;
    } else {
      throw new Error('Either city or coordinates must be provided');
    }

    const weatherResponse = await axios.get(weatherUrl);
    const weather = weatherResponse.data;

    // Fetch AQI data
    let aqi = 50; // Default moderate
    try {
      const aqiUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${weather.coord.lat}&lon=${weather.coord.lon}&appid=${OPENWEATHER_API_KEY}`;
      const aqiResponse = await axios.get(aqiUrl);
      aqi = aqiResponse.data.list[0].main.aqi * 50; // Convert to 0-500 scale
    } catch (aqiError) {
      logger.warn('Failed to fetch AQI data, using default');
    }

    // Fetch UV index
    let uvIndex = 5; // Default moderate
    try {
      const uvUrl = `https://api.openweathermap.org/data/2.5/uvi?lat=${weather.coord.lat}&lon=${weather.coord.lon}&appid=${OPENWEATHER_API_KEY}`;
      const uvResponse = await axios.get(uvUrl);
      uvIndex = uvResponse.data.value;
    } catch (uvError) {
      logger.warn('Failed to fetch UV data, using default');
    }

    const data: EnvironmentData = {
      temperature: weather.main.temp,
      humidity: weather.main.humidity,
      aqi,
      uvIndex,
      windSpeed: weather.wind.speed,
      pressure: weather.main.pressure,
      description: weather.weather[0].description,
      timestamp: new Date()
    };

    // Cache for 5 minutes
    await cacheSet(cacheKey, JSON.stringify(data), 300);

    logger.info(`Fetched weather data for ${city || 'coordinates'}`);
    return data;

  } catch (error) {
    logger.error('Weather service error:', error);
    // Fallback to mock data on error
    return getMockData(city);
  }
};