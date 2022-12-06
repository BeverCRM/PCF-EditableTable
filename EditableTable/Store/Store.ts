import { configureStore } from '@reduxjs/toolkit';
import lookupReducer from './Features/LookupSlice';
import loadingReducer from './Features/LoadingSlice';
import recordReducer from './Features/RecordSlice';
import dropdownReducer from './Features/DropdownSlice';
import numberReducer from './Features/NumberSlice';
import wholeFormatReducer from './Features/WholeFormatSlice';
import dateReducer from './Features/DateSlice';

const store = configureStore({
  reducer: {
    lookup: lookupReducer,
    dropdown: dropdownReducer,
    number: numberReducer,
    loading: loadingReducer, 
    record: recordReducer,
    wholeFormat: wholeFormatReducer,
    date: dateReducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;