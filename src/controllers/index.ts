import express from 'express';
import { Op } from 'sequelize';
import { Indicator, SpecificSubject, GeneralSubject, Topic, IndicatorInformation } from '../models';

/**
 * 
 * @param req 
 * @param res 
 * 
 * Params
 * query - string
 * page - string that should convert to a number
 * topic - string that should convert to id of topic
 * general_subject - string that should convert to id of general subject
 */
export const searchIndicators = async (req: express.Request, res: express.Response) => {
  const { query, page, topic, general_subject } = req.query;
  if (isNaN(Number(page)) && page !== undefined) {
    return res.status(400).json({ error: 'Incorrect parameter for page' });
  }

  try {
    const results = await Indicator.findAndCountAll({
      attributes: ['id', 'name', 'code'],
      where: { 
        [Op.or]: {
          name: { [Op.like]: `%${query}%` },
          code: { [Op.like]: `%${query}%` }   
        }
      },
      order: [['id', 'ASC']],
      limit: 25,
      offset: 25 * (Number(page) > 0 ? Number(page) - 1 : 0),
      include: { 
        association: Indicator.associations.SpecificSubject, 
        required: true,
        include: [{
          association: SpecificSubject.associations.GeneralSubject,
          required: true,
          where: general_subject ? { id: general_subject } : {},
          include: [{
            association: GeneralSubject.associations.Topic,
            required: true,
            where: topic ? { id: topic } : {}
          }]
        }]
      }
    });
    return res.status(200).json({ data: results.rows, total_pages: Math.ceil(results.count / 25) });  
  } catch (err) {
    return res.status(500).json({ error: 'Failed to query indicators' });
  }
};

export const getAllTopics = async (req: express.Request, res: express.Response) => {
  const { page } = req.query;
  if (isNaN(Number(page)) && page !== undefined) {
    return res.status(400).json({ error: 'Incorrect parameter for page' });
  }

  try {
    const results = await Topic.findAndCountAll({
      order: [['id', 'ASC']],
      limit: 25,
      offset: 25 * (Number(page) > 0 ? Number(page) - 1 : 0) 
    });
    return res.status(200).json({ data: results.rows, total_pages: Math.ceil(results.count / 25) });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to query Topics' });
  } 
};

export const getAllGeneralSubjects = async (req: express.Request, res: express.Response) => {
  const { page } = req.query;
  const { topic_id } = req.params;
  if (isNaN(Number(page)) && page !== undefined) {
    return res.status(400).json({ error: 'Incorrect parameter for page' });
  }

  try {
    const results = await GeneralSubject.findAndCountAll({
      where: { topic_id: topic_id },
      order: [['id', 'ASC']],
      limit: 25,
      offset: 25 * (Number(page) > 0 ? Number(page) - 1 : 0) 
    });
    return res.status(200).json({ data: results.rows, total_pages: Math.ceil(results.count / 25) });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to query General Subjects' });
  } 
};

export const getIndicatorInformation = async (req: express.Request, res: express.Response) => {
  const { page } = req.query;
  const { indicator_id } = req.params;
  if (isNaN(Number(page)) && page !== undefined) {
    return res.status(400).json({ error: 'Incorrect parameter for page' });
  }

  try {
    const results = await IndicatorInformation.findAndCountAll({
      where: { indicator_id },
      order: [['year', 'ASC']],
      limit: 25,
      offset: 25 * (Number(page) > 0 ? Number(page) - 1 : 0) 
    });
    return res.status(200).json({ data: results.rows, total_pages: Math.ceil(results.count / 25) });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retrieve Indicator Information' });
  }
};