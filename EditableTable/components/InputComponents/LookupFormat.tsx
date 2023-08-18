/* eslint-disable react/display-name */
import { DefaultButton, FontIcon } from '@fluentui/react';
import { ITag, TagPicker } from '@fluentui/react/lib/Pickers';
import React, { memo, useState } from 'react';
import { IDataverseService } from '../../services/DataverseService';
import { useAppSelector } from '../../store/hooks';
import {
  asteriskClassStyle,
  errorTooltip,
  lookupFormatStyles,
  lookupSelectedOptionStyles,
} from '../../styles/ComponentsStyles';
import { ParentEntityMetadata } from '../EditableGrid/GridCell';

const MAX_NUMBER_OF_OPTIONS = 100;
const SINGLE_CLICK_CODE = 1;

export interface ILookupProps {
  fieldName: string;
  value: ITag | undefined;
  parentEntityMetadata: ParentEntityMetadata | undefined;
  isRequired: boolean;
  isSecured: boolean
  _onChange: Function;
  _service: IDataverseService;
}

export const LookupFormat = memo(
  ({ _service, fieldName, value, parentEntityMetadata, isSecured,
    isRequired, _onChange }: ILookupProps) => {
    const picker = React.useRef(null);
    const [isInvalid, setInvalid] = useState(false);

    const lookups = useAppSelector(state => state.lookup.lookups);
    const currentLookup = lookups.find(lookup => lookup.logicalName === fieldName);
    const options = currentLookup?.options ?? [];
    const currentOption = value ? [value] : [];
    const errorText = 'Required fields must be filled in.';

    if (value === undefined &&
      parentEntityMetadata !== undefined && parentEntityMetadata.entityId !== undefined) {
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
        onClick={event => {
          if (event.detail === SINGLE_CLICK_CODE) {
            _service.openForm(currentOption[0].key.toString(),
              currentLookup?.reference?.entityNameRef);
          }
        }}
        styles={lookupSelectedOptionStyles}
      />;

    return <div>
      <TagPicker
        selectedItems={currentOption}
        componentRef={picker}
        onChange={onChange}
        onResolveSuggestions={filterSuggestedTags}
        resolveDelay={1000}
        onEmptyResolveSuggestions={initialValues}
        itemLimit={1}
        pickerSuggestionsProps={{ noResultsFoundText: 'No Results Found' }}
        styles={lookupFormatStyles(isRequired)}
        onRenderItem={_onRenderItem}
        onBlur={() => {
          if (picker.current) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            picker.current.input.current._updateValue('');
            setInvalid(isRequired);
          }
        }}
        inputProps={{
          disabled: isSecured,
          onFocus: () => setInvalid(false),
        }}
      />
      <FontIcon iconName={'AsteriskSolid'} className={asteriskClassStyle(isRequired)} />
      <FontIcon
        iconName={'StatusErrorFull'}
        className={errorTooltip(isInvalid, errorText, isRequired)}
      />
    </div>;
  });
