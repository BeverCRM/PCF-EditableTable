import {
  IBasePickerStyleProps,
  IBasePickerStyles,
  IButtonStyles,
  IComboBoxStyles,
  ISpinButtonStyles,
  IStackStyles,
  IStyleFunctionOrObject,
  mergeStyleSets,
} from '@fluentui/react';

export const comboBoxStyles : Partial<IComboBoxStyles> = {
  root: {
    display: 'inline-block',
    maxWidth: '150px',
  },
  optionsContainer: { maxHeight: 260 },
  container: { flexShrink: '2 !important',
    marginLeft: '-1px',
    maxWidth: 150 },
};

export const stackComboBox : IStackStyles = {
  root: {
    flexFlow: 'row nowrap',
    maxWidth: 1000,
  },
};

export const lookupFormatStyles:
  IStyleFunctionOrObject<IBasePickerStyleProps, IBasePickerStyles> = {
    text: { minWidth: 30, overflow: 'hidden' },
    root: { minWidth: 30, overflow: 'hidden' },
    input: { overflow: 'hidden' },
  };

export const lookupSelectedOptionStyles: IButtonStyles = {
  root: {
    textAlign: 'left',
    padding: 0,
    fontSize: '13px',
    maxHeight: 30,
    border: 'none',
  },
  splitButtonMenuButton: {
    borderTop: 'none',
    borderBottom: 'none',
  },
  label: {
    fontWeight: 400,
  },
};

export const numberFormatStyles: Partial<ISpinButtonStyles> = {
  arrowButtonsContainer: {
    display: 'none',
  },
};

export const wholeFormatStyles = {
  optionsContainer: {
    maxHeight: 260,
  },
};

export const loadingStyles = mergeStyleSets({
  spinner: {
    height: 250,
  },
});
