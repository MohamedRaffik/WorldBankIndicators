import express from 'express';
import { 
  queryGeneralSubjects,
  queryIndicatorInformation,
  queryIndicators,
  queryIndicatorsByGeneralSubject,
  queryIndicatorsByTopic,
  queryTopics
} from '../models';

export const searchIndicators = async (req: express.Request, res: express.Response) => {
  const query = `%${req.query.query}%`
  const topic = Number(req.query.topic);
  const general_subject = Number(req.query.general_subject);
  const page = Number(req.query.page);

  if (isNaN(Number(page)) && page !== undefined) {
    return res.status(400).json({ error: 'Incorrect parameter for page' });
  }

  let results;

  try {
    if (!topic && !general_subject) {
      results = await queryIndicators(query, page, 25);
    } else if (general_subject) {
      results = await queryIndicatorsByGeneralSubject(query, page, 25, general_subject);
    } else {
      results = await queryIndicatorsByTopic(query, page, 25, topic);
    }
    return res.status(200).json({ data: results.rows, total_pages: Math.ceil(results.count / 25) });  
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Failed to query indicators' });
  }
};

export const getAllTopics = async (req: express.Request, res: express.Response) => {
  const page = Number(req.query.page);
  if (isNaN(Number(page)) && page !== undefined) {
    return res.status(400).json({ error: 'Incorrect parameter for page' });
  }

  try {
    const results = await queryTopics(page, 25);
    return res.status(200).json({ data: results.rows, total_pages: Math.ceil(results.count / 25) });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Failed to query Topics' });
  } 
};

export const getAllGeneralSubjects = async (req: express.Request, res: express.Response) => {
  const page = Number(req.query.page);
  const { topic_id } = req.params;
  if (isNaN(Number(page)) && page !== undefined) {
    return res.status(400).json({ error: 'Incorrect parameter for page' });
  }

  try {
    const results = await queryGeneralSubjects(Number(topic_id), page, 25);
    return res.status(200).json({ data: results.rows, total_pages: Math.ceil(results.count / 25) });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to query General Subjects' });
  } 
};

export const getIndicatorInformation = async (req: express.Request, res: express.Response) => {
  const page = Number(req.query.page);
  const { indicator_id } = req.params;
  if (isNaN(Number(page)) && page !== undefined) {
    return res.status(400).json({ error: 'Incorrect parameter for page' });
  }

  try {
    const results = await queryIndicatorInformation(Number(indicator_id), page, 10);
    return res.status(200).json({ 
      oldest_recorded_year: results.oldest_recorded_year,
      last_recorded_year: results.last_recorded_year,
      data: results.rows, 
      total_pages: Math.ceil(results.count / 10) 
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retrieve Indicator Information' });
  }
};