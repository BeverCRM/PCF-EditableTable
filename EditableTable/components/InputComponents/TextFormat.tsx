import { Stack, TextField } from '@fluentui/react';
import React, { memo } from 'react';
import { textFieldStyles } from '../../styles/ComponentsStyles';

export interface ITextProps {
  value: string | undefined,
  isReadOnly?: boolean,
  isRequired: boolean,
  _onChange: Function;
  _onDoubleClick: Function;
}

export const TextFormat =
memo(({ value, isRequired, isReadOnly, _onChange, _onDoubleClick } : ITextProps) =>
  <Stack>
    <TextField defaultValue={value}
      styles={textFieldStyles(isRequired)}
      readOnly={isReadOnly}
      required={isRequired}
      onDoubleClick={() => _onDoubleClick()}
      onBlur={(event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const elem = event.target as HTMLInputElement;
        _onChange(elem.value);
      }} />
  </Stack>);
