import { useState, useEffect } from 'react';

const loadImage = (imageUrl: string): Promise<string> => {
  const image = new Image();
  return new Promise((resolve: any, reject: any) => {
    image.onload = () => resolve(imageUrl);
    image.onerror = () => reject(imageUrl);
    image.src = imageUrl;
  });
};

type ImageProps = {
  loading: boolean,
  isError: boolean,
  imageUrl: string,
};

export default function useImage(primeImageUrl: string, fallbackImageUrl: string) {
  const [state, setState]: any = useState<ImageProps>({
    imageUrl: fallbackImageUrl,
    isError: false,
    loading: true,
  });

  useEffect(() => {
    loadImage(primeImageUrl)
      .then((url: string) => {
        setState(() => ({
          isError: false,
          imageUrl: url,
          loading: false,
        }));
      })
      .catch(() => {
        setState(() => ({
          imageUrl: fallbackImageUrl,
          isError: true,
          loading: false,
        }));
      });

  }, [false]);

  const { imageUrl, ...restProps }: ImageProps = state;
  return [imageUrl, restProps];
}
