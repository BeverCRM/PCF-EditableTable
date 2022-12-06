import { IDetailsListProps, IDetailsHeaderStyles, CheckboxVisibility,
  IDetailsRowStyles, DetailsHeader, DetailsRow } from '@fluentui/react';
import * as React from 'react';

//remove
export function showNoDataMessage() {
  const messageElement = document.querySelector<HTMLElement>('.ms-SelectionZone')!;
  if (messageElement) {
    messageElement.innerHTML = 'No data available';
    messageElement.style.margin = '50px';
    messageElement.style.fontSize = '14px';
    messageElement.style.textAlign = 'center';
  }
}

export const _onRenderDetailsHeader: IDetailsListProps['onRenderDetailsHeader'] = props => {
  const customStyles: Partial<IDetailsHeaderStyles> = {};

  if (props) {
    customStyles.root = {
      backgroundColor: 'white',
      fontSize: '12px',
      paddingTop: '0px',
      borderTop: '1px solid rgb(215, 215, 215)',
    };

    props.checkboxVisibility = CheckboxVisibility.always;
    return <DetailsHeader {...props} styles={customStyles} />;
  }
  return null;
};

export const _onRenderRow: IDetailsListProps['onRenderRow'] = props => {
  const customStyles: Partial<IDetailsRowStyles> = {};

  if (props) {
    customStyles.root = {
      height: '43px',
      backgroundColor: 'white',
      fontSize: '14px',
      color: 'black',
      borderTop: '1px solid rgb(250, 250, 250)',
      borderBottom: '1px solid rgb(219 219 219)'
    };

    return <DetailsRow {...props} styles={customStyles} />;
  }
  return null;
};
