import { pool } from './models';
import fs from 'fs';
import path from 'path';
import csvparser from 'csv-parse';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

(async() => {
  const promisePool = pool.promise();
  const file = path.resolve(__dirname, '../Frontier Programming Challenge/World Bank-CHN.csv');
  const stream = fs.createReadStream(file);
  const csvstream = stream.pipe(csvparser({ columns: true }));

  for await (const row of csvstream) {
    try {
      const indicator_name = row['Indicator Name'] as string;
      const indicator_code = row['Indicator Code'] as string;

      delete row['Indicator Name'];
      delete row['Indicator Code'];

      let new_indicator_id: number;

      const [new_indicator] = await promisePool.query(
        'SELECT id FROM indicators WHERE name = ?',
        [indicator_name]
      );
      const created_indicator_rows = (new_indicator as RowDataPacket[]);
      if (created_indicator_rows.length === 0) {
        const [new_indicator] = await promisePool.execute(
          'INSERT INTO indicators (name, code) VALUES (?, ?)', 
          [indicator_name, indicator_code]
        );  
        new_indicator_id = (new_indicator as ResultSetHeader).insertId;
      } else {
        new_indicator_id = created_indicator_rows[0].id;
      }

      for (const year in row) {
        if (!row[year]) {
          continue;
        }
        const [new_indicator_information] = await promisePool.query(
          'SELECT * from indicator_information WHERE indicator_id = ? AND year = ?',
          [new_indicator_id, Number(year)]
        );
        const new_indicator_information_rows = (new_indicator_information as RowDataPacket[]);
        if (new_indicator_information_rows.length === 0) {
          await promisePool.execute(
            'INSERT INTO indicator_information (indicator_id, year, value) VALUES (?, ?, ?)',
            [new_indicator_id, Number(year), Number(row[year])]
          );
        }
      }

      // Split parts of code into there respective names
      const code_parts = indicator_code.split('.');
      const specific_subject_code = code_parts.splice(2, code_parts.length).join('.');
      const [ topic_code, general_subject_code ] = code_parts;

      let created_topic_id: number;
      const [created_topic] = await promisePool.query(
        'SELECT id FROM topics WHERE code = ?',
        [topic_code]
      );
      const created_topic_rows = (created_topic as RowDataPacket[]);
      if (created_topic_rows.length === 0) {
        const [created_topic] = await promisePool.execute(
          'INSERT INTO topics (code, name) VALUES (?, ?)',
          [topic_code, '']
        );
        created_topic_id = (created_topic as ResultSetHeader).insertId; 
      } else {
        created_topic_id = created_topic_rows[0].id;
      }

      let created_general_subject_id: number;
      const [created_general_subject] = await promisePool.query(
        'SELECT id FROM general_subjects WHERE code = ? AND topic_id = ?',
        [general_subject_code, created_topic_id]
      ); 
      const created_general_subject_rows = (created_general_subject as RowDataPacket[]);
      if (created_general_subject_rows.length === 0) {
        const [created_general_subject] = await promisePool.execute(
          'INSERT INTO general_subjects (code, topic_id, name) VALUES (?, ?, ?)',
          [general_subject_code, created_topic_id, '']
        );
        created_general_subject_id = (created_general_subject as ResultSetHeader).insertId;
      } else {
        created_general_subject_id = created_general_subject_rows[0].id;
      }

      const [created_specific_subject] = await promisePool.query(
        'SELECT * FROM specific_subjects WHERE code = ? AND indicator_id = ?',
        [specific_subject_code, new_indicator_id]
      );
      const created_specific_subject_rows = (created_specific_subject as RowDataPacket[]);
      if (created_specific_subject_rows.length === 0) {
        await promisePool.execute(
          'INSERT INTO specific_subjects (code, general_subject_id, indicator_id) VALUES (?, ?, ?)',
          [specific_subject_code, created_general_subject_id, new_indicator_id]
        );
        console.log(`Created new indicator: ${indicator_name} ${new_indicator_id}`)
      } else {
        console.log(`Skipped duplicate indicator: ${indicator_name}`)
      }
    } catch (err) {
      console.log(err);
      process.exit(1);
    }  
  }
  console.log('Data scrape completed');
  process.exit(0);
})();