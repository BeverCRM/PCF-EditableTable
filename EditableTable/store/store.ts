import { configureStore } from '@reduxjs/toolkit';
import lookupReducer from './features/LookupSlice';
import loadingReducer from './features/LoadingSlice';
import recordReducer from './features/RecordSlice';
import dropdownReducer from './features/DropdownSlice';
import numberReducer from './features/NumberSlice';
import wholeFormatReducer from './features/WholeFormatSlice';
import dateReducer from './features/DateSlice';

const store = configureStore({
  reducer: {
    lookup: lookupReducer,
    dropdown: dropdownReducer,
    number: numberReducer,
    loading: loadingReducer,
    record: recordReducer,
    wholeFormat: wholeFormatReducer,
    date: dateReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
