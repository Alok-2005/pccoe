// File: server/src/controllers/environment.controller.ts
import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { getEnvironmentData } from '../services/weather.service';
import { logger } from '../utils/logger';

export const getByCity = async (req: Request, res: Response) => {
  try {
    const { city } = req.params;

    if (!city) {
      return res.status(400).json({ error: 'City is required' });
    }

    const data = await getEnvironmentData(city);

    res.json(data);
  } catch (error) {
    logger.error('Get environment by city error:', error);
    res.status(500).json({ error: 'Failed to get environment data' });
  }
};

export const getByCoordinates = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { lat, lng } = req.query;

    const data = await getEnvironmentData(undefined, {
      lat: parseFloat(lat as string),
      lng: parseFloat(lng as string)
    });

    res.json(data);
  } catch (error) {
    logger.error('Get environment by coordinates error:', error);
    res.status(500).json({ error: 'Failed to get environment data' });
  }
};