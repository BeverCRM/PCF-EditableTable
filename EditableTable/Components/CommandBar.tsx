import { CommandBarButton } from '@fluentui/react';
import * as React from 'react';
import DataverseService from '../Services/DataverseService';
import { CommandBarButtonStyles } from '../Styles/DataSetStyles';
import { addIcon, refreshIcon, deleteIcon, saveIcon } from '../Styles/DataSetStyles';
import { Record } from '../Models/Record';

export interface ICommandBarProps {
  isDisabled: boolean;
  refreshGrid: any;
  selectedRecordIds: string[];
  changedRecordIds: Record[];
  entityName: string;
  newRow: any;
  setLoading: any;
}

export const CommandBar = ({ isDisabled, refreshGrid,
  selectedRecordIds, changedRecordIds, newRow, setLoading } : ICommandBarProps) => <>
  <CommandBarButton
    maxLength={1}
    disabled = { isDisabled }
    iconProps={addIcon}
    styles={CommandBarButtonStyles}
    text={`New`}
    onClick={() => {setLoading(); newRow()}}
  />
  <CommandBarButton
    disabled = { isDisabled }
    iconProps={refreshIcon}
    styles={CommandBarButtonStyles}
    text="Refresh"
    onClick={() => {setLoading(); refreshGrid() }}
  />
  <CommandBarButton
    disabled = { isDisabled }
    iconProps={deleteIcon}
    styles={CommandBarButtonStyles}
    text="Delete"
    onClick={() => { DataverseService.openRecordDeleteDialog(selectedRecordIds); }}
  />
  <CommandBarButton
    disabled = { isDisabled }
    iconProps={saveIcon}
    styles={CommandBarButtonStyles}
    text="Save"
    onClick={() => { setLoading(); DataverseService.saveRecords(changedRecordIds); }}
  />
</>;
