import * as React from 'react';
import {
  DetailsList,
  DetailsListLayoutMode,
  IColumn,
  IDetailsList,
  Stack,
} from '@fluentui/react';

import { useSelection } from '../../hooks/useSelection';
import { useLoadStore } from '../../hooks/useLoadStore';
import { useAppDispatch } from '../../store/hooks';

import { CommandBar } from './CommandBar';
import { GridFooter } from './GridFooter';
import { GridCell } from './GridCell';

import { deleteRecords, saveRecords, setChangedRecords } from '../../store/features/RecordSlice';
import { setLoading } from '../../store/features/LoadingSlice';

import { Column, mapDataSetColumns, mapDataSetItems } from '../../mappers/dataSetMapper';
import { _onRenderDetailsHeader, _onRenderRow } from '../../utils/Utils';

import { dataSetStyles } from '../../styles/DataSetStyles';

type DataSet = ComponentFramework.PropertyTypes.DataSet;

export interface IDataSetProps {
  dataset: DataSet;
  width: number;
  height: number;
}

export const EditableGrid = ({ dataset, height, width }: IDataSetProps) => {
  const [items, setItems] = React.useState<any[]>([]);
  const { selection, selectedRecordIds } = useSelection(dataset);
  const listRef = React.useRef<IDetailsList>(null);

  const columns = mapDataSetColumns(dataset);

  const dispatch = useAppDispatch();

  const refreshButtonHandler = () => {
    dispatch(setLoading(true));
    dataset.refresh();
  };

  const newButtonHandler = () => {
    const emptyColumns = columns.map<Column>(column => ({
      'schemaName': column.key,
      'rawValue': '',
      'formattedValue': '',
    }));

    setItems(previousItems => [
      {
        key: Date.now().toString(),
        columns: emptyColumns,
      },
      ...previousItems,
    ]);
  };

  const deleteButtonHandler = () => {
    dispatch(setLoading(true));
    dispatch(deleteRecords(selectedRecordIds)).unwrap()
      .then(() => {
        dataset.refresh();
      });
  };

  const saveButtonHandler = () => {
    dispatch(setLoading(true));
    dispatch(saveRecords()).unwrap()
      .then(() => {
        dataset.refresh();
      });
  };

  React.useEffect(() => {
    const datasetItems = mapDataSetItems(dataset);
    setItems(datasetItems);

    listRef.current?.forceUpdate();
  }, [dataset]);

  useLoadStore(dataset);

  const _setChangedValue = (changedItem: any, changedValue: string) => {
    items.map(item => {
      if (item.key === changedItem.id) {
        return item.columns.find((column: Column) => {
          if (column.schemaName === changedItem.fieldName) {
            column.newValue = changedItem.newValue;
            column.rawValue = changedValue || undefined;
            column.formattedValue = changedValue;
            column.wholeFormatValue = changedValue;
          }
        });
      }
      return item;
    });
    setItems(items);
    dispatch(setChangedRecords(changedItem));
  };

  const _renderItemColumn = (item: any, index: number | undefined, column: IColumn | undefined) =>
    <GridCell item={item} currentColumn={column} setChangedValue={_setChangedValue} />;

  return <div className='container'>
    <Stack horizontal horizontalAlign="end" className={dataSetStyles.buttons} >
      <CommandBar
        refreshButtonHandler={refreshButtonHandler}
        newButtonHandler={newButtonHandler}
        deleteButtonHandler={deleteButtonHandler}
        saveButtonHandler={saveButtonHandler}
      ></CommandBar>
    </Stack>
    <Stack style={{ width, height }}>
      <DetailsList
        items={items}
        columns={columns}
        onRenderItemColumn={_renderItemColumn}
        selection={selection}
        onRenderRow={_onRenderRow}
        onRenderDetailsHeader={_onRenderDetailsHeader}
        layoutMode={DetailsListLayoutMode.fixedColumns}
        componentRef={listRef}
        styles={{ contentWrapper: { padding: items.length === 0 ? '50px' : '0' } }}
      >
      </DetailsList>
      {items.length === 0 &&
        <Stack horizontalAlign='center' className='noDataContainer'>
          <div className='nodata'><span>No data available</span></div>
        </Stack>
      }
      <GridFooter dataset={dataset} selectedCount={selection.count}></GridFooter>
    </Stack>
  </div>;
};
