import React, { useCallback } from 'react';
import { IColumn, TextField } from '@fluentui/react';

import { LookupFormat } from '../InputComponents/LookupFormat';
import { NumberFormat } from '../InputComponents/NumberFormat';
import { OptionSetFormat } from '../InputComponents/OptionSetFormat';
import { DateTimeFormat } from '../InputComponents/DateTimeFormat';
import { WholeFormat } from '../InputComponents/WholeFormat';

import { Column, Row, isNewRow } from '../../mappers/dataSetMapper';
import { useAppDispatch } from '../../store/hooks';
import { updateRow } from '../../store/features/DatasetSlice';
import { setChangedRecords } from '../../store/features/RecordSlice';
import { getParentMetadata, openForm } from '../../services/DataverseService';

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
  if (isNewRow(row)) {
    parentEntityMetadata = getParentMetadata();
  }

  const props = { fieldName: currentColumn?.fieldName ? currentColumn?.fieldName : '',
    _onChange: _changedValue,
    _onDoubleClick: () => openForm(row.key),
  };

  if (currentColumn !== undefined && cell !== undefined) {
    switch (currentColumn.data) {
      case 'SingleLine.Text':
        return <TextField value={cell.formattedValue}
          styles={{ root: { maxWidth: '300px' } }}
          onDoubleClick={() => openForm(row.key)}
          onChange={(event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
            newValue?: string) => { console.log('Text'); _changedValue(newValue || ''); }} />;

      case 'DateAndTime.DateAndTime':
        return <DateTimeFormat dateOnly={false} value={cell.formattedValue} {...props} />;

      case 'DateAndTime.DateOnly':
        return <DateTimeFormat dateOnly={true} value={cell.formattedValue} {...props} />;

      case 'Lookup.Simple':
        return <LookupFormat value={cell.lookup} parentEntityMetadata={parentEntityMetadata}
          {...props} />;

      case 'OptionSet':
        return <OptionSetFormat value={cell.rawValue} isMultiple={false} {... props} />;

      case 'TwoOptions':
        return <OptionSetFormat value={cell.rawValue} isMultiple={false} isTwoOptions={true}
          {...props} />;

      case 'MultiSelectPicklist':
        return <OptionSetFormat value={cell.rawValue} isMultiple={true} {...props} />;

      case 'Decimal':
        return <NumberFormat value={cell.formattedValue ?? ''} {...props} />;

      case 'Currency':
        return <NumberFormat value={cell.formattedValue ?? ''} rowId={row.key} {...props} />;

      case 'FP':
        return <NumberFormat value={cell.formattedValue ?? ''} {...props} />;

      case 'Whole.None':
        return <NumberFormat value={cell.formattedValue ?? ''} {...props} />;

      case 'Whole.Duration':
        return <WholeFormat value={cell.rawValue} type={'duration'} {...props} />;

      case 'Whole.Language':
        return <WholeFormat value={cell.rawValue} type={'language'} {...props} />;

      case 'Whole.TimeZone':
        return <WholeFormat value={cell.rawValue} type={'timezone'} {...props} />;

      case 'Multiple':
        return <TextField value={cell.formattedValue}
          styles={{ root: { maxWidth: '400px' } }}
          onChange={(event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
            newValue?: string) => _changedValue(newValue || '')}
          onDoubleClick={() => openForm(row.key)} />;

      default:
        return <TextField value={cell.formattedValue}
          styles={{ root: { maxWidth: '300px' } }}
          onChange={(event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
            newValue?: string) => _changedValue(newValue || '')}
          onDoubleClick={() => openForm(row.key)}/>;
    }
  }

  return <></>;
};
