import { Dropdown, IDropdownOption, Stack } from '@fluentui/react';
import { ComboBox, IComboBox, IComboBoxOption } from '@fluentui/react';
import * as React from 'react';
import { shallowEqual } from 'react-redux';
import { useAppSelector } from '../../store/hooks';

export interface IDropDownProps {
  fieldName: string | undefined;
  defaultValue: string;
  isMultiple: boolean;
  isTwoOptions?: boolean;
  onOptionChange: any
}

export const OptionSetFormat =
({ fieldName, defaultValue, isMultiple,
  isTwoOptions, onOptionChange } : IDropDownProps) => {
  const [options, setOptions] = React.useState<IDropdownOption[]>([]);
  const [currentOption, setCurrentOption] = React.useState<string | number | undefined>('');
  const [currentOptions, setCurrentOptions] = React.useState<string[]>([]);

  const dropdowns = useAppSelector(state => state.dropdown.dropdownFields, shallowEqual);

  React.useEffect(() => {
    const currentDropdown = dropdowns.find(dropdown => dropdown.fieldName === fieldName);
    setOptions(currentDropdown ? currentDropdown.options : []);
    console.log('DROPDOWN: ', currentDropdown?.fieldName, fieldName, options);
  }, [dropdowns]);

  React.useMemo(() => {
    if (!isMultiple) {
      const selectedOption = options.find(opt => opt.text === defaultValue);
      console.log(selectedOption ? selectedOption.key : '');
      setCurrentOption(selectedOption ? selectedOption.key : '');
    }
    else {
      const values = defaultValue?.split('; ');
      const selectedValues = options.filter(opt => values?.some(val => {
        if (val === opt.text) return true;
      }));
      const selectedOptions = selectedValues.map(value => value.key as string);
      console.log(selectedOptions);
      setCurrentOptions(selectedOptions);
    }
  }, [options]);

  const onSingleOptionChange =
  (event: React.FormEvent<HTMLDivElement>, option?: IDropdownOption | undefined) => {
    if (isTwoOptions) {
      onOptionChange(option?.key === 1);
    }
    else {
      onOptionChange(option?.key);
    }
  };

  const onMultipleOptionChange =
  (event: React.FormEvent<IComboBox>, option?: IComboBoxOption | undefined) => {
    if (option?.selected) {
      setCurrentOptions([...currentOptions, option.key as string]);
      onOptionChange([...currentOptions, option.key as string].join(', '));
    }
    else {
      setCurrentOptions(currentOptions.filter(key => key !== option?.key));
      onOptionChange(currentOptions.filter(key => key !== option?.key).join(', '));
    }
  };

  return <Stack>
    {!isMultiple
      ? <Dropdown
        options={options}
        defaultSelectedKey={currentOption}
        onChange={onSingleOptionChange}
        styles={{ dropdown: { maxWidth: '200px' } }}
      />
      : <ComboBox
        options={options}
        multiSelect
        selectedKey={currentOptions}
        onChange={onMultipleOptionChange}
        styles={{ container: { maxWidth: '200px' } }}
      />
    }
  </Stack>;
};
