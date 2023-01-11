import { Spinner, SpinnerSize, Stack } from '@fluentui/react';
import * as React from 'react';
import { useAppSelector } from '../store/hooks';
import { detailsListStyles } from '../styles/DetailsListStyles';

export const Loading = () => {
  const loading = useAppSelector(state => state.loading.isLoading);

  return (
    <Stack className='loading' style={{ display: loading ? 'flex' : 'none' }}>
      <Spinner className={detailsListStyles.spinner}
        size={SpinnerSize.large} />
    </Stack>
  );
};
