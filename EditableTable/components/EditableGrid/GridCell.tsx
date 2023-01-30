import React, { useCallback } from 'react';
import { IColumn, TextField } from '@fluentui/react';

import { LookupFormat } from '../InputComponents/LookupFormat';
import { NumberFormat } from '../InputComponents/NumberFormat';
import { OptionSetFormat } from '../InputComponents/OptionSetFormat';
import { DateTimeFormat } from '../InputComponents/DateTimeFormat';
import { WholeFormat } from '../InputComponents/WholeFormat';

import { Column, Row } from '../../mappers/dataSetMapper';
import { useAppDispatch } from '../../store/hooks';
import { updateRow } from '../../store/features/DatasetSlice';
import { setChangedRecords } from '../../store/features/RecordSlice';
import { getParentMetadata } from '../../services/DataverseService';

interface IGridSetProps {
  row: Row,
  currentColumn: IColumn,
}

export type ParentEntityMetadata = {
  entityId: string,
  entityRecordName: string,
  entityTypeName: string
};

export const GridCell = ({ row, currentColumn }: IGridSetProps) => {
  const dispatch = useAppDispatch();
  const _changedValue = useCallback(
    (newValue: any, rawValue?: any, lookupEntityNavigation?: string): void => {
      dispatch(setChangedRecords({
        id: row.key,
        fieldName: lookupEntityNavigation || currentColumn.key,
        fieldType: currentColumn.data,
        newValue,
      }));
      dispatch(updateRow({
        rowKey: row.key,
        columnName: currentColumn.key,
        newValue: rawValue ?? newValue,
      }));
    }, []);

  const cell = row.columns.find((column: Column) => column.schemaName === currentColumn?.key);

  let parentEntityMetadata: ParentEntityMetadata | undefined;
  if (row.key.length < 15) {
    parentEntityMetadata = getParentMetadata();
  }

  if (currentColumn !== undefined && cell !== undefined) {
    switch (currentColumn.data) {
      case 'SingleLine.Text':
        return <TextField value={cell.formattedValue}
          styles={{ root: { maxWidth: '300px' } }}
          onChange={(event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
            newValue?: string) => { console.log('Text'); _changedValue(newValue || ''); }} />;

      case 'DateAndTime.DateAndTime':
        return <DateTimeFormat fieldName={currentColumn?.fieldName ? currentColumn?.fieldName : ''}
          dateOnly={false}
          value={cell.formattedValue}
          _onChange={_changedValue}
        />;

      case 'DateAndTime.DateOnly':
        return <DateTimeFormat fieldName={currentColumn?.fieldName ? currentColumn?.fieldName : ''}
          dateOnly={true} value={cell.formattedValue}
          _onChange={_changedValue} />;

      case 'Lookup.Simple':
        return <LookupFormat fieldName={currentColumn?.fieldName ? currentColumn?.fieldName : ''}
          value={cell.lookup}
          parentEntityMetadata={parentEntityMetadata}
          _onChange={_changedValue} />;

      case 'OptionSet':
        return <OptionSetFormat fieldName={currentColumn?.fieldName ? currentColumn?.fieldName : ''}
          value={cell.rawValue}
          isMultiple={false}
          _onChange={_changedValue}
        />;

      case 'TwoOptions':
        return <OptionSetFormat fieldName={currentColumn?.fieldName ? currentColumn?.fieldName : ''}
          value={cell.rawValue}
          isMultiple={false}
          isTwoOptions={true}
          _onChange={_changedValue}
        />;

      case 'MultiSelectPicklist':
        return <OptionSetFormat fieldName={currentColumn?.fieldName ? currentColumn?.fieldName : ''}
          value={cell.rawValue} isMultiple={true}
          _onChange={_changedValue}
        />;

      case 'Decimal':
        return <NumberFormat fieldName={currentColumn?.fieldName ? currentColumn?.fieldName : ''}
          value={cell.formattedValue ?? ''}
          _onChange={_changedValue} />;

      case 'Currency':
        return <NumberFormat fieldName={currentColumn?.fieldName ? currentColumn?.fieldName : ''}
          value={cell.formattedValue ?? ''}
          rowId={row.key}
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
