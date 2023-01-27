import {
  IBasePickerStyleProps,
  IBasePickerStyles,
  IComboBoxStyles,
  ISpinButtonStyles,
  IStackStyles,
  IStyleFunctionOrObject,
  mergeStyleSets,
} from '@fluentui/react';

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

export const dateFormatStyles = (dateOnly: boolean) => mergeStyleSets({
  root: { selectors: { '> *': { marginBottom: 15 } } },
  control: { maxWidth: dateOnly ? 200 : 150, marginBottom: 15 },
});

export const lookupFormatStyles:
  IStyleFunctionOrObject<IBasePickerStyleProps, IBasePickerStyles> = {
    text: { minWidth: 30, overflow: 'hidden' },
    root: { minWidth: 30, maxWidth: 300, overflow: 'hidden' },
    input: { maxWidth: 300, overflow: 'hidden' },
  };

export const numberFormatStyles: Partial<ISpinButtonStyles> = {
  arrowButtonsContainer: {
    display: 'none',
  },
  spinButtonWrapper: {
    maxWidth: '150px',
  },
};

export const wholeFormatStyles = {
  optionsContainer: {
    maxHeight: 260,
    maxWidth: 300,
  },
  container: {
    maxWidth: 200,
  },
};
