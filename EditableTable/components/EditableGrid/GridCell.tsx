import React, { useCallback } from 'react';
import { IColumn, TextField } from '@fluentui/react';

import { LookupFormat } from '../InputComponents/LookupFormat';
import { NumberFormat } from '../InputComponents/NumberFormat';
import { OptionSetFormat } from '../InputComponents/OptionSetFormat';
import { DateTimeFormat } from '../InputComponents/DateTimeFormat';
import { WholeFormat } from '../InputComponents/WholeFormat';

import { Column, isNewRow, Row } from '../../mappers/dataSetMapper';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { updateRow } from '../../store/features/DatasetSlice';
import { setChangedRecords } from '../../store/features/RecordSlice';
import { textFieldStyles } from '../../styles/ComponentsStyles';
import { IDataverseService } from '../../services/DataverseService';

export interface IGridSetProps {
  row: Row,
  currentColumn: IColumn,
  _service: IDataverseService;
}

export type ParentEntityMetadata = {
  entityId: string,
  entityRecordName: string,
  entityTypeName: string
};

export const GridCell = ({ _service, row, currentColumn }: IGridSetProps) => {
  const dispatch = useAppDispatch();
  const fieldsRequirementLevels = useAppSelector(state => state.dataset.requirementLevels);

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

  const cell = row.columns.find((column: Column) => column.schemaName === currentColumn.key);

  const fieldRequirementLevel = fieldsRequirementLevels.find(requirementLevel =>
    requirementLevel.fieldName === currentColumn.key);
  const isRequired = fieldRequirementLevel?.isRequired || false;

  let parentEntityMetadata: ParentEntityMetadata | undefined;
  if (isNewRow(row)) {
    parentEntityMetadata = _service.getParentMetadata();
  }

  const props = { fieldName: currentColumn?.fieldName ? currentColumn?.fieldName : '',
    isRequired,
    _onChange: _changedValue,
    _onDoubleClick: useCallback(() => _service.openForm(row.key), []),
    _service,
  };

  if (currentColumn !== undefined && cell !== undefined) {
    switch (currentColumn.data) {
      case 'SingleLine.Text':
        return <TextField value={cell.formattedValue}
          styles={textFieldStyles(isRequired)}
          required={isRequired}
          onDoubleClick={() => _service.openForm(row.key)}
          onChange={(event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
            newValue?: string) => _changedValue(newValue || '')} />;

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
        return <WholeFormat
          value={cell.rawValue}
          formattedValue={cell.formattedValue}
          type={'duration'} {...props} />;

      case 'Whole.Language':
        return <WholeFormat value={cell.rawValue} type={'language'} {...props} />;

      case 'Whole.TimeZone':
        return <WholeFormat value={cell.rawValue} type={'timezone'} {...props} />;

      case 'Multiple':
        return <TextField value={cell.formattedValue}
          required={isRequired}
          styles={textFieldStyles(isRequired)}
          onChange={(event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
            newValue?: string) => _changedValue(newValue || '')}
          onDoubleClick={() => _service.openForm(row.key)} />;

      default:
        return <TextField value={cell.formattedValue}
          required={isRequired}
          styles={textFieldStyles(isRequired)}
          onChange={(event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
            newValue?: string) => _changedValue(newValue || '')}
          onDoubleClick={() => _service.openForm(row.key)}/>;
    }
  }

  return <></>;
};
