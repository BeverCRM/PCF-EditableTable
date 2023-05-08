import * as React from 'react';
import { useEffect } from 'react';
import {
  DetailsList,
  DetailsListLayoutMode,
  IColumn,
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
  readdChangedRecordsAfterDelete,
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
import { _onRenderDetailsHeader } from '../../styles/RenderStyles';
import { buttonStyles } from '../../styles/ButtonStyles';
import { gridStyles } from '../../styles/DetailsListStyles';
import { IDataSetProps } from '../AppWrapper';

export const EditableGrid = ({ _service, dataset, isControlDisabled, width }: IDataSetProps) => {
  const { selection, selectedRecordIds } = useSelection();

  const rows: Row[] = useAppSelector(state => state.dataset.rows);
  const newRows: Row[] = useAppSelector(state => state.dataset.newRows);
  const columns = mapDataSetColumns(dataset, _service);
  const isPendingDelete = useAppSelector(state => state.record.isPendingDelete);

  const dispatch = useAppDispatch();

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
      type: column.data,
    }));

    dispatch(addNewRow({
      key: Date.now().toString(),
      columns: emptyColumns,
    }));
  };

  const deleteButtonHandler = () => {
    dispatch(setLoading(true));
    dispatch(deleteRecords({ recordIds: selectedRecordIds, _service })).unwrap()
      .then(recordsAfterDelete => {
        dataset.refresh();
        dispatch(readdNewRowsAfterDelete(recordsAfterDelete.newRows));
      })
      .catch(error => {
        if (!error) {
          _service.openErrorDialog(error).then(() => {
            dispatch(setLoading(false));
          });
        }
        dispatch(setLoading(false));
      });
  };

  const saveButtonHandler = () => {
    dispatch(setLoading(true));
    dispatch(saveRecords(_service)).unwrap()
      .then(() => {
        dataset.refresh();
        dispatch(removeNewRows());
      })
      .catch(error =>
        _service.openErrorDialog(error).then(() => {
          dispatch(setLoading(false));
        }));
  };

  useEffect(() => {
    const datasetRows = [
      ...newRows,
      ...mapDataSetRows(dataset),
    ];
    dispatch(setRows(datasetRows));
    dispatch(clearChangedRecords());
    dispatch(readdChangedRecordsAfterDelete());
    dispatch(setLoading(isPendingDelete));
  }, [dataset]);

  useLoadStore(dataset, _service);

  const _renderItemColumn = (item: Row, index: number | undefined, column: IColumn | undefined) =>
    <GridCell row={item} currentColumn={column!} _service={_service} />;

  const _onItemInvoked = (item: any) => _service.openForm(item.key);

  return <div className='container'>
    <Stack horizontal horizontalAlign="end" className={buttonStyles.buttons} >
      <CommandBar
        refreshButtonHandler={refreshButtonHandler}
        newButtonHandler={newButtonHandler}
        deleteButtonHandler={deleteButtonHandler}
        saveButtonHandler={saveButtonHandler}
        isControlDisabled={isControlDisabled}
        selectedCount={selectedRecordIds.length}
      ></CommandBar>
    </Stack>
    <DetailsList
      key={getColumnsTotalWidth(dataset) > width ? 0 : width}
      items={rows}
      columns={columns}
      onRenderItemColumn={_renderItemColumn}
      selection={selection}
      onRenderRow={ (props, defaultRender) =>
        <div onDoubleClick={() => _service.openForm(props?.item.key)}>
          {defaultRender!(props)}
        </div> }
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
  </div>;
};
