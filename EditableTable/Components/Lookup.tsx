import { ITag, TagPicker } from '@fluentui/react/lib/Pickers';
import { Stack } from '@fluentui/react';
import * as React from 'react';
import DataverseService, { _context } from '../Services/DataverseService';

export interface ILookupProps {
  fieldName: string;
  defaultValue: string;
  _onChange: any,
  entityName: any
}

class LogicalName {
  fieldNameRef: string;
  entityNameRef: string
}

export const Lookup = ({ fieldName, entityName, defaultValue, _onChange } : ILookupProps) => {
  const [options, setOptions] = React.useState<ITag[]>([]);
  const [selectedOption, setSelectedOption] = React.useState<ITag[] | undefined>();
  const [entityPluralName, setPluralName] = React.useState<string>('');
  const [logicalNames, setLogicalNames] = React.useState<LogicalName[]>([]);

  React.useMemo(() => {
    setLogicalNames(DataverseService.getRelationships(entityName));
  }, [entityName]);

  React.useEffect(() => {
    if (fieldName !== null && fieldName !== undefined) {
      if (logicalNames.length > 0) {
        const lookupRef = logicalNames.find(
          (ref: { fieldNameRef: string; entityNameRef: string}) => {
            if (ref.fieldNameRef === fieldName) return true;
          });
        const lookupLogicalName = lookupRef?.entityNameRef || '';
        if (lookupLogicalName !== '') {
          _context.utils.getEntityMetadata(lookupLogicalName).then(metadata => {
            const lookups: ITag[] = [];
            setPluralName(metadata.EntitySetName);
            const entityNameFieldName = metadata.PrimaryNameAttribute;
            const entityIdFieldName = metadata.PrimaryIdAttribute;
            // @ts-ignore
            const clientUrl = `${_context.page.getClientUrl()}/api/data/v9.2/`;
            // eslint-disable-next-line max-len
            const request = `${clientUrl}${metadata.EntitySetName}?$select=${entityIdFieldName},${entityNameFieldName}`;
            const req = new XMLHttpRequest();
            req.open('GET', request, false);
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
                  for (let i = 0; i < results.value.length; i++) {
                    const name = results.value[i][entityNameFieldName];
                    const key = results.value[i][entityIdFieldName];
                    lookups.push({ key, name });
                  }
                  setOptions(lookups);
                }
                else {
                  const error = JSON.parse(this.response);
                  console.log(error.message);
                }
              }
            };
            req.send();
          });
        }
      }
    }
  }, [logicalNames]);

  React.useMemo(() => {
    if (defaultValue !== undefined && defaultValue !== null) {
      const selectedOption = options.filter(opt => opt.name === defaultValue);
      setSelectedOption(selectedOption);
    }
  },
  [options]);

  const initialValues = (selectedItems?: ITag[]): ITag[] => {
    console.log(selectedItems);
    if (options.length > 100) {
      return options.slice(0, 100);
    }
    return options;
  };

  const listContainsTagList = (tag: ITag, tagList?: ITag[]) => {
    if (!tagList || !tagList.length || tagList.length === 0) {
      return false;
    }
    return tagList.some(compareTag => compareTag.key === tag.key);
  };

  const filterSuggestedTags = (filterText: string, selectedItems?: ITag[]): ITag[] => filterText
    ? options.filter(
      tag => tag.name.toLowerCase().indexOf(filterText.toLowerCase()) === 0 &&
      !listContainsTagList(tag, selectedItems),
    )
    : [];

  const onChange = (items?: ITag[] | undefined): void => {
    setSelectedOption(items);
    if (items !== undefined) _onChange(`/${entityPluralName}(${items[0].key})`);
    else _onChange('');
  };

  return (
    <Stack>
      <TagPicker
        selectedItems={selectedOption}
        onChange={onChange}
        onResolveSuggestions={filterSuggestedTags}
        onEmptyResolveSuggestions={initialValues}
        itemLimit={1}
        pickerSuggestionsProps={{ noResultsFoundText: 'No Results Found' }}
      />
    </Stack>
  );
};

// CSS fix
// when the lookup value is removed, the left border disappears
// fix with on focus event? by adding extra border-left 2px ! (ms-BasePicker-text text-430)
// don't forget border radius
