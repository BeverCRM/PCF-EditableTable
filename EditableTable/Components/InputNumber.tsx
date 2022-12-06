import { ISpinButtonStyles, SpinButton, Stack } from '@fluentui/react';
import * as React from 'react';
import { shallowEqual } from 'react-redux';
import { Number } from '../Store/Features/NumberSlice';
import { useAppSelector } from '../Store/Hooks';

export interface IInputNumberProps {
  fieldName: string | undefined;
  defaultValue: string;
  type: string;
  onNumberChange: any
}

export const InputNumber = ({ fieldName,
  defaultValue,onNumberChange } : IInputNumberProps) => {
  const styles: Partial<ISpinButtonStyles> = { arrowButtonsContainer: { display: 'none' }, spinButtonWrapper: { maxWidth: '150px' } };
  const [val, setVal] = React.useState<string>(defaultValue);
  const [currentNumber, setCurrentNumber] = React.useState<Number>();

  const numbers: Number[] = useAppSelector(state => state.number.numbers, shallowEqual);
  React.useEffect(() => {
    const number = numbers.find(num => num.fieldName === fieldName);
    console.log(number);
    setCurrentNumber(number);
  }, [numbers]);

  const _onChange = (event: React.SyntheticEvent<HTMLElement>, newValue?: string) => {
    console.log(newValue);
    if (newValue !== undefined && newValue !== null) {
      setVal(parseFloat(newValue).toFixed(currentNumber?.precision));
      onNumberChange(parseFloat(parseFloat(newValue).toFixed(currentNumber?.precision)));
    }
  };

  return (
    <Stack>
      <SpinButton
        defaultValue={defaultValue}
        min={currentNumber?.minValue}
        max={currentNumber?.maxValue}
        precision={currentNumber?.precision}
        styles={styles}
        onChange={_onChange}
        value={val}
      />
    </Stack>
  );
};
