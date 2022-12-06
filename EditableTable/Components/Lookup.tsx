import { ITag, TagPicker } from '@fluentui/react/lib/Pickers';
import { Stack } from '@fluentui/react';
import * as React from 'react';
import { useAppSelector } from '../Store/Hooks';
import { Lookup as CurrentLookup} from '../Store/Features/LookupSlice';
import { shallowEqual } from 'react-redux';

export interface ILookupProps {
  fieldName: string;
  defaultValue: string;
  _onChange: any,
  lookupReference: string,
}

export class LogicalName {
  fieldNameRef: string;
  entityNameRef: string;
  entityNavigation?: string;
}

export const Lookup = ({ fieldName, defaultValue, _onChange } : ILookupProps) => {
  const [options, setOptions] = React.useState<ITag[]>([]);
  const [currentOption, setCurrentOption] = React.useState<ITag[] | undefined>();
  const [currentLookup, setCurrentLookup] = React.useState<CurrentLookup>();
  // const [entityPluralName, setPluralName] = React.useState<string>('');
  // const [lookupRef, setLookupRef] = React.useState<LogicalName>();

  const lookups = useAppSelector(state => state.lookup.lookups, shallowEqual);
  
  React.useEffect(() => {
    const currentLookup = lookups.find(lookup => lookup.logicalName == fieldName);
    setCurrentLookup(currentLookup);
    const options = currentLookup ? currentLookup.options : []; 
    console.log('LOOKUP: ', currentLookup?.logicalName, fieldName, options);
    setOptions(options);
  }, [lookups]);

  React.useEffect(() => {
    if (defaultValue !== null) {
      const selectedOption = options.filter(opt => opt.name === defaultValue);
      setCurrentOption(selectedOption);
    }
  }, [options]);

  const initialValues = (selectedItems?: ITag[]): ITag[] => {
    console.log(selectedItems);
    if (options.length > 100) {
      return options.slice(0, 100);
    }
    return options;
  };

  const showMoreResults = (filter: string, selectedItems?: ITag[] | undefined) : ITag[] => {
    console.log(filter, selectedItems);
    const moreOptions = [...options];
    return moreOptions; 
  };

  const listContainsTagList = (tag: ITag, tagList?: ITag[]) => {
    if (!tagList || !tagList.length) {
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
    setCurrentOption(items);
    if (items !== undefined) _onChange( currentLookup?.reference?.entityNavigation,'lookup',`/${currentLookup?.entityPluralName}(${items[0].key})`);
    else _onChange('');
  };

  return <Stack>
      <TagPicker
        selectedItems={currentOption}
        onChange={onChange}
        onResolveSuggestions={filterSuggestedTags}
        onEmptyResolveSuggestions={initialValues}
        itemLimit={1}
        pickerSuggestionsProps={{ noResultsFoundText: 'No Results Found', searchForMoreText: 'Search for more' }}
        styles={{text: {minWidth: '30px'}, root: { maxWidth: '300px'}}}
        onGetMoreResults={showMoreResults}
      />
    </Stack>
};

// CSS fix
// when the lookup value is removed, the left border disappears
// fix with on focus event? by adding extra border-left 2px ! (ms-BasePicker-text text-430)
// don't forget border radius
