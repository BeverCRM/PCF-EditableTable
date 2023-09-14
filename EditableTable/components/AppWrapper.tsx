import { ScrollablePane, Stack } from '@fluentui/react';
import React, { useCallback, useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { IDataverseService } from '../services/DataverseService';
import { Store } from '../utils/types';
import { EditableGrid } from './EditableGrid/EditableGrid';
import { Loading } from './Loading';
import { getContainerHeight } from '../utils/commonUtils';

type DataSet = ComponentFramework.PropertyTypes.DataSet;

export interface IDataSetProps {
  dataset: DataSet;
  isControlDisabled: boolean;
  width: number;
  _store: Store;
  _service: IDataverseService;
  _setContainerHeight: Function;
}

export const Wrapper = (props: IDataSetProps) => {
  const [containerHeight, setContainerHeight] =
    useState(getContainerHeight(props.dataset.sortedRecordIds.length));

  const _setContainerHeight = useCallback((height: number) => {
    setContainerHeight(height);
  }, []);

  return <Provider store={props._store} >
    <div className='appWrapper' tabIndex={0}>
      <Loading />
      <Stack style={{ width: props.width, height: containerHeight }} >
        <ScrollablePane>
          <EditableGrid {...{ ...props, _setContainerHeight }} />
        </ScrollablePane>
      </Stack>
    </div>
  </Provider>;
};
