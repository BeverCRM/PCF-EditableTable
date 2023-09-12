/* eslint-disable react/display-name */
import { FontIcon, ITooltipProps, TooltipHost } from '@fluentui/react';
import React, { memo } from 'react';
import { error } from '../styles/ComponentsStyles';

export interface IErrorProps {
  id: string;
  errorText: string;
  isInvalid: boolean,
  isRequired: boolean;
}

export const ErrorIcon = memo(({ id, errorText, isInvalid, isRequired } : IErrorProps) => {
  const tooltipProps: ITooltipProps = {
    onRenderContent: () =>
      <span style={{ margin: 10, padding: 0, color: '#c0172b' }}>
        {errorText}
      </span>,
  };

  return (
    <TooltipHost
      content={errorText}
      calloutProps={{ target: `#${id}` }}
      tooltipProps={tooltipProps}
    >
      <FontIcon
        iconName={'StatusErrorFull'} id={id}
        className={error(isInvalid, isRequired)}
      />
    </TooltipHost>
  );
});
