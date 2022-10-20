import { IComboBoxStyles, IStackStyles } from '@fluentui/react';

export const comboBoxStyles : Partial<IComboBoxStyles> = {
  root: {
    display: 'inline-block',
    maxWidth: '100px',
  },
};

export const stackComboBox : IStackStyles = {
  root: {
    flexFlow: 'row nowrap',
  },
};
