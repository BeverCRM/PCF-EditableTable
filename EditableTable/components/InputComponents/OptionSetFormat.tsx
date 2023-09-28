/* eslint-disable react/display-name */
import React, { memo } from 'react';
import { Stack, ComboBox, IComboBox, IComboBoxOption, FontIcon } from '@fluentui/react';

import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { asteriskClassStyle, optionSetStyles } from '../../styles/ComponentsStyles';
import { IDataverseService } from '../../services/DataverseService';
import { ErrorIcon } from '../ErrorIcon';
import { setInvalidFields } from '../../store/features/ErrorSlice';

export interface IDropDownProps {
  fieldId: string;
  fieldName: string | undefined;
  value: string | null;
  formattedValue: string | undefined;
  isMultiple: boolean;
  isTwoOptions?: boolean;
  _onChange: Function;
  isRequired: boolean;
  isDisabled: boolean;
  isSecured: boolean;
  _service: IDataverseService;
}

export const OptionSetFormat = memo(({ fieldId, fieldName, value, formattedValue, isMultiple,
  isRequired, isTwoOptions, isDisabled, isSecured, _onChange, _service }: IDropDownProps) => {
  let currentValue = value;
  const dispatch = useAppDispatch();

  const dropdowns = useAppSelector(state => state.dropdown.dropdownFields);
  const currentDropdown = dropdowns.find(dropdown => dropdown.fieldName === fieldName);
  const options = currentDropdown?.options ?? [];
  const disabled = fieldName === 'statuscode' || fieldName === 'statecode' || isDisabled;

  if (_service.isStatusField(fieldName) && !currentValue) {
    currentValue = options.find(option =>
      option.text.toLowerCase().includes('active'))?.key.toString() || '';
  }
  const currentOptions: string[] = currentValue ? currentValue.split(',') : [];
  if (isSecured) {
    currentOptions.forEach((opt, i) => {
      const optionNames = formattedValue?.split(';') || [];
      options.push({ key: opt, text: optionNames[i] || '' });
    });
  }

  const onChange =
    (event: React.FormEvent<IComboBox>, option?: IComboBoxOption | undefined) => {
      if (isMultiple) {
        if (option?.selected) {
          _onChange([...currentOptions, option.key as string].join(', '),
            [...currentOptions, option.key as string].join(','));
        }
        else {
          _onChange(currentOptions.filter(key => key !== option?.key).join(', ') || null,
            currentOptions.filter(key => key !== option?.key).join(',') || null);
        }
      }
      else if (isTwoOptions) {
        _onChange(option?.key === '1', option!.key.toString());
      }
      else {
        _onChange(option?.key, option!.key.toString());
      }
    };

  const checkValidation = () => {
    if (isRequired && currentOptions.length < 1) {
      dispatch(setInvalidFields({ fieldId, isInvalid: true,
        errorMessage: 'Required fields must be filled in.' }));
    }
  };

  return (
    <Stack>
      <ComboBox
        options={options}
        multiSelect={isMultiple}
        selectedKey={currentOptions}
        autoComplete='off'
        onChange={onChange}
        styles={optionSetStyles(isRequired)}
        onMenuDismissed={() => checkValidation()}
        onMenuOpen={() =>
          dispatch(setInvalidFields({ fieldId, isInvalid: false, errorMessage: '' }))}
        disabled={disabled || isSecured}
        title={formattedValue}
      />
      <FontIcon iconName={'AsteriskSolid'} className={asteriskClassStyle(isRequired)} />
      <ErrorIcon id={fieldId} isRequired={isRequired} />
    </Stack>
  );
});
