import React from 'react';
import { Grid, TableContainer, Table, TableCell, TableRow, TableHead, TableBody, Button } from '@material-ui/core';
import { Pagination } from '@material-ui/lab';
import { IndicatorInfoDialog } from './IndicatorInfo';

interface IndicatorListState {
  list: Indicator[];
  total_pages: number;
};

interface IndicatorListProps {
  currentTopicFilter: number;
  currentGeneralSubjectFilter: number;
  query: string;
};

export const IndicatorList = (props: IndicatorListProps) => {
  const [Indicators, updateIndicators] = React.useState<IndicatorListState>({
    list: [],
    total_pages: 0
  });
  const [currentPage, updateCurrentPage] = React.useState(1);
  const [currentIndicator, updateCurrentIndicator] = React.useState(0);
  const [openModal, updateOpenModal] = React.useState(false);
  
  const queryIndicators = async () => {
    try {
      const response = await fetch(`/api/indicators?query=${props.query}&topic=${props.currentTopicFilter}&general_subject=${props.currentGeneralSubjectFilter}&page=${currentPage}`);
      const body = await response.json();
      if (response.status !== 200) {
        throw Error(body.err);
      }
      updateIndicators({ list: body.data, total_pages: body.total_pages })
    } catch (err) {
      console.error(err);
    }
  };

  React.useEffect(() => {
    updateCurrentPage(1);
    updateCurrentIndicator(0);
  }, [props.currentGeneralSubjectFilter, props.currentTopicFilter, props.query]);

  React.useEffect(() => {
    queryIndicators();
  }, [props.currentGeneralSubjectFilter, props.currentTopicFilter, props.query, currentPage]);


  const IndicatorRows = Indicators.list.map((indicator, index) => (
    <TableRow key={indicator.code}>
      <TableCell>{indicator.name}</TableCell>
      <TableCell>{indicator.code}</TableCell>
      <TableCell>
        <Button onClick={() => { updateCurrentIndicator(index); updateOpenModal(true); }}>More Info</Button>
      </TableCell>
    </TableRow>
  ));

  const IndicatorModal = (
    Indicators.list.length !== 0 ?
      <IndicatorInfoDialog
        indicator={Indicators.list[currentIndicator]}
        open={openModal}
        onClose={() => updateOpenModal(false)}
      /> :
      null
  );

  return (
    <Grid container direction={'column'}>
      { IndicatorModal }
      <Grid item>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Indicator Name</TableCell>
                <TableCell>Indicator Code</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              { IndicatorRows }
            </TableBody>
          </Table>
        </TableContainer>  
      </Grid>
      <Grid container justify={'center'} alignItems={'center'} style={{ padding: '1em' }}>
        <Pagination
          style={{ display: Indicators.total_pages <= 1 ? 'none' : 'initial' }}
          page={currentPage} 
          count={Indicators.total_pages} 
          onChange={(event, value) => updateCurrentPage(value)} 
          color={'primary'}
        />
      </Grid>   
    </Grid>
  )
};