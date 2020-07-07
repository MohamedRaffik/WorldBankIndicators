import express from 'express';
import { Op } from 'sequelize';
import { Indicator, SpecificSubject, GeneralSubject, Topic, IndicatorInformation } from '../models';

export const searchIndicators = async (req: express.Request, res: express.Response) => {
  const { query, page } = req.query;
  const topic = Number(req.query.topic);
  const general_subject = Number(req.query.general_subject);

  if (isNaN(Number(page)) && page !== undefined) {
    return res.status(400).json({ error: 'Incorrect parameter for page' });
  }

  try {
    let results;

    const indicator_or = {
      [Op.or]: {
        name: { [Op.like]: `%${query}%` },
        code: { [Op.like]: `%${query}%` }
      }
    };

    if (!topic && !general_subject) {
      results = await Indicator.findAndCountAll({
        attributes: ['id', 'name', 'code'],
        order: [['id', 'ASC']],
        where: indicator_or,
        limit: 25,
        offset: 25 * (!Number(page) ? 0 : Number(page) - 1),
      })
    } else if (general_subject) {
      const {rows, count} = await SpecificSubject.findAndCountAll({
        attributes: ['Indicator.*'],
        order: [['id', 'ASC']],
        where: { general_subject_id: general_subject },
        limit: 25,
        offset: 25 * (!Number(page) ? 0 : Number(page) - 1),
        include: {
          association: SpecificSubject.associations.Indicator,
          where: indicator_or
        }  
      });
      results = {
        rows: rows.map(specific_subject => specific_subject.get('Indicator')),
        count
      };
    } else {
      const general_subject_ids = (await GeneralSubject.findAll({ where: { topic_id: topic } })).map(row => row.id);
      const {rows, count} = await SpecificSubject.findAndCountAll({
        attributes: ['Indicator.*'],
        order: [['id', 'ASC']],
        where: { general_subject_id: { [Op.in]: general_subject_ids } },
        limit: 25,
        offset: 25 * (!Number(page) ? 0 : Number(page) - 1),
        include: {
          association: SpecificSubject.associations.Indicator,
          where: indicator_or
        }  
      });
      results = {
        rows: rows.map(specific_subject => specific_subject.get('Indicator')),
        count
      };
    }
    return res.status(200).json({ data: results.rows, total_pages: Math.ceil(results.count / 25) });  
  } catch (err) {
    console.log(err);
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
      offset: 25 * (!Number(page) ? 0 : Number(page) - 1),
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
      offset: 25 * (!Number(page) ? 0 : Number(page) - 1),
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
      limit: 10,
      offset: 10 * (!Number(page) ? 0 : Number(page) - 1),
    });
    const oldest_recorded_year = await IndicatorInformation.min('year', { where: { indicator_id } });
    const last_recorded_year = await IndicatorInformation.max('year', { where: { indicator_id } });
    return res.status(200).json({ 
      oldest_recorded_year,
      last_recorded_year,
      data: results.rows, 
      total_pages: Math.ceil(results.count / 10) 
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retrieve Indicator Information' });
  }
};