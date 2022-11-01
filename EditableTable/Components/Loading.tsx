import { Spinner, SpinnerSize, Stack } from '@fluentui/react';
import * as React from 'react';
import { modalStyles } from '../Styles/ModalStyles';

export const Loading = () => {
  return (
    <Stack style={{ display: 'flex'}}>
      <Spinner className={modalStyles.spinner}
        size={SpinnerSize.large} />
    </Stack>
  );
};
