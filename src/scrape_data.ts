import { 
  Indicator, 
  IndicatorInformation, 
  Topic, 
  GeneralSubject, 
  SpecificSubject, 
} from './models';
import * as fs from 'fs';
import * as path from 'path';
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

      const new_indicator = await Indicator.create({ name: indicator_name });

      for (const year in row) {
        if (!row[year]) {
          continue;
        }
        const created_indicator_info = await IndicatorInformation.findOne({ where: { indicator: new_indicator.id, year: Number(year) } });
        if (!created_indicator_info) {
          await IndicatorInformation.create({ 
            indicator: new_indicator.id, 
            year: Number(year), 
            value: Number(row[year])
          });
        }
      }

      // Split parts of code into there respective names
      const code_parts = indicator_code.split('.');
      const specific_subject_code = code_parts.splice(2, code_parts.length).join('.');
      const [ topic_code, general_subject_code ] = code_parts;
      
      // Create topic if the topic does not already exist
      let created_topic = await Topic.findOne({ where: { code: topic_code } });
      if (!created_topic) {
        created_topic = await Topic.create({ code: topic_code, name: '' });
      }

      // Create the general subject if the general subject does not already exist
      let created_general_subject = await GeneralSubject.findOne({ 
        where: { code: general_subject_code, topic: created_topic.id } 
      });
      if (!created_general_subject) {
        created_general_subject = await GeneralSubject.create({ code: general_subject_code, topic: created_topic.id, name: '' });
      }

      // Create the specific subject if the specific subject does not exist
      // Add indicator to subject if the code ends in the specific subject
      let created_specific_subject = await SpecificSubject.findOne({ 
        where: { code: specific_subject_code, general_subject: created_general_subject.id } 
      });
      if (!created_specific_subject) {
        created_specific_subject = await SpecificSubject.create({ 
          code: specific_subject_code, 
          general_subject: created_general_subject.id, 
          indicator: new_indicator.id
        })
      }

      console.log(`Created new indicator: ${indicator_name}`)
    } catch (err) {
      console.log(err);
      process.exit(1);
    }  
  }
})();