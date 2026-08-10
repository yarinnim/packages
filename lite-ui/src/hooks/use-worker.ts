import { useState, useEffect } from 'react';

export default function useWorker(workerPath: string) {
  const [worker, setWorker]: any = useState();

  useEffect(() => {
    const workerInstance = new Worker(new URL(workerPath, import.meta.url));
    setWorker(() => workerInstance);
    return () => workerInstance.terminate();
  }, []);

  return worker;
}
