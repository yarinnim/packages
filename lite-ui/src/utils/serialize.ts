// const serializeObj = (obj: any) => JSON.stringify(obj);
const serializeObj = (obj: any, method: string) => {
  if (method.toLowerCase() !== 'get') return JSON.stringify(obj);

  const items = Object.keys(obj).reduce((carry: any, key: any) => {
    carry.push(`${key}=${encodeURIComponent(obj[key])}`);
    return carry;
  }, []);
  return items.join('&');
};

const getNodeValue = (element: any) => {
  const nodeName = element.nodeName.toLowerCase();

  switch (nodeName) {
    case 'input':
      const nodeType = element.type.toLowerCase();
      if (nodeType === 'checkbox') {
        const isChecked = element.checked;
        return isChecked ? element.value : '';
      }
      return element.value;
    default:
      return element.value;
  }
};

const serializeForm = (form: any) => {
  const elements = [...form.elements];
  return elements.reduce((data, element) => {
    if (element.name || false) {
      const { name } = element;
      const value = getNodeValue(element);
      if (value.toString().length > 0) {
        data.append(name, value);
      }
    }
    return data;
  }, new URLSearchParams());
};

export const isForm = (body: any) => {
  if (!(body || false)) return false;
  return (body.nodeName || false)
    ? (body.nodeName.toLowerCase() === 'form')
    : false;
};

const isFormData = (body: any) => (body.toString() === '[object FormData]');

export default function serialize(body: any, method: string) {
  if (!body) return null;
  if (isFormData(body)) return body;
  return isForm(body)
    ? serializeForm(body)
    : serializeObj(body, method);
}
