import * as React from 'react';
import { Provider } from 'react-redux';
import store from '../store/store';
import { EditableGrid, IDataSetProps } from './EditableGrid/EditableGrid';
import { Loading } from './Loading';

export const Wrapper = (props: IDataSetProps) =>
  <Provider store={store}>
    <div className='appWrapper'>
      <Loading />
      <EditableGrid {...props} />
    </div>
  </Provider>;
