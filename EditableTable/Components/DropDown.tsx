import { Dropdown, IDropdownOption, Stack } from '@fluentui/react';
import { ComboBox, IComboBox, IComboBoxOption } from '@fluentui/react';
import * as React from 'react';
import { _context } from '../Services/DataverseService';

export interface IDropDownProps {
  entityName: string;
  fieldName: string | undefined;
  defaultValue: string;
  isMultiple: boolean;
  isTwoOptions?: boolean;
  onOptionChange: any
}

export const DropDown =
({ entityName, fieldName, defaultValue, isMultiple,
  isTwoOptions, onOptionChange } : IDropDownProps) => {
  const [options, setOptions] = React.useState<IDropdownOption[]>([]);
  const [selectedOption, setSelectedOption] = React.useState<string | number | undefined>('');
  const [selectedOptions, setSelectedOptions] = React.useState<string[]>([]);

  React.useEffect(() => {
    // @ts-ignore
    const clientUrl = `${_context.page.getClientUrl()}/api/data/v9.2/`;
    let attributeType = 'PicklistAttributeMetadata';

    if (isTwoOptions) attributeType = 'BooleanAttributeMetadata';

    if (isMultiple) attributeType = 'MultiSelectPicklistAttributeMetadata';

    if (fieldName === 'statuscode') attributeType = 'StatusAttributeMetadata';

    if (fieldName === 'statecode') attributeType = 'StateAttributeMetadata';

    // eslint-disable-next-line max-len
    const request = `${clientUrl}EntityDefinitions(LogicalName='${entityName}')/Attributes/Microsoft.Dynamics.CRM.${attributeType}?$select=LogicalName&$filter=LogicalName eq '${fieldName}'&$expand=OptionSet`;
    const options: IDropdownOption[] = [];
    const req = new XMLHttpRequest();
    req.open('GET', request, true);
    req.setRequestHeader('OData-MaxVersion', '4.0');
    req.setRequestHeader('OData-Version', '4.0');
    req.setRequestHeader('Accept', 'application/json');
    req.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
    req.setRequestHeader('Prefer', 'odata.include-annotations="*"');
    req.onreadystatechange = function() {
      if (this.readyState === 4) {
        req.onreadystatechange = null;
        if (this.status === 200) {
          const results = JSON.parse(this.response);
          if (!isTwoOptions) {
            for (let i = 0; i < results.value[0].OptionSet.Options.length; i++) {
              const key = results.value[0].OptionSet.Options[i].Value;
              const text = results.value[0].OptionSet.Options[i].Label.UserLocalizedLabel.Label;
              options.push({ key, text });
            }
          }
          else {
            const trueKey = results.value[0].OptionSet.TrueOption.Value;
            const trueText = results.value[0].OptionSet.TrueOption.Label.UserLocalizedLabel.Label;
            options.push({ key: trueKey, text: trueText });
            const falseKey = results.value[0].OptionSet.FalseOption.Value;
            const falseText = results.value[0].OptionSet.FalseOption.Label.UserLocalizedLabel.Label;
            options.push({ key: falseKey, text: falseText });
          }
          setOptions(options);
        }
        else {
          console.log(this.statusText);
        }
      }
    };
    req.send();
  }, [entityName]);

  React.useMemo(() => {
    if (!isMultiple) {
      const selectedValue = options.find(opt => opt.text === defaultValue);
      setSelectedOption(selectedValue?.key);
    }
    else {
      const values = defaultValue?.split('; ');
      const selectedValues = options.filter(opt => values?.some(val => {
        if (val === opt.text) return true;
      }));
      const selectedOptions = selectedValues.map(value => value.key as string);
      setSelectedOptions(selectedOptions);
    }
  }, [options]);

  // React.useEffect(() => {
  //   onOptionChange(selectedOptions.join(', '));
  // }, [selectedOptions]);

  const _onDropdownChange =
  (event: React.FormEvent<HTMLDivElement>, option?: IDropdownOption | undefined) => {
    if (isTwoOptions) {
      onOptionChange(option?.key === 1);
    }
    else {
      onOptionChange(option?.key);
    }
  };

  const _onComboChange =
  (event: React.FormEvent<IComboBox>, option?: IComboBoxOption | undefined) => {
    if (option?.selected) {
      setSelectedOptions([...selectedOptions, option.key as string]);
      // setSelectedOptions(
      //   option.selected ? [...selectedOptions, option.key as string]
      //     : selectedOptions.filter(key => key !== option.key),
      // );
      onOptionChange([...selectedOptions, option.key as string].join(', '));
    }
    else {
      setSelectedOptions(selectedOptions.filter(key => key !== option?.key));
      onOptionChange(selectedOptions.filter(key => key !== option?.key).join(', '));
    }
  };

  return (
    <Stack>
      {!isMultiple
        ? <Dropdown
          options={options}
          defaultSelectedKey={selectedOption}
          onChange={_onDropdownChange}
          styles={{ dropdown:{maxWidth: '200px'} }}
        />
        : <ComboBox
          options={options}
          multiSelect
          selectedKey={selectedOptions}
          onChange={_onComboChange}
          styles={{container: { maxWidth: '200px' }}}
        />
      }
    </Stack>
  );
};
