import { IComboBoxStyles, IStackStyles } from '@fluentui/react';

export const comboBoxStyles : Partial<IComboBoxStyles> = {
  root: {
    display: 'inline-block',
    maxWidth: '100px',
  },
  optionsContainer: { maxHeight: 260 },
  container: { flexShrink: '2 !important',
    marginLeft: '-1px',
    maxWidth: 100 },
};

export const stackComboBox : IStackStyles = {
  root: {
    flexFlow: 'row nowrap',
  },
};
