import React from 'react';
import { Checkbox, FormControlLabel, Grid, Switch } from '@material-ui/core';
import { Pagination } from '@material-ui/lab';

interface ListState {
  list: Topic[] | GeneralSubject[];
  total_pages: number;
}

interface ListCheckBoxProps {
  item: Topic | GeneralSubject;
  checked: boolean;
  onChange: React.Dispatch<React.SetStateAction<number>>;
};

const ListCheckBox = (props:ListCheckBoxProps) => {
  return (
    <FormControlLabel
      onChange={() => props.onChange(props.checked ? 0 : props.item.id)}
      control={<Checkbox checked={props.checked} color={'primary'} />}
      label={props.item.code}
    />
  );
};

interface ListFilterProps {
  style?: React.CSSProperties;
  currentFilter: number;
  ListType: string;
  retrieveList: (page: number) => Promise<ListState | undefined>;
  updateFilter: React.Dispatch<React.SetStateAction<number>>;
  retrieveListDependencies: any[];
};

export const ListFilter = (props: ListFilterProps) => {
  const [ListInfo, updateListInfo] = React.useState<ListState>({
    list: [],
    total_pages: 0
  });
  const [currentPage, updateCurrentPage] = React.useState(1);
  const [displayList, updateDisplayList] = React.useState(false);

  const updateListState = async (page: number) => {
    const newState = await props.retrieveList(page);
    if (newState) {
      updateListInfo({ ...newState });
      props.updateFilter(0);
    }
  };

  React.useEffect(() => {
    if (!displayList) {
      props.updateFilter(0);
    }
  }, [displayList]);

  React.useEffect(() => { 
    if (displayList) {
      updateListState(currentPage);
    }
  }, [currentPage, ...props.retrieveListDependencies, displayList]);

  const checkboxes = React.useMemo(() => {
    const a: JSX.Element[] = [];
    for (let item of ListInfo.list) {
      a.push(
        <ListCheckBox
          onChange={props.updateFilter}
          key={item.code}
          item={item}
          checked={item.id === props.currentFilter}
        />
      )
    }
    return a;
  }, [props.currentFilter, ListInfo.list, props.updateFilter]);

  return (
    <Grid container direction={'column'} justify={'center'} alignItems={'center'} style={props.style}>
      <Grid container direction={'row'} spacing={10} alignItems={'center'}>
        <Grid item>
          <h3>Filter by {props.ListType}</h3>
        </Grid>
        <Grid item>
          <FormControlLabel
            value={displayList}
            control={<Switch onChange={(event, value) => updateDisplayList(value)} color={'primary'} />}
            label={'Enable'}
          />
        </Grid>
      </Grid>
      <Grid container style={{ display: displayList ? 'initial' : 'none' }}>
        <Grid container>
          {displayList ? checkboxes : null}
        </Grid>
        <Grid container justify={'center'}>
          <Pagination
            style={{ display: ListInfo.total_pages <= 1 ? 'none' : 'initial' }}
            page={currentPage} 
            count={ListInfo.total_pages} 
            onChange={(event, value) => updateCurrentPage(value)} 
            color={'primary'}
          />  
        </Grid>
      </Grid>
    </Grid>
  );
};