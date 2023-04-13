import React, { memo, useState } from 'react';
import { Stack, ComboBox, IComboBox, IComboBoxOption, FontIcon } from '@fluentui/react';

import { useAppSelector } from '../../store/hooks';
import { asteriskClassStyle, errorTooltip, optionSetStyles } from '../../styles/ComponentsStyles';

export interface IDropDownProps {
  fieldName: string | undefined;
  value: string | null;
  isMultiple: boolean;
  isTwoOptions?: boolean;
  _onChange: Function;
  _onDoubleClick: Function;
  isRequired: boolean;
}

export const OptionSetFormat =
  memo(({ fieldName, value, isMultiple, isRequired,
    isTwoOptions, _onChange, _onDoubleClick }: IDropDownProps) => {
    const [isInvalid, setInvalid] = useState<boolean>(false);
    const errorText = 'Required fields must be filled in.';
    const currentOptions: string[] = value ? value.split(',') : [];
    const dropdowns = useAppSelector(state => state.dropdown.dropdownFields);
    const currentDropdown = dropdowns.find(dropdown => dropdown.fieldName === fieldName);
    const options = currentDropdown?.options ?? [];

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
          onChange={onChange}
          onDoubleClick={() => _onDoubleClick()}
          styles={optionSetStyles(isRequired)}
          onMenuDismissed={() => checkValidation()}
          onMenuOpen={() => setInvalid(false)}
        />
        <FontIcon iconName={'AsteriskSolid'} className={asteriskClassStyle(isRequired)}/>
        <FontIcon iconName={'StatusErrorFull'} className={errorTooltip(isInvalid, errorText)} />
      </Stack>
    );
  });
