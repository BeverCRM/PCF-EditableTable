import * as React from 'react';
import {
  DetailsList,
  DetailsListLayoutMode,
  IColumn,
  IDetailsList,
  IDetailsListProps,
  Stack,
  TextField,
} from '@fluentui/react';
import { useSelection } from '../../hooks/useSelection';
import { dataSetStyles } from '../../styles/DataSetStyles';
import { _onRenderDetailsHeader, _onRenderRow } from '../../utils/Utils';
import { CommandBar } from './CommandBar';
import DataverseService from '../../services/DataverseService';
import { GridFooter } from './GridFooter';
import { useAppDispatch } from '../../store/hooks';
import {
  deleteSelectedRecords,
  setChangedRecords,
  saveRecords,
} from '../../store/features/RecordSlice';
import { Lookup } from '../InputComponents/Lookup';
import { InputNumber } from '../InputComponents/InputNumber';
import { DropDown } from '../InputComponents/DropDown';
import { DateTimePicker } from '../InputComponents/DatePicker';
import { setLogicalNames, setLookups } from '../../store/features/LookupSlice';
import { getDropdowns } from '../../store/features/DropdownSlice';
import { LookupField } from '../../store/features/LookupSlice';
import { setCurrencySymbols, setNumber } from '../../store/features/NumberSlice';
import { getLanguages, getTimeZones } from '../../store/features/WholeFormatSlice';
import { WholeFormat } from '../InputComponents/WholeFormat';
import { getDateBehavior } from '../../store/features/DateSlice';
import { setLoading } from '../../store/features/LoadingSlice';
import { mapDataSetColumns, mapDataSetItems } from '../../mappers/dataSetMapper';

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
    const emptyColumns = DataverseService.getColumns();
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
    dispatch(deleteSelectedRecords(selectedRecordIds)).unwrap()
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

  const changedValue = React.useCallback(
    (id: string, fieldName: string, fieldType: string, newValue: any): void => {
      dispatch(setChangedRecords({ id, fieldName, fieldType, newValue }));
    }, []);

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
      dispatch(setLogicalNames(targetEntityType)).unwrap()
        .then(() => {
          dispatch(setLookups(lookupFields));
        })
        .catch(err => { console.log(err); });
    }

    const dropdownColumns = getColumnsOfType(['OptionSet', 'TwoOptions', 'MultiSelectPicklist']);
    if (dropdownColumns.length > 0) {
      dispatch(getDropdowns(dropdownColumns));
    }

    const numberColumns = getColumnsOfType(['Decimal', 'Currency', 'FP', 'Whole.None']);
    if (numberColumns.length > 0) {
      dispatch(setNumber(numberColumns));

      // for currency symbol go to record by id and get transactioncurrencyid field (lookup)
      if (numberColumns.some(numberColumn => numberColumn.data === 'Currency')) {
        dispatch(setCurrencySymbols(datasetItems.map(item => item.key)));
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

  const _renderItemColumn: IDetailsListProps['onRenderItemColumn'] = React.useCallback(
    (item: any, index: number | undefined, column: IColumn | undefined) => {
      const fieldContent = item[column?.fieldName as keyof any] as any;
      const fieldKey = item.raw?._record?.fields[column?.fieldName as keyof any]?.value;
      const currentRecord = item[column?.fieldName!] === '' || item[column?.fieldName!] === null
        ? '' : item?.raw?.getValue(column?.fieldName!);

      const lookupReference = currentRecord?.etn;

      if (column !== undefined && fieldContent !== undefined) {
        switch (column.data) {
          case 'SingleLine.Text':
            return <TextField defaultValue={fieldContent}
              styles={{ root: { maxWidth: '300px' } }}
              onChange={(event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
                newValue?: string) => changedValue(item.key,
                column?.fieldName || '', '', newValue || '')} />;

          case 'DateAndTime.DateAndTime':
            return <DateTimePicker fieldName={column?.fieldName ? column?.fieldName : ''}
              dateOnly={false} key={column.key}
              defaultValue={new Date(fieldKey)}
              _onChange={changedValue.bind('', item.key, column?.fieldName || '', '')}
            />; // TODO

          case 'DateAndTime.DateOnly':
            return <DateTimePicker fieldName={column?.fieldName ? column?.fieldName : ''}
              dateOnly={true} defaultValue={new Date(fieldKey)}
              _onChange={changedValue.bind('', item.key, column?.fieldName || '', '')} />;

          case 'OptionSet':
            return <DropDown fieldName={column?.fieldName ? column?.fieldName : ''}
              defaultValue={fieldContent} isMultiple={false}
              onOptionChange={changedValue.bind('', item.key, column?.fieldName || '', '')}
            />;

          case 'Lookup.Simple':
            return <Lookup fieldName={column?.fieldName ? column?.fieldName : ''}
              defaultValue={currentRecord?.id?.guid}
              _onChange={changedValue.bind('', item.key)}
              lookupReference={lookupReference} />;

          case 'TwoOptions':
            return <DropDown fieldName={column?.fieldName ? column?.fieldName : ''}
              defaultValue={fieldContent} isMultiple={false} isTwoOptions={true}
              onOptionChange={changedValue.bind('', item.key, column?.fieldName || '', '')}
            />;

          case 'Decimal':
            return <InputNumber fieldName={column?.fieldName ? column?.fieldName : ''}
              defaultValue={fieldContent} type={'decimal'}
              onNumberChange={changedValue.bind('', item.key, column?.fieldName || '', '')} />;

          case 'Currency':
            return <InputNumber fieldName={column?.fieldName ? column?.fieldName : ''}
              defaultValue={fieldContent} type={'currency'} rowId={item.key}
              onNumberChange={changedValue.bind('', item.key, column?.fieldName || '', '')} />;

          case 'FP':
            return <InputNumber fieldName={column?.fieldName ? column?.fieldName : ''}
              defaultValue={fieldContent} type={'float'}
              onNumberChange={changedValue.bind('', item.key, column?.fieldName || '', '')} />;

          case 'Multiple':
            return <TextField defaultValue={fieldContent}
              styles={{ root: { maxWidth: '400px' } }}
              onChange={(event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
                newValue?: string) => changedValue(item.key,
                column?.fieldName || '', '', newValue || '')} />;

          case 'MultiSelectPicklist':
            return <DropDown fieldName={column?.fieldName ? column?.fieldName : ''}
              defaultValue={fieldContent} isMultiple={true}
              onOptionChange={changedValue.bind('', item.key, column?.fieldName || '', '')}
            />;

          case 'Whole.None':
            return <InputNumber fieldName={column?.fieldName ? column?.fieldName : ''}
              defaultValue={fieldContent} type={''}
              onNumberChange={changedValue.bind('', item.key, column?.fieldName || '', '')} />;

          case 'Whole.Duration':
            return <WholeFormat defaultValue={fieldKey} type={'duration'}
              _onChange={changedValue.bind('', item.key, column?.fieldName || '', '')} />;

          case 'Whole.Language':
            return <WholeFormat defaultValue={fieldKey} type={'language'}
              _onChange={changedValue.bind('', item.key, column?.fieldName || '', '')} />;

          case 'Whole.TimeZone':
            return <WholeFormat defaultValue={fieldKey} type={'timezone'}
              _onChange={changedValue.bind('', item.key, column?.fieldName || '', '')} />;

          default:
            return <TextField defaultValue={fieldContent}
              styles={{ root: { maxWidth: '300px' } }}
              onChange={(event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
                newValue?: string) => changedValue(item.key,
                column?.fieldName || '', '', newValue || '')} />;
        }
      }
    }, []);

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
        onActiveItemChanged={(item?: any, index?: any) => console.log(item, index)}
        componentRef={listRef}
        styles={{ contentWrapper: { padding: items.length === 0 ? '50px' : '0' } }}
        onRowDidMount={(item?: any, index?: any) => {
          console.log(item);
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
