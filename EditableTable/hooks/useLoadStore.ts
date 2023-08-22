import * as React from 'react';

import { setRelationships, setLookups } from '../store/features/LookupSlice';
import { getDropdownsOptions } from '../store/features/DropdownSlice';
import { getCurrencySymbols, getNumberFieldsMetadata } from '../store/features/NumberSlice';
import { getLanguages, getTimeZones } from '../store/features/WholeFormatSlice';
import { getDateBehavior } from '../store/features/DateSlice';
import { setLoading } from '../store/features/LoadingSlice';

import { useAppDispatch } from '../store/hooks';

import { mapDataSetColumns, mapDataSetRows } from '../mappers/dataSetMapper';
import {
  setCalculatedFields,
  setEntityPrivileges,
  setRequirementLevels,
  setSecuredFields,
} from '../store/features/DatasetSlice';
import { IDataverseService } from '../services/DataverseService';
import { getTextMetadata } from '../store/features/TextSlice';

type DataSet = ComponentFramework.PropertyTypes.DataSet;

export type Field = {
  key: string,
  fieldName: string | undefined,
  data: string | undefined,
}

export const useLoadStore = (dataset: DataSet, _service: IDataverseService) => {
  const dispatch = useAppDispatch();

  React.useEffect(() => {
    const columns = mapDataSetColumns(dataset, _service);
    const datasetRows = mapDataSetRows(dataset);

    const columnKeys = columns.map(column => column.key);

    const getColumnsOfType = (types: string[]): Field[] =>
      columns.filter(column => types.includes(column.data))
        .map(column => ({
          key: column.key,
          fieldName: column.fieldName,
          data: column.data,
        }));

    const textFields = getColumnsOfType(['SingleLine.Text', 'Multiple']);
    if (textFields.length > 0) {
      dispatch(getTextMetadata({ textFields, _service })).unwrap()
        .catch(error =>
          _service.openErrorDialog(error).then(() => {
            dispatch(setLoading(false));
          }));
    }

    const lookupColumns = getColumnsOfType(['Lookup.Simple']);
    if (lookupColumns.length > 0) {
      dispatch(setRelationships(_service)).unwrap()
        .then(() => {
          dispatch(setLookups({ lookupColumns, _service })).unwrap()
            .catch(error =>
              _service.openErrorDialog(error).then(() => {
                dispatch(setLoading(false));
              }));
        })
        .catch(error =>
          _service.openErrorDialog(error).then(() => {
            dispatch(setLoading(false));
          }));
    }

    const dropdownFields = getColumnsOfType(['OptionSet', 'TwoOptions', 'MultiSelectPicklist']);
    if (dropdownFields.length > 0) {
      dispatch(getDropdownsOptions({ dropdownFields, _service })).unwrap()
        .catch(error =>
          _service.openErrorDialog(error).then(() => {
            dispatch(setLoading(false));
          }));
    }

    const numberFields = getColumnsOfType(['Decimal', 'Currency', 'FP', 'Whole.None']);
    if (numberFields.length > 0) {
      dispatch(getNumberFieldsMetadata({ numberFields, _service }));

      if (numberFields.some(numberColumn => numberColumn.data === 'Currency')) {
        const recordIds = datasetRows.map(row => row.key);
        dispatch(getCurrencySymbols({ recordIds, _service }));
      }
    }

    const timezoneColumns = getColumnsOfType(['Whole.TimeZone']);
    if (timezoneColumns.length > 0) {
      dispatch(getTimeZones(_service));
    }

    const languageColumns = getColumnsOfType(['Whole.Language']);
    if (languageColumns.length > 0) {
      dispatch(getLanguages(_service));
    }

    const dateFields = getColumnsOfType(['DateAndTime.DateAndTime', 'DateAndTime.DateOnly']);
    if (dateFields.length > 0) {
      dispatch(getDateBehavior({ dateFields, _service }));
    }

    dispatch(setRequirementLevels({ columnKeys, _service }));
    dispatch(setCalculatedFields({ columnKeys, _service }));
    dispatch(setSecuredFields({ columnKeys, _service }));
    dispatch(setEntityPrivileges(_service));
  }, [dataset]);
};
