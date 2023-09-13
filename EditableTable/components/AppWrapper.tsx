import { ScrollablePane, Stack } from '@fluentui/react';
import React, { useState } from 'react';
import { Provider } from 'react-redux';
import { IDataverseService } from '../services/DataverseService';
import { containerStackStyles } from '../styles/DetailsListStyles';
import { Store } from '../utils/types';
import { EditableGrid } from './EditableGrid/EditableGrid';
import { Loading } from './Loading';

type DataSet = ComponentFramework.PropertyTypes.DataSet;

export interface IDataSetProps {
  dataset: DataSet;
  isControlDisabled: boolean;
  width: number;
  _store: Store;
  _service: IDataverseService;
  // _setContainerHeight?:
}

export const Wrapper = (props: IDataSetProps) => {
  const [containerHeight, setContainerHeight] = useState(props.dataset.sortedRecordIds.length);
  console.log(containerHeight);

  return <Provider store={props._store} >
    <div className='appWrapper' tabIndex={0}>
      <Loading />
      <Stack style={containerStackStyles(props.width, props.dataset.sortedRecordIds.length)} >
        <ScrollablePane>
          <EditableGrid {...props} />
        </ScrollablePane>
      </Stack>
    </div>
  </Provider>;
};
