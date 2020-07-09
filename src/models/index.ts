import { createPool, RowDataPacket } from 'mysql2';

export const pool = createPool({ uri: process.env.DATABASE_URL });

const calcOffset = (items_amount: number, page: number) => items_amount * (!page ? 0 : page - 1);

export const queryIndicators = async (query: string, page: number, items_amount: number) => {
  const promisePool = pool.promise();
  const results = { 
    rows: [] as RowDataPacket[], 
    count: 0 as number, 
  };

  const [indicators] = await promisePool.query(
    'SELECT indicators.id, indicators.name, indicators.code FROM indicators WHERE ( \
      indicators.name LIKE ? OR indicators.code LIKE ? \
    ) ORDER BY indicators.id ASC LIMIT ? OFFSET ?',
    [query, query, items_amount, calcOffset(items_amount, page)] 
  );
  results.rows = (indicators as RowDataPacket[]);
  const [indicators_count] = await promisePool.query(
    'SELECT COUNT(indicators.id) AS count from indicators WHERE ( \
      indicators.name LIKE ? OR indicators.code LIKE ? \
    )',
    [query, query]
  );
  results.count = Number((indicators_count as RowDataPacket[])[0].count);
  return results;
};

export const queryIndicatorsByGeneralSubject = async (query: string, page: number, items_amount: number, general_subject: number) => {
  const promisePool = pool.promise();
  const results = { 
    rows: [] as RowDataPacket[], 
    count: 0 as number, 
  };

  const [indicators] = await promisePool.query(
    'SELECT indicators.id, indicators.name, indicators.code FROM ( \
        SELECT specific_subjects.indicator_id FROM specific_subjects WHERE specific_subjects.general_subject_id = ? \
    ) as specific_subjects JOIN indicators on specific_subjects.indicator_id = indicators.id WHERE ( \
      indicators.name LIKE ? OR indicators.code LIKE ? \
    ) ORDER BY indicators.id ASC LIMIT ? OFFSET ?',
    [general_subject, query, query, items_amount, calcOffset(items_amount, page)] 
  );
  results.rows = (indicators as RowDataPacket[]);
  const [indicators_count] = await promisePool.query(
    'SELECT COUNT(indicators.id) FROM ( \
      SELECT specific_subjects.indicator_id FROM specific_subjects WHERE specific_subjects.general_subject_id = ? \
    ) as specific_subjects JOIN indicators on specific_subjects.indicator_id = indicators.id WHERE ( \
      indicators.name LIKE ? OR indicators.code LIKE ? \
    )',
    [general_subject, query, query]
  );
  results.count = Number((indicators_count as RowDataPacket[])[0].count);
  return results;
};

export const queryIndicatorsByTopic = async (query: string, page: number, items_amount: number, topic: Number) => {
  const promisePool = pool.promise();
  const results = { 
    rows: [] as RowDataPacket[], 
    count: 0 as number, 
  };

  const [indicators] = await promisePool.query(
    'SELECT indicators.id, indicators.name, indicators.code FROM ( \
        SELECT specific_subjects.indicator_id FROM specific_subjects JOIN ( \
          SELECT general_subjects.id FROM general_subjects WHERE topic_id = ? \
        ) as general_subjects WHERE specific_subjects.general_subject_id = general_subjects.id \
    ) as specific_subjects JOIN indicators on specific_subjects.indicator_id = indicators.id WHERE ( \
      indicators.name LIKE ? OR indicators.code LIKE ? \
    ) ORDER BY indicators.id ASC LIMIT ? OFFSET ?',
    [topic, query, query, items_amount, calcOffset(items_amount, page)] 
  );
  results.rows = (indicators as RowDataPacket[]);
  const [indicators_count] = await promisePool.query(
    'SELECT COUNT(indicators.id) FROM ( \
      SELECT specific_subjects.indicator_id FROM specific_subjects JOIN ( \
        SELECT general_subjects.id FROM general_subjects WHERE topic_id = ? \
      ) as general_subjects WHERE specific_subjects.general_subject_id = general_subjects.id \
    ) as specific_subjects JOIN indicators on specific_subjects.indicator_id = indicators.id WHERE ( \
      indicators.name LIKE ? OR indicators.code LIKE ? \
    )',
    [topic, query, query] 
  );
  results.count = Number((indicators_count as RowDataPacket[])[0].count);
  return results;
};

export const queryTopics = async (page: number, items_amount: number) => {
  const promisePool = pool.promise();
  const results = { 
    rows: [] as RowDataPacket[], 
    count: 0 as number, 
  };

  const [topics] = await promisePool.query(
    'SELECT topics.id, topics.code, topics.name FROM topics ORDER BY topics.id ASC LIMIT ? OFFSET ?',
    [items_amount, calcOffset(items_amount, page)]
  );
  results.rows = (topics as RowDataPacket[]);
  const [topics_count] = await promisePool.query(
    'SELECT COUNT(topics.id) as count FROM topics'
  );
  results.count = Number((topics_count as RowDataPacket[])[0].count);
  return results;
};

export const queryGeneralSubjects = async (topic_id: number, page: number, items_amount: number) => {
  const promisePool = pool.promise();
  const results = { 
    rows: [] as RowDataPacket[], 
    count: 0 as number, 
  };

  const [general_subjects] = await promisePool.query(
    'SELECT general_subjects.id, general_subjects.code, general_subjects.name FROM general_subjects WHERE general_subjects.topic_id = ? ORDER BY general_subjects.id ASC LIMIT ? OFFSET ?',
    [topic_id, 25, calcOffset(25, page)]
  );
  results.rows = (general_subjects as RowDataPacket[]);
  const [general_subjects_count] = await promisePool.query(
    'SELECT COUNT(general_subjects.id) as count FROM general_subjects WHERE general_subjects.topic_id = ?',
    [topic_id]
  );
  results.count = Number((general_subjects_count as RowDataPacket[])[0].count);
  return results;
};

export const queryIndicatorInformation = async (indicator_id: number, page: number, items_amount: number) => {
  const promisePool = pool.promise();
  const results = { 
    rows: [] as RowDataPacket[], 
    count: 0, 
    oldest_recorded_year: 0,
    last_recorded_year: 0
  };

  const [indicator_information] = await promisePool.query(
    'SELECT indicator_information.id, indicator_information.year, indicator_information.value FROM indicator_information \
    WHERE indicator_information.indicator_id = ? ORDER BY indicator_information.year LIMIT ? OFFSET ?',
    [indicator_id, 10, calcOffset(10, page)]
  );
  results.rows = (indicator_information as RowDataPacket[]);
  const [indicator_information_count] = await promisePool.query(
    'SELECT indicator_information.id, indicator_information.year, indicator_information.value FROM indicator_information \
    WHERE indicator_information.indicator_id = ?',
    [indicator_id]
  );
  results.count = Number((indicator_information_count as RowDataPacket[])[0].count);
  const [oldest_recorded_year] = await promisePool.query(
    'SELECT MIN(indicator_information.year) as year FROM indicator_information WHERE indicator_information.indicator_id = ?',
    [indicator_id]
  );
  results.oldest_recorded_year = (oldest_recorded_year as RowDataPacket[])[0].year;
  const [last_recorded_year] = await promisePool.query(
    'SELECT MAX(indicator_information.year) as year FROM indicator_information WHERE indicator_information.indicator_id = ?',
    [indicator_id]
  );
  results.last_recorded_year = (last_recorded_year as RowDataPacket[])[0].year;
  return results;
};