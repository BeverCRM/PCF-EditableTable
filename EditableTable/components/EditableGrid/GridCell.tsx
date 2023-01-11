import React, { useCallback } from 'react';
import { IColumn, TextField } from '@fluentui/react';

import { LookupFormat } from '../InputComponents/LookupFormat';
import { NumberFormat } from '../InputComponents/NumberFormat';
import { OptionSetFormat } from '../InputComponents/OptionSetFormat';
import { DateTimeFormat } from '../InputComponents/DateTimeFormat';
import { WholeFormat } from '../InputComponents/WholeFormat';

import { Column, Row } from '../../mappers/dataSetMapper';

interface IGridSetProps {
  item: Row,
  currentColumn: IColumn,
  setChangedValue: Function
}

export const GridCell = ({ item, currentColumn, setChangedValue }: IGridSetProps) => {
  const _changedValue = useCallback(
    (newValue: any, rawValue?: any, lookupEntityNavigation?: string): void => {
      setChangedValue({
        id: item.key,
        fieldName: lookupEntityNavigation || currentColumn.key,
        fieldType: currentColumn.data,
        newValue,
      }, rawValue ?? newValue);
    }, [setChangedValue]);

  const cell = item.columns.find((column: Column) => column.schemaName === currentColumn?.key);

  if (currentColumn !== undefined && cell !== undefined) {
    switch (currentColumn.data) {
      case 'SingleLine.Text':
        return <TextField value={cell.formattedValue}
          styles={{ root: { maxWidth: '300px' } }}
          onChange={(event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
            newValue?: string) => _changedValue(newValue || '')} />;

      case 'DateAndTime.DateAndTime':
        return <DateTimeFormat fieldName={currentColumn?.fieldName ? currentColumn?.fieldName : ''}
          dateOnly={false}
          value={cell.rawValue ? new Date(cell.rawValue!) : undefined}
          _onChange={_changedValue}
        />;

      case 'DateAndTime.DateOnly':
        return <DateTimeFormat fieldName={currentColumn?.fieldName ? currentColumn?.fieldName : ''}
          dateOnly={true} value={cell.rawValue ? new Date(cell.rawValue!) : undefined}
          _onChange={_changedValue} />;

      case 'Lookup.Simple':
        return <LookupFormat fieldName={currentColumn?.fieldName ? currentColumn?.fieldName : ''}
          value={cell.rawValue
            ? [{ name: cell.formattedValue, key: cell.rawValue?.id.guid }]
            : undefined}
          _onChange={_changedValue}
          lookupReference={cell.rawValue?.etn || ''} />;

      case 'OptionSet':
        return <OptionSetFormat fieldName={currentColumn?.fieldName ? currentColumn?.fieldName : ''}
          currentOptions={cell.rawValue ? [cell.rawValue] : []}
          isMultiple={false}
          _onChange={_changedValue}
        />;

      case 'TwoOptions':
        return <OptionSetFormat fieldName={currentColumn?.fieldName ? currentColumn?.fieldName : ''}
          currentOptions={cell.rawValue ? [cell.rawValue] : []}
          isMultiple={false}
          isTwoOptions={true}
          _onChange={_changedValue}
        />;

      case 'MultiSelectPicklist':
        return <OptionSetFormat fieldName={currentColumn?.fieldName ? currentColumn?.fieldName : ''}
          currentOptions={cell.rawValue ? cell.rawValue.split(',') : []} isMultiple={true}
          _onChange={_changedValue}
        />;

      case 'Decimal':
        return <NumberFormat fieldName={currentColumn?.fieldName ? currentColumn?.fieldName : ''}
          value={cell.formattedValue ?? ''}
          _onChange={_changedValue} />;

      case 'Currency':
        return <NumberFormat fieldName={currentColumn?.fieldName ? currentColumn?.fieldName : ''}
          value={cell.formattedValue ?? ''}
          rowId={item.key}
          _onChange={_changedValue} />;

      case 'FP':
        return <NumberFormat fieldName={currentColumn?.fieldName ? currentColumn?.fieldName : ''}
          value={cell.formattedValue ?? ''}
          _onChange={_changedValue} />;

      case 'Whole.None':
        return <NumberFormat fieldName={currentColumn?.fieldName ? currentColumn?.fieldName : ''}
          value={cell.formattedValue ?? ''}
          _onChange={_changedValue} />;

      case 'Whole.Duration':
        return <WholeFormat value={cell.rawValue} type={'duration'}
          _onChange={_changedValue} />;

      case 'Whole.Language':
        return <WholeFormat value={cell.rawValue} type={'language'}
          _onChange={_changedValue} />;

      case 'Whole.TimeZone':
        return <WholeFormat value={cell.rawValue} type={'timezone'}
          _onChange={_changedValue} />;

      case 'Multiple':
        return <TextField value={cell.formattedValue}
          styles={{ root: { maxWidth: '400px' } }}
          onChange={(event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
            newValue?: string) => _changedValue(newValue || '')} />;

      default:
        return <TextField value={cell.formattedValue}
          styles={{ root: { maxWidth: '300px' } }}
          onChange={(event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
            newValue?: string) => _changedValue(newValue || '')} />;
    }
  }

  return <></>;
};
