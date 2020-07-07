import React from 'react';
import { ListFilter } from './Filter';

interface TopicFilterProps {
  currentTopicFilter: number;
  updateCurrentTopicFilter: React.Dispatch<React.SetStateAction<number>>;
};

export const TopicFilter = (props: TopicFilterProps) => {
  const getTopics = async (page: number) => {
    try {
      const response = await fetch(`/api/topics?page=${page}`);
      const body = await response.json();
      if (response.status !== 200) {
        throw Error(body.error);
      }
      return { list: body.data, total_pages: body.total_pages };
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <ListFilter 
      currentFilter={props.currentTopicFilter}
      updateFilter={props.updateCurrentTopicFilter}
      ListType={'Topic'}
      retrieveList={getTopics}
      retrieveListDependencies={[]}
    />
  );
};