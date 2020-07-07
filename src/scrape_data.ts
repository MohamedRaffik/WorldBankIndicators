import { 
  Indicator, 
  IndicatorInformation, 
  Topic, 
  GeneralSubject, 
  SpecificSubject, 
} from './models';
import fs from 'fs';
import path from 'path';
import csvparser from 'csv-parse';

(async() => {
  const file = path.resolve(__dirname, '../Frontier Programming Challenge/World Bank-CHN.csv');
  const stream = fs.createReadStream(file);
  const csvstream = stream.pipe(csvparser({ columns: true }));

  for await (const row of csvstream) {
    try {
      const indicator_name = row['Indicator Name'] as string;
      const indicator_code = row['Indicator Code'] as string;

      delete row['Indicator Name'];
      delete row['Indicator Code'];

      const [new_indicator] = await Indicator.findOrCreate({
        where: { name: indicator_name, code: indicator_code }
      }); 

      for (const year in row) {
        if (!row[year]) {
          continue;
        }
        await IndicatorInformation.findOrCreate({
          where: { indicator_id: new_indicator.id, year: Number(year) },
          defaults: { indicator_id: new_indicator.id, year: Number(year), value: Number(row[year]) }
        });
      }

      // Split parts of code into there respective names
      const code_parts = indicator_code.split('.');
      const specific_subject_code = code_parts.splice(2, code_parts.length).join('.');
      const [ topic_code, general_subject_code ] = code_parts;
      
      // Create topic if the topic does not already exist
      const [created_topic] = await Topic.findOrCreate({
        where: { code: topic_code },
        defaults: { code: topic_code, name: '' }
      });

      // Create the general subject if the general subject does not already exist
      const [created_general_subject] = await GeneralSubject.findOrCreate({
        where: { code: general_subject_code, topic_id: created_topic.id },
        defaults: { code: general_subject_code, topic_id: created_topic.id, name: '' }
      });

      // Create the specific subject if the specific subject does not exist and add indicator
      await SpecificSubject.findOrCreate({
        where: { code: specific_subject_code, general_subject_id: created_general_subject.id },
        defaults: { code: specific_subject_code, general_subject_id: created_general_subject.id, indicator_id: new_indicator.id }
      });

      console.log(`Created new indicator: ${indicator_name}`)
    } catch (err) {
      console.log(err);
      process.exit(1);
    }  
  }
})();