import { configureStore } from '@reduxjs/toolkit';
import lookupReducer from './features/LookupSlice';
import loadingReducer from './features/LoadingSlice';
import recordReducer from './features/RecordSlice';
import dropdownReducer from './features/DropdownSlice';
import numberReducer from './features/NumberSlice';
import wholeFormatReducer from './features/WholeFormatSlice';
import dateReducer from './features/DateSlice';
import datasetReducer from './features/DatasetSlice';

export const callConfigureStore = () => configureStore({
  reducer: {
    dataset: datasetReducer,
    lookup: lookupReducer,
    number: numberReducer,
    dropdown: dropdownReducer,
    loading: loadingReducer,
    record: recordReducer,
    wholeFormat: wholeFormatReducer,
    date: dateReducer,
  },
});
