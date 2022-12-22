import * as React from 'react';
import { Stack, ComboBox, IComboBox, IComboBoxOption } from '@fluentui/react';

import { useAppSelector } from '../../store/hooks';

export interface IDropDownProps {
  fieldName: string | undefined;
  defaultValue: string;
  isMultiple: boolean;
  isTwoOptions?: boolean;
  _onChange: any
}

export const OptionSetFormat =
({ fieldName, defaultValue, isMultiple,
  isTwoOptions, _onChange } : IDropDownProps) => {
  const dropdowns = useAppSelector(state => state.dropdown.dropdownFields);
  const currentDropdown = dropdowns.find(dropdown => dropdown.fieldName === fieldName);
  const options = currentDropdown?.options ?? [];

  const values = defaultValue?.split('; ');
  const selectedValues = options.filter(opt => values?.some(val => {
    if (val === opt.text) return true;
  }));
  const selectedOptions = selectedValues.map(value => value.key as string);

  const [currentOptions, setCurrentOptions] = React.useState<string[]>(selectedOptions);

  const onMultipleOptionChange =
  (event: React.FormEvent<IComboBox>, option?: IComboBoxOption | undefined) => {
    console.log(isTwoOptions);
    if (option?.selected) {
      setCurrentOptions([...currentOptions, option.key as string]);
      _onChange([...currentOptions, option.key as string].join(', '));
    }
    else {
      setCurrentOptions(currentOptions.filter(key => key !== option?.key));
      _onChange(currentOptions.filter(key => key !== option?.key).join(', '));
    }
  };

  return <Stack>
    <ComboBox
      options={options}
      multiSelect={isMultiple}
      selectedKey={currentOptions}
      onChange={onMultipleOptionChange}
      styles={{ container: { maxWidth: '200px' } }}
    />
  </Stack>;
};
