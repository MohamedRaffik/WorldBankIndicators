import React from 'react';
import { TextField } from '@material-ui/core';
import { TopicFilter, GeneralSubjectFilter, IndicatorList } from './components';

const App = () => {
  const [currentTopicFilter, updateCurrentTopicFilter] = React.useState(0);
  const [currentGeneralSubjectFilter, updateGeneralSubjectFilter] = React.useState(0);
  const [currentQuery, updateCurrentQuery] = React.useState('');

  return (
    <div>
      <header style={{ fontSize: '5em', width: '90%', margin: 'auto' }}>World Bank</header>
      <div style={{ backgroundColor: 'green', height: '3em' }}></div>
      <div style={{ width: '80%', marginLeft: 'auto', marginRight: 'auto', justifyContent: 'center' }}>
        <h2>Indicators</h2>
        <TextField 
          value={currentQuery}
          onChange={event => updateCurrentQuery(event.target.value)}
          style={{ width: '90%', margin: '1em' }} 
          placeholder={'Search Indicators by name or code'}
        />
        <TopicFilter 
          currentTopicFilter={currentTopicFilter} 
          updateCurrentTopicFilter={updateCurrentTopicFilter} 
        />
        <GeneralSubjectFilter 
          style={{ display: currentTopicFilter !== 0 ? 'initial' : 'none' }}
          currentGeneralSubjectFilter={currentGeneralSubjectFilter} 
          currentTopicFilter={currentTopicFilter} 
          updateCurrentGeneralSubjectFilter={updateGeneralSubjectFilter} 
        />
        <IndicatorList 
          currentTopicFilter={currentTopicFilter} 
          currentGeneralSubjectFilter={currentGeneralSubjectFilter}
          query={currentQuery}
        />
      </div>
    </div>
  );
};

export default App;
