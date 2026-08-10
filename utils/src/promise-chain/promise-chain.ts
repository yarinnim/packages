/**
 * The promise chain is to pass the promise functions result
 * to next function. For example how to use this feature, please
 * refer to `promise-chain.test.ts`.
 */

type Action = CallableFunction
  | [CallableFunction, CallableFunction | any]
  | [CallableFunction, CallableFunction | any, CallableFunction | any];

const getAction = (props: Action): Action => {
  const [action, params, touchResult = false] = Array.isArray(props)
    ? props
    : [props, [], false];

  if (typeof params === 'function') return [action, params, touchResult] as Action;
  return [action, () => params, touchResult] as Action;
};

const executeChain = (
  action: any,
  paramCallback: any,
  preVal: any = undefined,
): Promise<any> => {
  const value = paramCallback(preVal);
  const values = Array.isArray(value) ? value : [value];
  const result = action(...values);
  if (result instanceof Promise) return result;
  return Promise.resolve(result);
};

export default function executeChains(
  actions: Action[],
  accu: any = undefined,
): Promise<any> {
  if (actions.length === 0) return Promise.resolve(accu);

  const [currentAction, ...rest] = actions;
  const [action, params, touchResult]: any = getAction(currentAction);
  return executeChain(action, params, accu)
    .then((result: any) => {
      if (!touchResult) return executeChains(rest, result);
      const touchedResult = touchResult(accu, result);
      return executeChains(rest, touchedResult);
    })
    .catch((error: any) => { throw error; });
}
