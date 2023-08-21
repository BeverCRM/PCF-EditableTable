/* eslint-disable react/display-name */
import React, { memo, useState } from 'react';
import { Stack, ComboBox, IComboBox, IComboBoxOption, FontIcon } from '@fluentui/react';

import { useAppSelector } from '../../store/hooks';
import { asteriskClassStyle, errorTooltip, optionSetStyles } from '../../styles/ComponentsStyles';
import { IDataverseService } from '../../services/DataverseService';
import { formatTitle } from '../../utils/formattingUtils';

export interface IDropDownProps {
  fieldName: string | undefined;
  value: string | null;
  isMultiple: boolean;
  isTwoOptions?: boolean;
  _onChange: Function;
  isRequired: boolean;
  isDisabled: boolean;
  isSecured: boolean;
  _service: IDataverseService;
}

export const OptionSetFormat = memo(({ fieldName, value, isMultiple, isRequired, isTwoOptions,
  isDisabled, isSecured, _onChange, _service }: IDropDownProps) => {
  const [isInvalid, setInvalid] = useState(false);
  const errorText = 'Required fields must be filled in.';
  let currentValue = value;
  const dropdowns = useAppSelector(state => state.dropdown.dropdownFields);
  const currentDropdown = dropdowns.find(dropdown => dropdown.fieldName === fieldName);
  const options = currentDropdown?.options ?? [];
  const disabled = fieldName === 'statuscode' || fieldName === 'statecode' || isDisabled;

  if (_service.isStatusField(fieldName) && !currentValue) {
    currentValue = options.find(option =>
      option.text.toLowerCase().includes('active'))?.key.toString() || '';
  }
  const currentOptions: string[] = currentValue ? currentValue.split(',') : [];

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
      setInvalid(true);
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
        onMenuOpen={() => setInvalid(false)}
        disabled={disabled || isSecured}
        title={formatTitle(options, currentOptions)}
      />
      <FontIcon iconName={'AsteriskSolid'} className={asteriskClassStyle(isRequired)} />
      <FontIcon
        iconName={'StatusErrorFull'}
        className={errorTooltip(isInvalid, errorText, isRequired)}
      />
    </Stack>
  );
});
