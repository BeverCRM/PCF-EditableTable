import { Stack, TextField } from '@fluentui/react';
import React, { memo } from 'react';
import { textFieldStyles } from '../../styles/ComponentsStyles';

export interface ITextProps {
  value: string | undefined,
  ownerValue: string | undefined,
  isDisabled?: boolean,
  isRequired: boolean,
  _onChange: Function;
  _onDoubleClick: Function;
}

export const TextFormat = memo(({ value, ownerValue,
  isRequired, isDisabled, _onChange, _onDoubleClick } : ITextProps) => {
  if (ownerValue !== undefined) {
    value = ownerValue;
  }
  return (
    <Stack>
      <TextField
        defaultValue={value}
        key={value}
        styles={textFieldStyles(isRequired)}
        disabled={isDisabled}
        required={isRequired}
        onDoubleClick={() => _onDoubleClick()}
        onBlur={(event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>) => {
          const elem = event.target as HTMLInputElement;
          _onChange(elem.value);
        }} />
    </Stack>
  );
});
