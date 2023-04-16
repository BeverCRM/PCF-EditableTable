import { CommandBarButton, IButtonStyles } from '@fluentui/react';
import * as React from 'react';
import { useAppSelector } from '../../store/hooks';
import { commandBarButtonStyles } from '../../styles/ButtonStyles';
import { addIcon, refreshIcon, deleteIcon, saveIcon } from '../../styles/ButtonStyles';
import { IIconProps } from '@fluentui/react/lib/components/Icon/Icon.types';
import { EntityPrivileges } from '../../services/DataverseService';

export interface ICommandBarProps {
  refreshButtonHandler: () => void;
  newButtonHandler: () => void;
  deleteButtonHandler: () => void;
  saveButtonHandler: () => void;
  isControlDisabled: boolean;
  selectedCount: number;
  entityPrivileges: EntityPrivileges;
}

type ButtonProps = {
  order: number,
  text: string,
  icon: IIconProps,
  disabled: boolean,
  onClick: () => void,
  styles?: IButtonStyles,
}

export const CommandBar = (props: ICommandBarProps) => {
  const isLoading = useAppSelector(state => state.loading.isLoading);
  const isPendingSave = useAppSelector(state => state.record.isPendingSave);

  const buttons: ButtonProps[] = [
    {
      order: 1,
      text: 'New',
      icon: addIcon,
      disabled: isLoading || props.isControlDisabled || !props.entityPrivileges.create,
      onClick: props.newButtonHandler,
    },
    {
      order: 2,
      text: 'Refresh',
      icon: refreshIcon,
      disabled: isLoading,
      onClick: props.refreshButtonHandler,
    },
    {
      order: 3,
      text: 'Delete',
      icon: deleteIcon,
      disabled: isLoading || props.isControlDisabled || !props.entityPrivileges.delete,
      onClick: props.deleteButtonHandler,
      styles: {
        root: { display: props.selectedCount > 0 ? 'flex' : 'none' },
        icon: { color: 'black' },
      },
    },
    {
      order: 4,
      text: 'Save',
      icon: saveIcon,
      disabled: isLoading || props.isControlDisabled || !props.entityPrivileges.write,
      onClick: props.saveButtonHandler,
      styles: {
        icon: { color: isPendingSave ? 'blue' : 'black' },
        textContainer: { color: isPendingSave ? 'blue' : 'black' },
      },
    },
  ];

  const listButtons = buttons.map(button =>
    <CommandBarButton
      key={button.order}
      disabled={button.disabled}
      iconProps={button.icon}
      styles={button.styles ?? commandBarButtonStyles}
      text={button.text}
      onClick={button.onClick}
    />);

  return <>
    {listButtons}
  </>;
};
