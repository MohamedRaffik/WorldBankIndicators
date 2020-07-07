import React from 'react';
import { Grid, TableRow, TableCell, TableContainer, TableHead, TableBody, Table, Dialog, DialogTitle, DialogContent } from '@material-ui/core';
import { Pagination } from '@material-ui/lab';

interface IndicatorInfoProps {
  indicator: Indicator;
  open: boolean;
  onClose: React.Dispatch<React.SetStateAction<boolean>>;
}

interface IndicatorInfoListState {
  list: IndicatorInfo[];
  total_pages: number;
  oldest_recorded_year: number,
  last_recorded_year: number,
};

export const IndicatorInfoDialog = (props: IndicatorInfoProps) => {
  const [IndicatorInfo, updateIndicatorInfo] = React.useState<IndicatorInfoListState>({
    list: [],
    oldest_recorded_year: (new Date(Date.now()).getFullYear()),
    last_recorded_year: (new Date(Date.now()).getFullYear()),
    total_pages: 0
  });
  const [currentPage, updateCurrentPage] = React.useState(1);

  const retrieveInfo = async () => {
    try {
      const response = await fetch(`/api/indicator/${props.indicator.id}/info?page=${currentPage}`);
      const body = await response.json();
      if (response.status !== 200) {
        throw Error(body.err);
      }
      updateIndicatorInfo({ 
        list: body.data, 
        total_pages: body.total_pages,
        oldest_recorded_year: body.oldest_recorded_year,
        last_recorded_year: body.last_recorded_year
      });
    } catch (err) {
      console.error(err);
    }
  };

  React.useEffect(() => {
    updateCurrentPage(1);
  }, [props.indicator.id]);

  React.useEffect(() => {
    retrieveInfo();
  }, [props.indicator.id, currentPage]);

  const IndicatorInfoRows = IndicatorInfo.list.map(indicatorInfo => (
    <TableRow key={indicatorInfo.id}>
      <TableCell>{indicatorInfo.year}</TableCell>
      <TableCell>{indicatorInfo.value}</TableCell>
    </TableRow>
  ));

  return (
    <Dialog 
      open={props.open} 
      onClose={props.onClose} 
      fullWidth={true}
      scroll={'paper'}
    >
      <DialogTitle>
        <Grid item>
          <h4>{props.indicator.name}</h4>
        </Grid>
        <Grid item>
          <p>Years Recorded {IndicatorInfo.oldest_recorded_year} - {IndicatorInfo.last_recorded_year}</p>
        </Grid>
      </DialogTitle>
      <DialogContent>
        <Grid item>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Year</TableCell>
                  <TableCell>Value</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                { IndicatorInfoRows }
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </DialogContent>
      <Grid container justify={'center'} alignItems={'center'} style={{ padding: '1em' }}>
        <Pagination
            style={{ display: IndicatorInfo.total_pages <= 1 ? 'none' : 'initial' }}
            page={currentPage} 
            count={IndicatorInfo.total_pages} 
            onChange={(event, value) => updateCurrentPage(value)} 
            color={'primary'}
          />
      </Grid> 
    </Dialog>
  );
}