import { CommandBarButton } from '@fluentui/react';
import * as React from 'react';
import { useAppSelector } from '../../store/hooks';
import { CommandBarButtonStyles } from '../../styles/ButtonStyles';
import { addIcon, refreshIcon, deleteIcon, saveIcon } from '../../styles/ButtonStyles';
import { IIconProps } from '@fluentui/react/lib/components/Icon/Icon.types';

export interface ICommandBarProps {
  refreshButtonHandler: () => void;
  newButtonHandler: () => void;
  deleteButtonHandler: () => void;
  saveButtonHandler: () => void;
}

type ButtonProps = {
  order: number,
  text: string,
  icon: IIconProps,
  onClick: () => void
}

export const CommandBar = (props: ICommandBarProps) => {
  const isLoading = useAppSelector(state => state.loading.isLoading);

  const buttons: ButtonProps[] = [
    { order: 1, text: 'New', icon: addIcon, onClick: props.newButtonHandler },
    { order: 2, text: 'Refresh', icon: refreshIcon, onClick: props.refreshButtonHandler },
    { order: 3, text: 'Delete', icon: deleteIcon, onClick: props.deleteButtonHandler },
    { order: 4, text: 'Save', icon: saveIcon, onClick: props.saveButtonHandler },
  ];

  const listButtons = buttons.map(button =>
    <CommandBarButton
      key={button.order}
      disabled={isLoading}
      iconProps={button.icon}
      styles={CommandBarButtonStyles}
      text={button.text}
      onClick={button.onClick}
    />);

  return <>
    {listButtons}
  </>;
};
