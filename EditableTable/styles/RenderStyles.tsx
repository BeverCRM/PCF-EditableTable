import * as React from 'react';
import {
  IDetailsListProps,
  CheckboxVisibility,
  DetailsHeader,
  DetailsRow,
} from '@fluentui/react';
import { detailsHeaderStyles, detailsRowStyles } from './DetailsListStyles';
import { openForm } from '../services/DataverseService';

export const _onRenderDetailsHeader: IDetailsListProps['onRenderDetailsHeader'] = props => {
  if (props) {
    props.checkboxVisibility = CheckboxVisibility.always;
    return <DetailsHeader {...props} styles={detailsHeaderStyles} />;
  }
  return null;
};

export const _onRenderRow: IDetailsListProps['onRenderRow'] = props => {
  if (props) {
    return <div onDoubleClick={() => openForm(props.item.key)}>
      <DetailsRow {...props} styles={detailsRowStyles} />
    </div>;
  }
  return null;
};
