import * as React from 'react';
import { Stack, ComboBox, IComboBox, IComboBoxOption } from '@fluentui/react';

import { useAppSelector } from '../../store/hooks';

export interface IDropDownProps {
  fieldName: string | undefined;
  defaultValue: string[];
  isMultiple: boolean;
  isTwoOptions?: boolean;
  _onChange: Function;
}

export const OptionSetFormat =
  ({ fieldName, defaultValue, isMultiple,
    isTwoOptions, _onChange }: IDropDownProps) => {
    const [currentOptions, setCurrentOptions] = React.useState<string[]>(defaultValue ?? []);

    const dropdowns = useAppSelector(state => state.dropdown.dropdownFields);
    const currentDropdown = dropdowns.find(dropdown => dropdown.fieldName === fieldName);
    const options = currentDropdown?.options ?? [];

    const onChange =
      (event: React.FormEvent<IComboBox>, option?: IComboBoxOption | undefined) => {
        if (isMultiple) {
          if (option?.selected) {
            // doesnt work ?
            _onChange([...currentOptions, option.key as string].join(', '));
            setCurrentOptions([...currentOptions, option.key as string]);
          }
          else {
            _onChange(currentOptions.filter(key => key !== option?.key).join(', '));
            setCurrentOptions(currentOptions.filter(key => key !== option?.key));
          }
        }
        else if (isTwoOptions) {
          setCurrentOptions([option!.key.toString()]);
          _onChange(option?.key === '1');
        }
        else {
          setCurrentOptions([option!.key.toString()]);
          _onChange(option?.key);
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
