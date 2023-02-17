import { DefaultButton } from '@fluentui/react';
import { ITag, TagPicker } from '@fluentui/react/lib/Pickers';
import React, { memo } from 'react';
import { openForm } from '../../services/DataverseService';
import { useAppSelector } from '../../store/hooks';
import { lookupFormatStyles, lookupSelectedOptionStyles } from '../../styles/ComponentsStyles';
import { ParentEntityMetadata } from '../EditableGrid/GridCell';

export interface ILookupProps {
  fieldName: string;
  value: ITag | undefined;
  parentEntityMetadata: ParentEntityMetadata | undefined;
  _onChange: Function;
  _onDoubleClick: Function;
}

const MAX_NUMBER_OF_OPTIONS = 100;
const SINGLE_CLICK_CODE = 1;

export const LookupFormat = memo(
  ({ fieldName, value, parentEntityMetadata, _onChange, _onDoubleClick }: ILookupProps) => {
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
      if (options.length > MAX_NUMBER_OF_OPTIONS) {
        return options.slice(0, MAX_NUMBER_OF_OPTIONS);
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

    const _onRenderItem = () =>
      <DefaultButton
        text={currentOption[0].name}
        split
        menuProps={{ items: [] }}
        menuIconProps={{
          iconName: 'Cancel',
        }}
        onMenuClick={() => onChange(undefined)}
        onClick={(event: any) => {
          if (event.detail === SINGLE_CLICK_CODE) {
            openForm(currentOption[0].key.toString(),
              currentLookup?.reference?.entityNameRef);
          }
        }}
        styles={lookupSelectedOptionStyles}
      />;

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
      onRenderItem={_onRenderItem}
      onBlur={() => {
        if (picker.current) {
          // @ts-ignore
          picker.current.input.current._updateValue('');
        }
      }}
      inputProps={{
        onDoubleClick: () => _onDoubleClick(),
        disabled: false,
      }}
    />;
  });
