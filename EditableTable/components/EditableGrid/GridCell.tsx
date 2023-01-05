import * as React from 'react';
import { IColumn, TextField } from '@fluentui/react';

import { LookupFormat } from '../InputComponents/LookupFormat';
import { NumberFormat } from '../InputComponents/NumberFormat';
import { OptionSetFormat } from '../InputComponents/OptionSetFormat';
import { DateTimeFormat } from '../InputComponents/DateTimeFormat';
import { WholeFormat } from '../InputComponents/WholeFormat';

import { setChangedRecords } from '../../store/features/RecordSlice';
import { useAppDispatch } from '../../store/hooks';
import { Column, Row } from '../../mappers/dataSetMapper';

interface IGridSetProps {
  item: Row,
  currentColumn?: IColumn
}

export const GridCell = ({ item, currentColumn }: IGridSetProps) => {
  const dispatch = useAppDispatch();

  const _changedValue = (newValue: any, lookupEntityNavigation?: string): void => {
    dispatch(setChangedRecords({
      id: item.key,
      fieldName: lookupEntityNavigation || currentColumn!.key,
      fieldType: currentColumn?.data,
      newValue }));
  };

  console.log(item);

  const cell = item.columns.find((column: Column) => column.schemaName === currentColumn?.key);

  if (!currentColumn?.fieldName) {
    console.log(currentColumn?.fieldName);
  }
  if (currentColumn !== undefined && cell !== undefined) {
    switch (currentColumn.data) {
      case 'SingleLine.Text':
        return <TextField defaultValue={cell.formattedValue}
          styles={{ root: { maxWidth: '300px' } }}
          onChange={(event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
            newValue?: string) => _changedValue(newValue || '')} />;

      case 'DateAndTime.DateAndTime':
        return <DateTimeFormat fieldName={currentColumn?.fieldName ? currentColumn?.fieldName : ''}
          dateOnly={false}
          defaultValue={new Date(cell.rawValue)}
          _onChange={_changedValue}
        />;

      case 'DateAndTime.DateOnly':
        return <DateTimeFormat fieldName={currentColumn?.fieldName ? currentColumn?.fieldName : ''}
          dateOnly={true} defaultValue={new Date(cell.rawValue)}
          _onChange={_changedValue} />;

      case 'OptionSet':
        return <OptionSetFormat fieldName={currentColumn?.fieldName ? currentColumn?.fieldName : ''}
          defaultValue={[cell.rawValue]} isMultiple={false}
          _onChange={_changedValue}
        />;

      case 'Lookup.Simple':
        return <LookupFormat fieldName={currentColumn?.fieldName ? currentColumn?.fieldName : ''}
          defaultValue={cell.lookupValue
            ? [{ name: cell.formattedValue, key: cell.lookupValue?.id.guid }]
            : undefined}
          _onChange={_changedValue}
          lookupReference={cell.lookupValue?.etn || ''} />;

      case 'TwoOptions':
        return <OptionSetFormat fieldName={currentColumn?.fieldName ? currentColumn?.fieldName : ''}
          defaultValue={[cell.rawValue]} isMultiple={false} isTwoOptions={true}
          _onChange={_changedValue}
        />;

      case 'Decimal':
        return <NumberFormat fieldName={currentColumn?.fieldName ? currentColumn?.fieldName : ''}
          defaultValue={cell.formattedValue} type={'decimal'}
          _onChange={_changedValue} />;

      case 'Currency':
        return <NumberFormat fieldName={currentColumn?.fieldName ? currentColumn?.fieldName : ''}
          defaultValue={cell.formattedValue} type={'currency'} rowId={item.key}
          _onChange={_changedValue} />;

      case 'FP':
        return <NumberFormat fieldName={currentColumn?.fieldName ? currentColumn?.fieldName : ''}
          defaultValue={cell.formattedValue} type={'float'}
          _onChange={_changedValue} />;

      case 'Multiple':
        return <TextField defaultValue={cell.formattedValue}
          styles={{ root: { maxWidth: '400px' } }}
          onChange={(event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
            newValue?: string) => _changedValue(newValue || '')} />;

      case 'MultiSelectPicklist':
        return <OptionSetFormat fieldName={currentColumn?.fieldName ? currentColumn?.fieldName : ''}
          defaultValue={cell.rawValue?.split(',')} isMultiple={true}
          _onChange={_changedValue}
        />;

      case 'Whole.None':
        return <NumberFormat fieldName={currentColumn?.fieldName ? currentColumn?.fieldName : ''}
          defaultValue={cell.formattedValue} type={''}
          _onChange={_changedValue} />;

      case 'Whole.Duration':
        return <WholeFormat defaultValue={cell.rawValue} type={'duration'}
          _onChange={_changedValue} />;

      case 'Whole.Language':
        return <WholeFormat defaultValue={cell.rawValue} type={'language'}
          _onChange={_changedValue} />;

      case 'Whole.TimeZone':
        return <WholeFormat defaultValue={cell.rawValue} type={'timezone'}
          _onChange={_changedValue} />;

      default:
        return <TextField defaultValue={cell.formattedValue}
          styles={{ root: { maxWidth: '300px' } }}
          onChange={(event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
            newValue?: string) => _changedValue(newValue || '')} />;
    }
  }

  return <></>;
};
