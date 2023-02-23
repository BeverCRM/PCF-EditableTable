import {
  IBasePickerStyleProps,
  IBasePickerStyles,
  IButtonStyles,
  IComboBoxStyles,
  IDatePickerStyles,
  ISpinButtonStyles,
  IStackStyles,
  IStyleFunctionOrObject,
  ITextFieldStyles,
  mergeStyles,
  mergeStyleSets,
} from '@fluentui/react';

export const textFieldStyles = (required: boolean): Partial<ITextFieldStyles> => ({
  root: {
    marginRight: required ? '10px' : '0px',
  },
});

export const datePickerStyles = (required: boolean): Partial<IDatePickerStyles> => ({
  wrapper: {
    marginRight: required ? '10px' : '0px',
  },
});

export const timePickerStyles = (required: boolean): Partial<IComboBoxStyles> => ({
  root: {
    display: 'inline-block',
    maxWidth: '150px',
  },
  optionsContainer: { maxHeight: 260 },
  container: {
    flexShrink: '2 !important',
    marginLeft: '-1px',
    maxWidth: 150,
    marginRight: required ? '10px' : '0px',
  },
});

export const optionSetStyles = (required: boolean): Partial<IComboBoxStyles> => ({
  container: {
    marginRight: required ? '10px' : '0px',
  },
});

export const stackComboBox : IStackStyles = {
  root: {
    flexFlow: 'row nowrap',
    maxWidth: 1000,
  },
};

export const lookupFormatStyles = (required: boolean):
IStyleFunctionOrObject<IBasePickerStyleProps, IBasePickerStyles> => ({
  text: { minWidth: 30, overflow: 'hidden' },
  root: {
    minWidth: 30,
    overflow: 'hidden',
    marginRight: required ? '10px' : '0px',
  },
  input: { overflow: 'hidden' },
});

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

export const numberFormatStyles = (required: boolean): Partial<ISpinButtonStyles> => ({
  arrowButtonsContainer: {
    display: 'none',
  },
  spinButtonWrapper: {
    marginRight: required ? '10px' : '0px',
  },
});

export const wholeFormatStyles = (required: boolean): Partial<IComboBoxStyles> => ({
  optionsContainer: {
    maxHeight: 260,
  },
  container: {
    marginRight: required ? '10px' : '0px',
  },
});

export const loadingStyles = mergeStyleSets({
  spinner: {
    height: 250,
  },
});

export const asteriskClassStyle = (required: boolean) => mergeStyles({
  color: '#a4262c',
  position: 'absolute',
  top: '5px',
  right: '1px',
  fontSize: '5.5px',
  display: required ? 'flex' : 'none',
});
