import { ITag, TagPicker } from '@fluentui/react/lib/Pickers';
import { Stack } from '@fluentui/react';
import * as React from 'react';
import { useAppSelector } from '../../store/hooks';

export interface ILookupProps {
  fieldName: string;
  defaultValue: ITag[] | undefined;
  _onChange: any,
  lookupReference: string,
}

export type LogicalName = {
  fieldNameRef: string;
  entityNameRef: string;
  entityNavigation?: string;
}

export const LookupFormat = ({ fieldName, defaultValue, _onChange } : ILookupProps) => {
  const [currentOption, setCurrentOption] = React.useState<ITag[] | undefined>(defaultValue);
  const picker = React.useRef(null);

  const lookups = useAppSelector(state => state.lookup.lookups);
  const currentLookup = lookups.find(lookup => lookup.logicalName === fieldName);
  const options = currentLookup ? currentLookup.options : [];

  const initialValues = (): ITag[] => {
    if (options.length > 100) {
      return options.slice(0, 100);
    }
    return options;
  };

  const listContainsTagList = (tag: ITag, tagList?: ITag[]) => {
    if (!tagList || !tagList.length) {
      return false;
    }
    return tagList.some(compareTag => compareTag.key === tag.key);
  };

  const filterSuggestedTags = (filterText: string, selectedItems?: ITag[]): ITag[] => filterText
    ? filterText.includes('*') && filterText.slice(1) !== ''
      ? options.filter(tag => {
        if (tag.name !== null) {
          return tag.name.toLowerCase()
            .includes(filterText.slice(1).toLowerCase()) &&
                      !listContainsTagList(tag, selectedItems);
        }
      })
      : options.filter(tag => {
        if (tag.name !== null) {
          return tag.name.toLowerCase()
            .indexOf(filterText.toLowerCase()) === 0 && !listContainsTagList(tag, selectedItems);
        }
      })
    : [];

  const onChange = (items?: ITag[] | undefined): void => {
    setCurrentOption(items);
    if (items !== undefined && items.length > 0) {
      _onChange(
        currentLookup?.reference?.entityNavigation,
        'lookup',
        `/${currentLookup?.entityPluralName}(${items[0].key})`);
    }
    else {
      _onChange(
        currentLookup?.reference?.entityNavigation,
        '',
        null);
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
