import React, { useEffect } from 'react';
import {
  DetailsList,
  DetailsListLayoutMode,
  IColumn,
  ScrollablePane,
  Stack,
} from '@fluentui/react';

import { useSelection } from '../../hooks/useSelection';
import { useLoadStore } from '../../hooks/useLoadStore';
import { useAppDispatch, useAppSelector } from '../../store/hooks';

import { CommandBar } from './CommandBar';
import { GridFooter } from './GridFooter';
import { GridCell } from './GridCell';

import {
  clearChangedRecords,
  deleteRecords,
  saveRecords,
} from '../../store/features/RecordSlice';
import { setLoading } from '../../store/features/LoadingSlice';
import {
  addNewRow,
  readdNewRowsAfterDelete,
  removeNewRows,
  setRows,
} from '../../store/features/DatasetSlice';

import { Row, Column, mapDataSetColumns,
  mapDataSetRows, getColumnsTotalWidth } from '../../mappers/dataSetMapper';
import { _onRenderDetailsHeader, _onRenderRow } from '../../styles/RenderStyles';
import { buttonStyles } from '../../styles/ButtonStyles';
import { openForm } from '../../services/DataverseService';
import { containerStackStyles, gridStyles } from '../../styles/DetailsListStyles';

type DataSet = ComponentFramework.PropertyTypes.DataSet;

export interface IDataSetProps {
  dataset: DataSet;
  isControlDisabled: boolean;
  width: number;
}

export const EditableGrid = ({ dataset, isControlDisabled, width }: IDataSetProps) => {
  const { selection, selectedRecordIds } = useSelection();

  const rows: Row[] = useAppSelector(state => state.dataset.rows);
  const newRows: Row[] = useAppSelector(state => state.dataset.newRows);

  const dispatch = useAppDispatch();

  const columns = mapDataSetColumns(dataset);

  const refreshButtonHandler = () => {
    dispatch(setLoading(true));
    dataset.refresh();
    dispatch(clearChangedRecords());
    dispatch(removeNewRows());
  };

  const newButtonHandler = () => {
    const emptyColumns = columns.map<Column>(column => ({
      schemaName: column.key,
      rawValue: '',
      formattedValue: '',
    }));

    dispatch(addNewRow({
      key: Date.now().toString(),
      columns: emptyColumns,
    }));
  };

  const deleteButtonHandler = () => {
    dispatch(setLoading(true));
    dispatch(deleteRecords(selectedRecordIds)).unwrap()
      .then(selectedNewRecordIds => {
        dataset.refresh();
        dispatch(readdNewRowsAfterDelete(selectedNewRecordIds));
      })
      .catch(() => dispatch(setLoading(false)));
  };

  const saveButtonHandler = () => {
    dispatch(setLoading(true));
    dispatch(saveRecords()).unwrap()
      .then(() => {
        dataset.refresh();
        dispatch(removeNewRows());
      });
  };

  useEffect(() => {
    const datasetRows = [
      ...newRows,
      ...mapDataSetRows(dataset),
    ];

    dispatch(setRows(datasetRows));
    dispatch(clearChangedRecords());
  }, [dataset]);

  useLoadStore(dataset);

  const _renderItemColumn = (item: Row, index: number | undefined, column: IColumn | undefined) =>
    <GridCell row={item} currentColumn={column!} />;

  const _onItemInvoked = (item: any) => openForm(item.key);

  return <div className='container'>
    <Stack style={containerStackStyles(width, rows.length)} >
      <ScrollablePane>
        <Stack horizontal horizontalAlign="end" className={buttonStyles.buttons} >
          <CommandBar
            refreshButtonHandler={refreshButtonHandler}
            newButtonHandler={newButtonHandler}
            deleteButtonHandler={deleteButtonHandler}
            saveButtonHandler={saveButtonHandler}
            isControlDisabled={isControlDisabled}
          ></CommandBar>
        </Stack>
        <DetailsList
          key={getColumnsTotalWidth(dataset) > width ? 0 : width}
          items={rows}
          columns={columns}
          onRenderItemColumn={_renderItemColumn}
          selection={selection}
          onRenderRow={_onRenderRow}
          onRenderDetailsHeader={_onRenderDetailsHeader}
          layoutMode={DetailsListLayoutMode.fixedColumns}
          styles={gridStyles(rows.length)}
          onItemInvoked={_onItemInvoked}
        >
        </DetailsList>
        {rows.length === 0 &&
          <Stack horizontalAlign='center' className='noDataContainer'>
            <div className='nodata'><span>No data available</span></div>
          </Stack>
        }
        <GridFooter dataset={dataset} selectedCount={selectedRecordIds.length}></GridFooter>
      </ScrollablePane>
    </Stack>
  </div>;
};
