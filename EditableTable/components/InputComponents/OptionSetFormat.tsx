import React, { memo } from 'react';
import { Stack, ComboBox, IComboBox, IComboBoxOption, FontIcon } from '@fluentui/react';

import { useAppSelector } from '../../store/hooks';
import { asteriskClassStyle, optionSetStyles } from '../../styles/ComponentsStyles';
import { IDataverseService } from '../../services/DataverseService';

export interface IDropDownProps {
  fieldName: string | undefined;
  value: string | null;
  isMultiple: boolean;
  isTwoOptions?: boolean;
  _onChange: Function;
  _onDoubleClick: Function;
  isRequired: boolean;
  _service: IDataverseService;
}

export const OptionSetFormat =
  memo(({ fieldName, value, isMultiple, isRequired, isTwoOptions,
    _onChange, _onDoubleClick, _service }: IDropDownProps) => {
    let currentValue = value;
    const dropdowns = useAppSelector(state => state.dropdown.dropdownFields);
    const currentDropdown = dropdowns.find(dropdown => dropdown.fieldName === fieldName);
    const options = currentDropdown?.options ?? [];

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

    return (
      <Stack>
        <ComboBox
          options={options}
          multiSelect={isMultiple}
          selectedKey={currentOptions}
          disabled={fieldName === 'statuscode' || fieldName === 'statecode'}
          onChange={onChange}
          onDoubleClick={() => _onDoubleClick()}
          styles={optionSetStyles(isRequired)}
        />
        <FontIcon iconName={'AsteriskSolid'} className={asteriskClassStyle(isRequired)}/>
      </Stack>
    );
  });
