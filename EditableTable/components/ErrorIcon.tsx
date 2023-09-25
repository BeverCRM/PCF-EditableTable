/* eslint-disable react/display-name */
import { FontIcon, ITooltipProps, TooltipHost } from '@fluentui/react';
import React, { memo } from 'react';
import { error } from '../styles/ComponentsStyles';
import { useAppSelector } from '../store/hooks';

export interface IErrorProps {
  id: string;
  isRequired: boolean;
}

export const ErrorIcon = memo(({ id, isRequired } : IErrorProps) => {
  const invalidFields = useAppSelector(state => state.error.invalidFields);
  const invalidField = invalidFields.find(field => field.fieldId === id);

  const tooltipProps: ITooltipProps = {
    onRenderContent: () =>
      <span style={{ margin: 10, padding: 0, color: '#c0172b' }}>
        {invalidField?.errorMessage}
      </span>,
  };

  return (
    <TooltipHost
      content={invalidField?.errorMessage}
      calloutProps={{ target: `#${id}` }}
      tooltipProps={tooltipProps}
    >
      <FontIcon
        iconName={'StatusErrorFull'} id={id}
        className={error(invalidField?.isInvalid || false, isRequired)}
      />
    </TooltipHost>
  );
});
