export class Record {
  id: string;
  data: [
    {
      fieldName: string,
      newValue: any,
      fieldType: string
    }
  ]
}

export interface Data {
  [key: string] : any
}
