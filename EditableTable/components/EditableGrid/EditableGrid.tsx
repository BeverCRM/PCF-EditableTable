import * as React from 'react';
import {
  DetailsList,
  DetailsListLayoutMode,
  IColumn,
  IDetailsList,
  Stack,
} from '@fluentui/react';

import { useSelection } from '../../hooks/useSelection';
import { useAppDispatch } from '../../store/hooks';

import { CommandBar } from './CommandBar';
import { GridFooter } from './GridFooter';
import { GridCell } from './GridCell';

import {
  deleteRecords,
  saveRecords,
} from '../../store/features/RecordSlice';
import { setRelationships, setLookups } from '../../store/features/LookupSlice';
import { getDropdownsOptions } from '../../store/features/DropdownSlice';
import { LookupField } from '../../store/features/LookupSlice';
import { getCurrencySymbols, getNumberFieldsMetadata } from '../../store/features/NumberSlice';
import { getLanguages, getTimeZones } from '../../store/features/WholeFormatSlice';
import { getDateBehavior } from '../../store/features/DateSlice';
import { setLoading } from '../../store/features/LoadingSlice';

import { mapDataSetColumns, mapDataSetItems } from '../../mappers/dataSetMapper';
import { _onRenderDetailsHeader, _onRenderRow } from '../../utils/Utils';
import { getColumns } from '../../services/DataverseService';

import { dataSetStyles } from '../../styles/DataSetStyles';

type DataSet = ComponentFramework.PropertyTypes.DataSet;

export interface IDataSetProps {
  dataset: DataSet;
  targetEntityType: string;
  width: number;
  height: number;
}

export const EditableGrid = ({ dataset, targetEntityType, height, width }: IDataSetProps) => {
  const [items, setItems] = React.useState<any[]>([]);
  const { selection, selectedRecordIds } = useSelection(dataset);
  const listRef = React.useRef<IDetailsList>(null);

  const dispatch = useAppDispatch();

  const columns = mapDataSetColumns(dataset);

  const getColumnsOfType = (types: string[]): IColumn[] =>
    columns.filter(column => types.includes(column.data));

  const refreshButtonHandler = () => {
    dispatch(setLoading(true));
    dataset.refresh();
  };

  const newButtonHandler = () => {
    const emptyColumns = getColumns();
    const emptyAttributes = emptyColumns.map((column: any) => ({ [column.name]: '' }));

    setItems((previousItems: any) =>
      [Object.assign(
        { key: Date.now().toString(), raw: [] },
        ...emptyAttributes),
      ...previousItems]);

    listRef.current?.forceUpdate();
  };

  const deleteButtonHandler = () => {
    dispatch(setLoading(true));
    dispatch(deleteRecords(selectedRecordIds)).unwrap()
      .then(() => {
        dataset.refresh();
      })
      .catch(error => {
        console.log(error);
      })
      .finally(() => {
        dispatch(setLoading(false));
      });
  };

  const saveButtonHandler = () => {
    dispatch(setLoading(true));
    dispatch(saveRecords()).unwrap()
      .then(() => {
        dataset.refresh();
      })
      .catch(error => {
        console.log(error);
      })
      .finally(() => {
        dispatch(setLoading(false));
      });
  };

  React.useEffect(() => {
    const datasetItems = mapDataSetItems(dataset);
    setItems(datasetItems);

    const lookupFields: LookupField[] = [];
    const lookupColumns = getColumnsOfType(['Lookup.Simple']);

    lookupColumns.forEach(lookupColumn => {
      const item = datasetItems.find(datasetItem =>
        datasetItem.raw?._record?.fields[lookupColumn.fieldName!]?.reference?.etn !== undefined);

      const lookupRefEntity = item?.raw?._record?.fields[lookupColumn.fieldName!]?.reference?.etn;

      lookupFields.push({ lookupColumn, lookupRefEntity });
    });

    if (lookupFields.length > 0) {
      dispatch(setRelationships(targetEntityType)).unwrap()
        .then(() => {
          dispatch(setLookups(lookupFields));
        })
        .catch(err => { console.log(err); });
    }

    const dropdownColumns = getColumnsOfType(['OptionSet', 'TwoOptions', 'MultiSelectPicklist']);
    if (dropdownColumns.length > 0) {
      dispatch(getDropdownsOptions(dropdownColumns));
    }

    const numberColumns = getColumnsOfType(['Decimal', 'Currency', 'FP', 'Whole.None']);
    if (numberColumns.length > 0) {
      dispatch(getNumberFieldsMetadata(numberColumns));

      // for currency symbol go to record by id and get transactioncurrencyid field (lookup)
      if (numberColumns.some(numberColumn => numberColumn.data === 'Currency')) {
        dispatch(getCurrencySymbols(datasetItems.map(item => item.key)));
      }
    }

    const timezoneColumns = getColumnsOfType(['Whole.TimeZone']);
    if (timezoneColumns.length > 0) {
      dispatch(getTimeZones());
    }

    const languageColumns = getColumnsOfType(['Whole.Language']);
    if (languageColumns.length > 0) {
      dispatch(getLanguages());
    }

    const dateColumns = getColumnsOfType(['DateAndTime.DateAndTime', 'DateAndTime.DateOnly']);
    if (dateColumns.length > 0) {
      dispatch(getDateBehavior(dateColumns));
    }

    dispatch(setLoading(false));
  }, [dataset]);

  const _renderItemColumn = (item: any, index: number | undefined, column: IColumn | undefined) =>
    <GridCell item={item} column={column} />;

  return <div className='container'>
    <Stack horizontal horizontalAlign="end" className={dataSetStyles.buttons} >
      <CommandBar
        refreshButtonHandler={refreshButtonHandler}
        newButtonHandler={newButtonHandler}
        deleteButtonHandler={deleteButtonHandler}
        saveButtonHandler={saveButtonHandler}
      ></CommandBar>
    </Stack>
    <Stack style={{
      width,
      height,
    }}>
      <DetailsList
        items={items}
        columns={columns}
        onRenderItemColumn={_renderItemColumn}
        selection={selection}
        onRenderRow={_onRenderRow}
        onRenderDetailsHeader={_onRenderDetailsHeader}
        layoutMode={DetailsListLayoutMode.fixedColumns}
        // onActiveItemChanged={(item?: any, index?: any) => console.log(item, index)}
        componentRef={listRef}
        styles={{ contentWrapper: { padding: items.length === 0 ? '50px' : '0' } }}
        onRowDidMount={(item?: any, index?: any) => {
          if (index === (items.length - 1)) dispatch(setLoading(false));
        }}
      >
      </DetailsList>
      {!items.length &&
        <Stack horizontalAlign='center' className='noDataContainer'>
          <div className='nodata'><span>No data available</span></div>
        </Stack>
      }
      <GridFooter dataset={dataset} selectedCount={selection.count}></GridFooter>
    </Stack>
  </div>;
};
