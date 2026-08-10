import serialize, { isForm } from './serialize';
import { getDeviceId, getAccessToken, getUserLang } from './identity';
import downloadContent from './download';
import type { RequestProps, CustomProps, HeadersProps } from './type';

export const mode = {
  cors: 'cors',
  noCors: 'no-cors',
  sameOrigin: 'same-origin',
};

export const cache = {
  default: 'default',
  noCache: 'no-cache',
  reload: 'reload',
  forceCache: 'force-cache',
  onlyIfCache: 'only-if-cache',
};

export const credential = {
  sameOrigin: 'same-origin',
  include: 'include',
  omit: 'omit',
};

export const redirect = {
  follow: 'follow',
  manual: 'manual',
  error: 'error',
};

export const contentType = {
  JSON: 'application/json;charset=UTF-8',
  URL_ENCODED: 'application/x-www-form-urlencoded',
};

/**
 * Parses JSON response text and handles parsing errors
 * @param {string} text - The JSON string to parse
 * @param {Response} res - The original fetch Response object
 * @returns {any} Parsed JSON object or error object if parsing fails
 * @property {boolean} error - True if parsing failed
 * @property {number} code - HTTP status code from response
 * @property {string} message - Status text from response if parsing failed
 */
const parseJSON = (text: string, res: any): any => {
  try {
    return JSON.parse(text);
  } catch (error: any) {
    const { statusText, status } = res;
    const { message = false } = error;

    return {
      error: true,
      code: status,
      message: statusText || message,
    };
  }
};

// Validate the HTTP error (not 200) and convert
// the response body into text and pass to Error
// To get the catch, developer need to call the following
// method to get the JSON parse object.
// .catch((error) => JSON.parse(error.message))
const handleError = (res: any) => {
  if (res.status >= 300 || res.status < 200) {
    const cloned = res.clone();
    return res
      .text()
      .then((error: any) => {
        throw parseJSON(error, cloned);
      });
  }
  return res;
};

const strXParam = 'x-params-not-found';

/**
 * Cleans a URL string by removing optional parameters
 * @param {string} url - The URL string to clean
 * @returns {string} The cleaned URL with optional parameters removed
 */
const cleanUrl = (url: string): string => {
  const optionalReg = /:\w+\?/g;
  const cleanedUrl = url.replace(optionalReg, '');
  return cleanedUrl;
};

/**
 * Replaces URL parameters with their corresponding values
 * @param {string} url - The URL string to process
 * @param {Record<string, any>} params - The parameters to replace in the URL
 * @returns {string} The URL with parameters replaced
 */
export const getUrlWithParams = (url: string, params: Record<string, any> = {}): string => {
  const regex = /:\w+\??/g;
  const keys: string[] = url.match(regex) || [];
  const theUrl = keys.reduce((curUrl: string, key: string) => {
    const cleanedKey = key.replace(/[:?]/g, '');
    const value = params[cleanedKey] || strXParam;
    if (value === strXParam) return curUrl;
    return curUrl.replace(key, encodeURIComponent(value));
  }, url);
  return cleanUrl(theUrl);
};

/**
 * Constructs a URL with optional parameters and query string
 * @param {string} url - The base URL
 * @param {Object} props - The request properties
 * @returns {string} The complete URL with parameters and query string
 * 
 * @example
 * const url = getUrl('/users/:id', { params: { id: 123 } });
 * console.log(url); // Outputs: '/users/123'
 */
export const getUrl = (url: string, props: any) => {
  const { query = {}, params = {} } = props;
  const urlWithParams = getUrlWithParams(url, params);
  const queryData = serialize(query, 'get').toString();
  if (queryData.trim().length <= 0) return urlWithParams;
  const sign = urlWithParams.indexOf('?') >= 0 ? '&' : '?';
  return `${urlWithParams}${sign}${queryData}`;
};

/**
 * Retrieves the URL and data to be sent in an HTTP request
 * @param {string} url - The URL to send the request to
 * @param {Object} props - The request properties
 * @returns {Array} An array containing the URL and data to be sent
 * 
 * @example
 * const [url, data] = getData('/users/:id', { params: { id: 123 } });
 * console.log(url); // Outputs: '/users/123'
 * console.log(data); // Outputs: 'id=123'
 */
