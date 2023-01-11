import * as React from 'react';
import { Stack, ComboBox, IComboBox, IComboBoxOption } from '@fluentui/react';

import { useAppSelector } from '../../store/hooks';

export interface IDropDownProps {
  fieldName: string | undefined;
  currentOptions: string[];
  isMultiple: boolean;
  isTwoOptions?: boolean;
  _onChange: Function;
}

export const OptionSetFormat =
  ({ fieldName, currentOptions, isMultiple,
    isTwoOptions, _onChange }: IDropDownProps) => {

    const dropdowns = useAppSelector(state => state.dropdown.dropdownFields);
    const currentDropdown = dropdowns.find(dropdown => dropdown.fieldName === fieldName);
    const options = currentDropdown?.options ?? [];

    const onChange =
      (event: React.FormEvent<IComboBox>, option?: IComboBoxOption | undefined) => {
        if (isMultiple) {
          if (option?.selected) {
            currentOptions.push(option.key as string);
            _onChange([...currentOptions, option.key as string].join(', '),
              [...currentOptions, option.key as string].join(','));
          }
          else {
            currentOptions.filter(key => key !== option?.key);
            _onChange(currentOptions.filter(key => key !== option?.key).join(', ') || null,
              currentOptions.filter(key => key !== option?.key).join(',') || null);
          }
        }
        else if (isTwoOptions) {
          _onChange(option?.key === '1', option!.key.toString());
          currentOptions = [option!.key.toString()];
        }
        else {
          _onChange(option?.key, option!.key.toString());
          currentOptions = [option!.key.toString()];
        }
      };

    return <Stack>
      <ComboBox
        options={options}
        multiSelect={isMultiple}
        selectedKey={currentOptions}
        onChange={onChange}
        styles={{ container: { maxWidth: '200px' } }}
      />
    </Stack>;
  };
