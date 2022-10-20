import { Spinner, SpinnerSize, Stack } from '@fluentui/react';
import * as React from 'react';
import { modalStyles } from '../Styles/ModalStyles';

export interface ILoadingProps {
  isLoading: boolean;
}

export const Loading = ({ isLoading } : ILoadingProps) => {

  console.log(isLoading);
  return (
    <Stack style={{ display: isLoading ? 'flex' : 'none' }}>
      <Spinner className={modalStyles.spinner}
        size={SpinnerSize.large} />
    </Stack>
  );
};
