import { ITag, TagPicker } from '@fluentui/react/lib/Pickers';
import { Stack } from '@fluentui/react';
import * as React from 'react';
import { useAppSelector } from '../../store/hooks';

export interface ILookupProps {
  fieldName: string;
  defaultValue: ITag[] | undefined;
  _onChange: Function;
  lookupReference: string;
}

export const LookupFormat = ({ fieldName, defaultValue, _onChange }: ILookupProps) => {
  const [currentOption, setCurrentOption] = React.useState<ITag[] | undefined>(defaultValue);
  const picker = React.useRef(null);

  const lookups = useAppSelector(state => state.lookup.lookups);
  const currentLookup = lookups.find(lookup => lookup.logicalName === fieldName);
  const options = currentLookup?.options ?? [];

  const initialValues = (): ITag[] => {
    if (options.length > 100) {
      return options.slice(0, 100);
    }
    return options;
  };

  const listContainsTagList = (tag: ITag, tagList?: ITag[]) => {
    if (!tagList || tagList.length === 0) return false;

    return tagList.some(compareTag => compareTag.key === tag.key);
  };

  const filterSuggestedTags = (filterText: string, selectedItems?: ITag[]): ITag[] => {
    if (filterText.length === 0) return [];

    return options.filter(tag => {
      if (tag.name === null) return false;

      if (listContainsTagList(tag, selectedItems)) return false;

      return tag.name.toLowerCase().includes(filterText.toLowerCase());
    });
  };

  const onChange = (items?: ITag[] | undefined): void => {
    setCurrentOption(items);
    if (items !== undefined && items.length > 0) {
      _onChange(`/${currentLookup?.entityPluralName}(${items[0].key})`,
        currentLookup?.reference?.entityNavigation);
    }
    else {
      _onChange(null, currentLookup?.reference?.entityNavigation);
    }
  };

  return <Stack>
    <TagPicker
      selectedItems={currentOption}
      componentRef={picker}
      onChange={onChange}
      onResolveSuggestions={filterSuggestedTags}
      onEmptyResolveSuggestions={initialValues}
      itemLimit={1}
      pickerSuggestionsProps={{ noResultsFoundText: 'No Results Found' }}
      styles={{ text: { minWidth: '30px' }, root: { maxWidth: '300px' } }}
      onBlur={() => {
        if (picker.current) {
          // @ts-ignore
          picker.current.input.current._updateValue('');
        }
      }}
    />
  </Stack>;
};

// CSS fix
// when the lookup value is removed, the left border disappears
// fix with on focus event? by adding extra border-left 2px ! (ms-BasePicker-text text-430)
// don't forget border radius
