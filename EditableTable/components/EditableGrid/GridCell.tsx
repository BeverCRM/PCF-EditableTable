import * as React from 'react';
import { IColumn, TextField } from '@fluentui/react';

import { LookupFormat } from '../InputComponents/LookupFormat';
import { NumberFormat } from '../InputComponents/NumberFormat';
import { OptionSetFormat } from '../InputComponents/OptionSetFormat';
import { DateTimeFormat } from '../InputComponents/DateTimeFormat';
import { WholeFormat } from '../InputComponents/WholeFormat';

import { setChangedRecords } from '../../store/features/RecordSlice';
import { useAppDispatch } from '../../store/hooks';

interface IGridSetProps {
  item: any,
  column?: IColumn
}

export const GridCell = ({ item, column }: IGridSetProps) => {
  const dispatch = useAppDispatch();

  const changedValue = (id: string, fieldName: string, fieldType: string, newValue: any): void => {
    dispatch(setChangedRecords({ id, fieldName, fieldType, newValue }));
  };

  const fieldContent = item[column?.fieldName as keyof any] as any;
  const fieldValue = item.raw?._record?.fields[column?.fieldName as keyof any]?.value;
  const optionsetValue: string = item.raw?._record?.fields[column?.fieldName!]?.valueString;
  const multiselectValue = column?.data === 'MultiSelectPicklist' ? fieldValue?.split(',') : [];
  const currentRecord = item[column?.fieldName!] === '' || item[column?.fieldName!] === null
    ? '' : item?.raw?.getValue(column?.fieldName!);

  const lookupReference = currentRecord?.etn;
  const lookupDefaultValue = column?.data === 'Lookup.Simple' && fieldContent && currentRecord
    ? [{ name: fieldContent, key: currentRecord?.id?.guid }] : undefined;

  if (column !== undefined && fieldContent !== undefined) {
    switch (column.data) {
      case 'SingleLine.Text':
        return <TextField defaultValue={fieldContent}
          styles={{ root: { maxWidth: '300px' } }}
          onChange={(event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
            newValue?: string) => changedValue(item.key,
            column?.fieldName || '', '', newValue || '')} />;

      case 'DateAndTime.DateAndTime':
        return <DateTimeFormat fieldName={column?.fieldName ? column?.fieldName : ''}
          dateOnly={false} key={column.key}
          defaultValue={new Date(fieldValue)}
          _onChange={changedValue.bind('', item.key, column?.fieldName || '', '')}
        />; // TODO

      case 'DateAndTime.DateOnly':
        return <DateTimeFormat fieldName={column?.fieldName ? column?.fieldName : ''}
          dateOnly={true} defaultValue={new Date(fieldValue)}
          _onChange={changedValue.bind('', item.key, column?.fieldName || '', '')} />;

      case 'OptionSet':
        return <OptionSetFormat fieldName={column?.fieldName ? column?.fieldName : ''}
          defaultValue={[optionsetValue]} isMultiple={false}
          _onChange={changedValue.bind('', item.key, column?.fieldName || '', '')}
        />;

      case 'Lookup.Simple':
        return <LookupFormat fieldName={column?.fieldName ? column?.fieldName : ''}
          defaultValue={lookupDefaultValue}
          _onChange={changedValue.bind('', item.key)}
          lookupReference={lookupReference} />;

      case 'TwoOptions':
        return <OptionSetFormat fieldName={column?.fieldName ? column?.fieldName : ''}
          defaultValue={[optionsetValue]} isMultiple={false} isTwoOptions={true}
          _onChange={changedValue.bind('', item.key, column?.fieldName || '', '')}
        />;

      case 'Decimal':
        return <NumberFormat fieldName={column?.fieldName ? column?.fieldName : ''}
          defaultValue={fieldContent} type={'decimal'}
          _onChange={changedValue.bind('', item.key, column?.fieldName || '', '')} />;

      case 'Currency':
        return <NumberFormat fieldName={column?.fieldName ? column?.fieldName : ''}
          defaultValue={fieldContent} type={'currency'} rowId={item.key}
          _onChange={changedValue.bind('', item.key, column?.fieldName || '', '')} />;

      case 'FP':
        return <NumberFormat fieldName={column?.fieldName ? column?.fieldName : ''}
          defaultValue={fieldContent} type={'float'}
          _onChange={changedValue.bind('', item.key, column?.fieldName || '', '')} />;

      case 'Multiple':
        return <TextField defaultValue={fieldContent}
          styles={{ root: { maxWidth: '400px' } }}
          onChange={(event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
            newValue?: string) => changedValue(item.key,
            column?.fieldName || '', '', newValue || '')} />;

      case 'MultiSelectPicklist':
        return <OptionSetFormat fieldName={column?.fieldName ? column?.fieldName : ''}
          defaultValue={multiselectValue} isMultiple={true}
          _onChange={changedValue.bind('', item.key, column?.fieldName || '', '')}
        />;

      case 'Whole.None':
        return <NumberFormat fieldName={column?.fieldName ? column?.fieldName : ''}
          defaultValue={fieldContent} type={''}
          _onChange={changedValue.bind('', item.key, column?.fieldName || '', '')} />;

      case 'Whole.Duration':
        return <WholeFormat defaultValue={fieldValue} type={'duration'}
          _onChange={changedValue.bind('', item.key, column?.fieldName || '', '')} />;

      case 'Whole.Language':
        return <WholeFormat defaultValue={fieldValue} type={'language'}
          _onChange={changedValue.bind('', item.key, column?.fieldName || '', '')} />;

      case 'Whole.TimeZone':
        return <WholeFormat defaultValue={fieldValue} type={'timezone'}
          _onChange={changedValue.bind('', item.key, column?.fieldName || '', '')} />;

      default:
        return <TextField defaultValue={fieldContent}
          styles={{ root: { maxWidth: '300px' } }}
          onChange={(event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
            newValue?: string) => changedValue(item.key,
            column?.fieldName || '', '', newValue || '')} />;
    }
  }

  return <></>;
};
