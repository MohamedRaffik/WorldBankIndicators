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

      const [new_indicator] = await promisePool.execute(
        'INSERT INTO indicators (name, code) VALUES (?, ?)', 
        [indicator_name, indicator_code]
      );

      const new_indicator_id = (new_indicator as ResultSetHeader).insertId;

      for (const year in row) {
        if (!row[year]) {
          continue;
        }
        await promisePool.execute(
          'INSERT INTO indicator_information (indicator_id, year, value) VALUES (?, ?, ?)',
          [new_indicator_id, Number(year), Number(row[year])]
        );
      }

      // Split parts of code into there respective names
      const code_parts = indicator_code.split('.');
      const specific_subject_code = code_parts.splice(2, code_parts.length).join('.');
      const [ topic_code, general_subject_code ] = code_parts;

      let created_topic_id: number;

      try {
        const [created_topic] = await promisePool.execute(
          'INSERT INTO topics (code, name) VALUES (?, ?)',
          [topic_code, '']
        );
        created_topic_id = (created_topic as ResultSetHeader).insertId; 
      } catch (err) {
        const [created_topic] = await promisePool.query(
          'SELECT id FROM topics WHERE code = ?',
          [topic_code]
        );
        created_topic_id = (created_topic as RowDataPacket[])[0].id
      }

      let created_general_subject_id: number;

      try {
        const [created_general_subject] = await promisePool.execute(
          'INSERT INTO general_subjects (code, topic_id, name) VALUES (?, ?, ?)',
          [general_subject_code, created_topic_id, '']
        );
        created_general_subject_id = (created_general_subject as ResultSetHeader).insertId;
      } catch (err) {
        const [created_general_subject] = await promisePool.query(
          'SELECT id FROM general_subjects WHERE code = ?',
          [general_subject_code]
        ); 
        created_general_subject_id = (created_general_subject as RowDataPacket[])[0].id;
      }

      await promisePool.execute(
        'INSERT INTO specific_subjects (code, general_subject_id, indicator_id) VALUES (?, ?, ?)',
        [specific_subject_code, created_general_subject_id, new_indicator_id]
      );
      
      console.log(`Created new indicator: ${indicator_name} ${new_indicator_id}`)
    } catch (err) {
      console.log(err);
      process.exit(1);
    }  
  }
  console.log('Data scrape completed');
  process.exit(0);
})();