const getData = (url: string, props: any = {}) => {
  const { method = 'get', body = {} } = props;
  const httpMethod = method.toLowerCase();
  const data = serialize(body || false, httpMethod) || '';

  const theUrl = getUrl(url, props);
  switch (httpMethod) {
    case 'get':
    case 'head':
      return [theUrl, null];
    default:
      return [theUrl, data];
  }
};

/**
 * Injects authentication headers into the request
 * @param {Object} headers - The headers object to inject authentication into
 * @returns {Object} The updated headers object with authentication added
 */ 
const injectAuth = (headers: any) => {
  const accessToken = getAccessToken();
  if (accessToken === '') return headers;
  return { ...headers, Authorization: `Bearer: ${accessToken}` };
};

/**
 * Retrieves the headers for the request
 * @param {Object} props - The request properties
 * @returns {Object} The headers object for the request
 */
const getDefaultHeaders = (props: any) => {
  const headers = injectAuth({
    Accept: contentType.JSON,
    'device-id': getDeviceId(),
    Language: getUserLang(),

    'x-requested-with': 'XMLHttpRequest',
    'is-ajax': true,
  });

  const { body = false } = props;
  if (isForm(body)) return headers;

  return {
    'Content-Type': contentType.JSON,
    ...headers,
  };
};

/**
 * Handles the response from the server
 * @param {Response} res - The response from the server
 * @returns {Promise<any>} The response from the server
 */
const handleResponse = (props: CustomProps, res: any) => {
  const { responseAsRaw } = props;
  if (responseAsRaw) return res;

  const { download } = props;
  if (download) return downloadContent(res, download);

  const resContentType = res.headers.get('content-type');
  const isJson = resContentType.indexOf('application/json') !== -1;
  if (isJson) return res.json();
  return res.text();
};

/**
 * Checks if the body is empty and returns the props if it is
 * @param {Object} props - The request properties
 * @param {any} body - The body of the request
 * @returns {Object} The request properties with the body if it is not empty
 */
const bodyCheck = (props: any, body: any) => {
  const isEmpty = body === '{}' || body === '';
  if (isEmpty) return props;
  return { ...props, body };
};

/**
 * Makes an HTTP request to the specified URL with optional configuration
 * @param {string} url - The URL to send the request to
 * @param {object} pProps - Optional request configuration object
 * @returns {Promise<any>} The parsed response from the server
 * 
 * @example
 * // Basic GET request
 * ajax('/api/users')
 *   .then(data => {
 *     console.log(data);
 *   });
 * 
 * // POST request with JSON body
 * ajax('/api/users', {
 *   method: 'post',
 *   body: JSON.stringify({ name: 'John', email: 'john@example.com' }),
 *   headers: {
 *     'Content-Type': 'application/json'
 *   }
 * }).then(response => {
 *   console.log(response); 
 * });
 * 
 * // Form data submission
 * const formData = new FormData();
 * formData.append('file', fileInput.files[0]);
 * ajax('/api/upload', {
 *   method: 'post',
 *   body: formData
 * }).then(result => {
 *   console.log(result);
 * });
 */

type InitProps = RequestProps & CustomProps;

const getProps = (props: InitProps = {}): [RequestProps, CustomProps] => {
  const { responseAsRaw = false, download = false, ...rest } = props;
  return [rest, { responseAsRaw, download }];
};

const getHeaders = (defaultHeaders: HeadersProps, userHeaders: any) => {
  if (typeof userHeaders === 'function') {
    return userHeaders(defaultHeaders) || defaultHeaders;
  }
  return { ...defaultHeaders, ...userHeaders };
};

export default function ajax(url: string, pProps: InitProps = {}): Promise<any> {
  const [props, customProps] = getProps(pProps);
  const { headers: userHeaders = {} } = props;
  const [toUrl, body] = getData(url, props);
  const headers = getHeaders(getDefaultHeaders(props), userHeaders);

  const reqProps = {
    method: 'get',
    cache: cache.default,
    redirect: redirect.follow,
    credentials: credential.sameOrigin,
    ...props,
    headers,
  };

  const nextProps = bodyCheck(reqProps, body);

  return fetch(toUrl, nextProps)
    .then(handleError)
    .then(handleResponse.bind(null, customProps));
}
