import * as React from 'react';
import { Provider } from 'react-redux';
import store from '../Store/Store';
import { EditableGrid, IDataSetProps } from './EditableGrid';
import { Loading } from './Loading';

export const Wrapper = (props: IDataSetProps) => {

 return( 
  <Provider store={store}>
    <div className='appWrapper'>
      <Loading />
      <EditableGrid 
        dataset={props.dataset} 
        targetEntityType={props.targetEntityType} 
        width={props.width} 
        height={props.height}
      />
    </div>
  </Provider>)
}