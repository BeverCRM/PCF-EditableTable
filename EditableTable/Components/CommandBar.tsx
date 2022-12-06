import { CommandBarButton } from '@fluentui/react';
import * as React from 'react';
import { setLoading } from '../Store/Features/LoadingSlice';
import { saveRecords } from '../Store/Features/RecordSlice';
import { useAppDispatch } from '../Store/Hooks';
// import { saveRecords } from '../Store/Services';
import { CommandBarButtonStyles } from '../Styles/DataSetStyles';
import { addIcon, refreshIcon, deleteIcon, saveIcon } from '../Styles/DataSetStyles';

export interface ICommandBarProps {
  refreshGrid: any;
  selectedRecordIds: string[];
  entityName: string;
  newRow: any;
  deleteRecords: any
}
// const dispatch = useDispatch();

export const CommandBar = ({ refreshGrid,
  newRow, deleteRecords } : ICommandBarProps) => {
  const isLoading = false; // store.getState().isLoading.loading;
  const dispatch = useAppDispatch();
  
  return (<>
    <CommandBarButton
      maxLength={1}
      disabled = { isLoading }
      iconProps={addIcon}
      styles={CommandBarButtonStyles}
      text={`New`}
      onClick={() => { dispatch(setLoading(true)); newRow()}} // ;
    />
    <CommandBarButton
      disabled = { isLoading }
      iconProps={refreshIcon}
      styles={CommandBarButtonStyles}
      text='Refresh'
      onClick={() => { refreshGrid(); }}
    />
    <CommandBarButton
      disabled = { isLoading }
      iconProps={deleteIcon}
      styles={CommandBarButtonStyles}
      text='Delete'
      onClick={() => { deleteRecords(); }}
    />
    <CommandBarButton
      disabled = { isLoading }
      iconProps={saveIcon}
      styles={CommandBarButtonStyles}
      text='Save'
      onClick={() => { 
        dispatch(setLoading(true));
        dispatch(saveRecords()).unwrap()
        .then(() => {
          dispatch(setLoading(false));
        });
      }}
    />
  </>)
};
