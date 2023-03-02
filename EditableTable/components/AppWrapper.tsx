import * as React from 'react';
import { Provider } from 'react-redux';
import { IDataSetProps } from '../utils/types';
import { EditableGrid } from './EditableGrid/EditableGrid';
import { Loading } from './Loading';

export const Wrapper = (props: IDataSetProps) =>
  <Provider store={props._store} >
    <div className='appWrapper'>
      <Loading />
      <EditableGrid {...props} />
    </div>
  </Provider>;
