import { Spinner, SpinnerSize, Stack } from '@fluentui/react';
import * as React from 'react';
import { useAppSelector } from '../store/hooks';
import { loadingStyles } from '../styles/ComponentsStyles';

export const Loading = () => {
  const loading = useAppSelector(state => state.loading.isLoading);

  return (
    <Stack className='loading' style={{ display: loading ? 'flex' : 'none' }}>
      <Spinner className={loadingStyles.spinner}
        size={SpinnerSize.large} />
    </Stack>
  );
};
