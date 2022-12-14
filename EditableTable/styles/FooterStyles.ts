import { IButtonStyles } from '@fluentui/react/lib/components/Button/Button.types';
import { IIconProps } from '@fluentui/react/lib/components/Icon/Icon.types';
import { mergeStyleSets } from '@fluentui/react/lib/Styling';

export const PreviousIcon: IIconProps = { iconName: 'Previous' };
export const BackIcon: IIconProps = { iconName: 'Back' };
export const ForwardIcon: IIconProps = { iconName: 'Forward' };

export const footerStyles = mergeStyleSets({
  content: {
    flex: '1 1 auto',
    display: 'flex',
    flexDirection: 'row',
    placeContent: 'stretch space-between',
    height: '40px',
    color: '#333',
    fontSize: '12px',
    alignItems: 'center',
    paddingLeft: '20px',
    paddingRight: '20px',

  },
});

export const footerButtonStyles: Partial<IButtonStyles> = {
  root: {
    backgroundColor: 'transparent',
    cursor: 'pointer',
    height: '0px',
    color: 'green',
  },
  icon: {
    fontSize: '12px',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    height: '0px',
    color: 'rgb(0 120 212)',
  },
};
