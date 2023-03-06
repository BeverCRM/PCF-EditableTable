import * as React from 'react';
import { Provider } from 'react-redux';
import { IDataverseService, Store } from '../utils/types';
import { EditableGrid } from './EditableGrid/EditableGrid';
import { Loading } from './Loading';

type DataSet = ComponentFramework.PropertyTypes.DataSet;

export interface IDataSetProps {
  dataset: DataSet;
  isControlDisabled: boolean;
  width: number;
  _store: Store;
  _service: IDataverseService;
}

export const Wrapper = (props: IDataSetProps) =>
  <Provider store={props._store} >
    <div className='appWrapper'>
      <Loading />
      <EditableGrid {...props} />
    </div>
  </Provider>;
