import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ILoadingState {
  isLoading: boolean
}

const initialState: ILoadingState = {
  isLoading: true,
};

const LoadingSlice = createSlice({
  name: 'loading',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    load: state => {
      state.isLoading = !state.isLoading;
    },
  },
});

export const { setLoading, load } = LoadingSlice.actions;

export default LoadingSlice.reducer;
