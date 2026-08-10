export default function execute(middlewares: any = []) {
  if (middlewares.length === 0) throw new Error('No handler defined');

  return (req: any, res: any) => {
    const handlers = Array.isArray(middlewares)? middlewares :[middlewares];
    const length = handlers.length;
    let index = -1;

    const next = () => {
      index++;
      if (index >= length) return true;
      const curHandler = handlers[index];
      return curHandler(req, res, next);
    };
    return next();
  };
}
