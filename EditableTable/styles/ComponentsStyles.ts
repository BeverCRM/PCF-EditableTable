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
  root: {
    width: '-webkit-fill-available',
  },
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

export const lookupFormatStyles = (required: boolean, isDisabled: boolean):
IStyleFunctionOrObject<IBasePickerStyleProps, IBasePickerStyles> => ({
  text: {
    minWidth: 30,
    overflow: 'hidden',
    outline: 'none',
    border: !isDisabled ? '1px solid black !important' : '',
    '::after': {
      border: isDisabled ? 'none !important' : '1px solid black',
    },
  },
  root: {
    minWidth: 30,
    overflow: 'hidden',
    marginRight: required ? '10px' : '0px',
    backgroundColor: 'white',
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
    position: 'sticky',
    right: 0,
    background: 'white',
    zIndex: 3,
    cursor: 'pointer',
    '::before': {
      position: 'absolute',
      content: '',
      top: '10px',
      right: '20px',
      width: '1px',
      height: '5px',
      color: 'rgb(200, 198, 196)',
    },
  },
  splitButtonFlexContainer: {
    borderLeft: '1px solid rgb(200, 198, 196)',
    marginLeft: '-5px',
    marginRight: '-5px',
  },
  label: {
    fontWeight: 400,
  },
};

export const numberFormatStyles = (required: boolean): Partial<ISpinButtonStyles> => ({
  root: {
    minWidth: '40px',
  },
  arrowButtonsContainer: {
    display: 'none',
  },
  spinButtonWrapper: {
    marginRight: required ? '10px' : '0px',
    pointerEvents: 'all',
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

export const error = (isInvalid: boolean, required: boolean) => mergeStyles({
  display: isInvalid ? 'inline-block' : 'none',
  position: 'absolute',
  right: `${required ? '18px' : '8px'}`,
  top: '12px',
  fontSize: '16px',
  color: '#c0172b',
  cursor: 'pointer',
});
