import { useEffect } from 'react';

import { IColumn } from '@fluentui/react';

import { setRelationships, setLookups } from '../store/features/LookupSlice';
import { getDropdownsOptions } from '../store/features/DropdownSlice';
import { getCurrencySymbols, getNumberFieldsMetadata } from '../store/features/NumberSlice';
import { getLanguages, getTimeZones } from '../store/features/WholeFormatSlice';
import { getDateBehavior } from '../store/features/DateSlice';
import { setLoading } from '../store/features/LoadingSlice';

import { useAppDispatch } from '../store/hooks';

import { getTargetEntityType } from '../services/DataverseService';

import { mapDataSetColumns, mapDataSetRows } from '../mappers/dataSetMapper';

type DataSet = ComponentFramework.PropertyTypes.DataSet;

export const useLoadStore = (dataset: DataSet) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const columns = mapDataSetColumns(dataset);
    const datasetRows = mapDataSetRows(dataset);

    const getColumnsOfType = (types: string[]): IColumn[] =>
      columns.filter(column => types.includes(column.data));

    const lookupColumns = getColumnsOfType(['Lookup.Simple']);
    if (lookupColumns.length > 0) {
      dispatch(setRelationships(getTargetEntityType())).unwrap()
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

    dispatch(setLoading(false));
  }, [dataset]);
};
