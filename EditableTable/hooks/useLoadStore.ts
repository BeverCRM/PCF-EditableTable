import { useEffect } from 'react';

import { setRelationships, setLookups } from '../store/features/LookupSlice';
import { getDropdownsOptions } from '../store/features/DropdownSlice';
import { getCurrencySymbols, getNumberFieldsMetadata } from '../store/features/NumberSlice';
import { getLanguages, getTimeZones } from '../store/features/WholeFormatSlice';
import { getDateBehavior } from '../store/features/DateSlice';
import { setLoading } from '../store/features/LoadingSlice';

import { useAppDispatch } from '../store/hooks';

import { mapDataSetColumns, mapDataSetRows } from '../mappers/dataSetMapper';
import { setRequirementLevels } from '../store/features/DatasetSlice';

type DataSet = ComponentFramework.PropertyTypes.DataSet;

export type Field = {
  key: string,
  fieldName: string | undefined,
  data: string | undefined,
}

export const useLoadStore = (dataset: DataSet) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const columns = mapDataSetColumns(dataset);
    const datasetRows = mapDataSetRows(dataset);

    const columnKeys = columns.map(column => column.key);

    const getColumnsOfType = (types: string[]): Field[] =>
      columns.filter(column => types.includes(column.data))
        .map(column => ({
          key: column.key,
          fieldName: column.fieldName,
          data: column.data,
        }));

    const lookupColumns = getColumnsOfType(['Lookup.Simple']);
    if (lookupColumns.length > 0) {
      dispatch(setRelationships()).unwrap()
        .then(() => {
          dispatch(setLookups(lookupColumns));
        });
    }

    const dropdownColumns = getColumnsOfType(['OptionSet', 'TwoOptions', 'MultiSelectPicklist']);
    if (dropdownColumns.length > 0) {
      dispatch(getDropdownsOptions(dropdownColumns));
    }

    const numberColumns = getColumnsOfType(['Decimal', 'Currency', 'FP', 'Whole.None']);
    if (numberColumns.length > 0) {
      dispatch(getNumberFieldsMetadata(numberColumns));

      if (numberColumns.some(numberColumn => numberColumn.data === 'Currency')) {
        dispatch(getCurrencySymbols(datasetRows.map(row => row.key)));
      }
    }

    const timezoneColumns = getColumnsOfType(['Whole.TimeZone']);
    if (timezoneColumns.length > 0) {
      dispatch(getTimeZones());
    }

    const languageColumns = getColumnsOfType(['Whole.Language']);
    if (languageColumns.length > 0) {
      dispatch(getLanguages());
    }

    const dateColumns = getColumnsOfType(['DateAndTime.DateAndTime', 'DateAndTime.DateOnly']);
    if (dateColumns.length > 0) {
      dispatch(getDateBehavior(dateColumns));
    }

    dispatch(setRequirementLevels(columnKeys));

    dispatch(setLoading(false));
  }, [dataset]);
};
