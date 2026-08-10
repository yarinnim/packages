const getHeaders = (data: any[], delimiter: string = ',') => {
  const [first] = data;
  return Object.keys(first).join(delimiter);
};

const writeLine = (writer: any, str: string) => {
  writer.write(`${str}\n`);
};

const touchRow = (row: any) => {
  const values = Object.values(row);
  return values.map((value: any) => {
    if (typeof value === 'string') return JSON.stringify(value);
    if (value?.constructor === Object) {
      return JSON
        .stringify(value)
        .replace(/(?:\r\n|\r|\n)/g, '/\n');
    }
    return value;
  });
};

export default function writeCotnent(writer: any, data: any[], props: any = {}) {
  const { delimiter } = props;
  const headers = getHeaders(data, delimiter);
  writeLine(writer, headers);
  data.forEach((row: any) => {
    const strRow = touchRow(row).join(delimiter);
    writeLine(writer, strRow);
  });
}
