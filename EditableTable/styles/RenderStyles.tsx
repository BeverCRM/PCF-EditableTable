import * as React from 'react';
import {
  IDetailsListProps,
  CheckboxVisibility,
  DetailsHeader,
} from '@fluentui/react';
import { detailsHeaderStyles } from './DetailsListStyles';

export const _onRenderDetailsHeader: IDetailsListProps['onRenderDetailsHeader'] = props => {
  if (props) {
    props.checkboxVisibility = CheckboxVisibility.always;
    return <DetailsHeader {...props} styles={detailsHeaderStyles} />;
  }
  return null;
};
