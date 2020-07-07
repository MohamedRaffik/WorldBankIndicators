import React from 'react';
import { ListFilter } from './Filter';

interface GeneralSubjectFilterProps {
  style?: React.CSSProperties;
  currentGeneralSubjectFilter: number;
  currentTopicFilter: number;
  updateCurrentGeneralSubjectFilter: React.Dispatch<React.SetStateAction<number>>;
};

export const GeneralSubjectFilter = (props: GeneralSubjectFilterProps) => {
  const getGeneralSubjects = async (page: number) => {
    try {
      const response = await fetch(`/api/topics/${props.currentTopicFilter}/generalsubjects?page=${page}`);
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
      style={props.style}
      currentFilter={props.currentGeneralSubjectFilter}
      updateFilter={props.updateCurrentGeneralSubjectFilter}
      ListType={`General Subject for Topic`}
      retrieveList={getGeneralSubjects}
      retrieveListDependencies={[props.currentTopicFilter]}
    />
  );
};