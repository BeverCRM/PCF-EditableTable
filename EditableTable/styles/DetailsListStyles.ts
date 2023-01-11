import { IDetailsColumnStyles } from
  '@fluentui/react/lib/components/DetailsList/DetailsColumn.types';
import { IStackStyles } from '@fluentui/react/lib/components/Stack/Stack.types';
import { FontWeights, getTheme, mergeStyleSets } from '@fluentui/react/lib/Styling';

const theme = getTheme();

export const stackStyles: Partial<IStackStyles> = { root: { height: 44, marginLeft: 100 } };

export const ditailsListStyles = mergeStyleSets({
  content: {
    width: '100%',
    display: 'inline-block',
    position: 'relative',
    height: '40px',
  },
  detailsList: {
    paddingTop: '0px',
  },
  detailsListContent: {
    width: 270,
    maxHeight: 325,
    fontWeight: FontWeights.regular,
    margin: '0 2px',
  },
  container: {
    display: 'flex',
    flexFlow: 'column nowrap',
    alignItems: 'stretch',
  },
  header: [
    theme.fonts.xxLarge,
    {
      flex: '1 1 auto',
      borderTop: `4px solid ${theme.palette.themePrimary}`,
      color: theme.palette.neutralPrimary,
      display: 'flex',
      alignItems: 'center',
      fontWeight: FontWeights.semilight,
      padding: '12px 12px 14px 24px',
      margin: '0 2px',
    },
  ],
  body: {
    flex: '4 4 auto',
    padding: '0 24px 24px 24px',
    overflowY: 'hidden',
    selectors: {
      p: { margin: '14px 0' },
      'p:first-child': { marginTop: 0 },
      'p:last-child': { marginBottom: 0 },
    },
  },
  title: {
    marginBottom: 12,
    fontWeight: FontWeights.semilight,
  },
  spinner: {
    height: 250,
  },
  callout: {
    width: 320,
    padding: '20px 24px',
  },
});

export const detailsHeaderStyles: Partial<IDetailsColumnStyles> = {
  cellName: {
    fontSize: '12px',
  },
};
