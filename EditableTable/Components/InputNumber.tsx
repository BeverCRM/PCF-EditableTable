import { ISpinButtonStyles, SpinButton, Stack } from '@fluentui/react';
import { _context } from '../Services/DataverseService';
import * as React from 'react';

export interface IInputNumberProps {
  entityName: string;
  fieldName: string | undefined;
  defaultValue: string;
  type: string;
  onNumberChange: any
}

export const InputNumber = ({ entityName, fieldName,
  defaultValue, type, onNumberChange } : IInputNumberProps) => {
  const styles: Partial<ISpinButtonStyles> = { arrowButtonsContainer: { display: 'none' } };
  const [number, setNumber] =
  React.useState<{precision: number, minValue: number, maxValue: number }>();
  const [val, setVal] = React.useState<string>(defaultValue);

  React.useEffect(() => {
    // @ts-ignore
    const clientUrl = `${_context.page.getClientUrl()}/api/data/v9.2/`;
    let attributeType, selection : string;
    switch (type) {
      case 'currency':
        attributeType = 'MoneyAttributeMetadata';
        selection = 'PrecisionSource,MaxValue,MinValue';
        break;

      case 'decimal':
        attributeType = 'DecimalAttributeMetadata';
        selection = 'Precision,MaxValue,MinValue';
        break;

      case 'float':
        attributeType = 'DoubleAttributeMetadata';
        selection = 'Precision,MaxValue,MinValue';
        break;

      default:
        attributeType = 'IntegerAttributeMetadata';
        selection = 'MaxValue,MinValue';
    }

    // eslint-disable-next-line max-len
    const request = `${clientUrl}EntityDefinitions(LogicalName='${entityName}')/Attributes/Microsoft.Dynamics.CRM.${attributeType}?$select=${selection}&$filter=LogicalName eq '${fieldName}'`;
    const req = new XMLHttpRequest();
    req.open('GET', request, true);
    req.setRequestHeader('OData-MaxVersion', '4.0');
    req.setRequestHeader('OData-Version', '4.0');
    req.setRequestHeader('Accept', 'application/json');
    req.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
    req.setRequestHeader('Prefer', 'odata.include-annotations="*"');
    req.onreadystatechange = function() {
      if (this.readyState === 4) {
        req.onreadystatechange = null;
        if (this.status === 200) {
          const results = JSON.parse(this.response);
          const precision = results.value[0]?.PrecisionSource
            ? results.value[0]?.PrecisionSource : results.value[0]?.Precision;
          const minValue = results.value[0].MinValue;
          const maxValue = results.value[0].MaxValue;
          setNumber({ precision, minValue, maxValue });
        }
        else {
          console.log(this.statusText);
        }
      }
    };
    req.send();
  }, [entityName]);

  const _onChange = (event: React.SyntheticEvent<HTMLElement>, newValue?: string) => {
    if (newValue !== undefined && newValue !== null) {
      setVal(parseFloat(newValue).toFixed(number?.precision));
      onNumberChange(parseFloat(parseFloat(newValue).toFixed(number?.precision)));
    }
  };

  return (
    <Stack>
      <SpinButton
        defaultValue={defaultValue}
        min={number?.minValue}
        max={number?.maxValue}
        precision={number?.precision}
        styles={styles}
        onChange={_onChange}
        value={val}
      />
    </Stack>
  );
};
