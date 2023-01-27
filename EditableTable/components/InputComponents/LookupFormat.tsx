import { ITag, TagPicker } from '@fluentui/react/lib/Pickers';
// import { Stack } from '@fluentui/react';
import React, { memo } from 'react';
import { useAppSelector } from '../../store/hooks';
import { lookupFormatStyles } from '../../styles/ComponentsStyles';
import { ParentEntityMetadata } from '../EditableGrid/GridCell';

export interface ILookupProps {
  fieldName: string;
  value: ITag | undefined;
  parentEntityMetadata: ParentEntityMetadata | undefined;
  _onChange: Function;
}

export const LookupFormat = memo(
  ({ fieldName, value, parentEntityMetadata, _onChange }: ILookupProps) => {
    const picker = React.useRef(null);

    const lookups = useAppSelector(state => state.lookup.lookups);
    const currentLookup = lookups.find(lookup => lookup.logicalName === fieldName);
    const options = currentLookup?.options ?? [];
    const currentOption = value ? [value] : [];

    if (value === undefined && parentEntityMetadata !== undefined) {
      if (currentLookup?.reference?.entityNameRef === parentEntityMetadata.entityTypeName) {
        currentOption.push({
          key: parentEntityMetadata.entityId,
          name: parentEntityMetadata.entityRecordName,
        });
        _onChange(`/${currentLookup?.entityPluralName}(${parentEntityMetadata.entityId})`,
          currentOption[0],
          currentLookup?.reference?.entityNavigation);
      }
    }

    const initialValues = (): ITag[] => {
      if (options.length > 100) {
        return options.slice(0, 100);
      }
      return options;
    };

    const filterSuggestedTags = (filterText: string): ITag[] => {
      if (filterText.length === 0) return [];

      return options.filter(tag => {
        if (tag.name === null) return false;

        return tag.name.toLowerCase().includes(filterText.toLowerCase());
      });
    };

    const onChange = (items?: ITag[] | undefined): void => {
      if (items !== undefined && items.length > 0) {
        _onChange(`/${currentLookup?.entityPluralName}(${items[0].key})`, items[0],
          currentLookup?.reference?.entityNavigation);
      }
      else {
        _onChange(null, null, currentLookup?.reference?.entityNavigation);
      }
    };

    return <TagPicker
      selectedItems={currentOption}
      componentRef={picker}
      onChange={onChange}
      onResolveSuggestions={filterSuggestedTags}
      resolveDelay={1000}
      onEmptyResolveSuggestions={initialValues}
      itemLimit={1}
      pickerSuggestionsProps={{ noResultsFoundText: 'No Results Found' }}
      styles={lookupFormatStyles}
      onBlur={() => {
        if (picker.current) {
          // @ts-ignore
          picker.current.input.current._updateValue('');
        }
      }}
    />;
  });
