import { useState, useEffect } from 'react';

type DominantColorResult = {
  dominantColor: Uint8ClampedArray;
  colorPalette: Uint8ClampedArray[];
};

export default function useDominantColor(src: string): [DominantColorResult | null, boolean] {
  const [color, setColor] = useState<DominantColorResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!src) {
      console.warn("Image source is empty");
      setColor(null);
      setLoading(false);
      return;
    }

    const getDominantColor = (src: string): Promise<DominantColorResult> => {
      return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d', { willReadFrequently: true });
        if (!context) {
          reject("Failed to get 2D context");
          return;
        }

        const img = new Image();
        img.crossOrigin = "anonymous"; // 跨域設置
        img.src = src;

        img.onload = () => {
          // 計算 1x1 的主色
          canvas.width = 1;
          canvas.height = 1;
          context.drawImage(img, 0, 0, 1, 1);
          const dominantColor = new Uint8ClampedArray(context.getImageData(0, 0, 1, 1).data.slice(0, 3));

          // 計算 3x3 調色板
          canvas.width = 3;
          canvas.height = 3;
          context.drawImage(img, 0, 0, 3, 3);
          const imageData = context.getImageData(0, 0, 3, 3).data;
          const colorPalette: Uint8ClampedArray[] = [];

          for (let i = 0; i < imageData.length; i += 4) {
            colorPalette.push(new Uint8ClampedArray(imageData.slice(i, i + 3)));
          }

          resolve({ dominantColor, colorPalette });
        };

        img.onerror = (err) => {
          reject("Failed to load image: " + err);
        };
      });
    };

    setLoading(true);
    getDominantColor(src)
      .then((color) => {
        setColor(color);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });

    // 清理資源
    return () => {
      setColor(null);
      setLoading(false);
    };
  }, [src]);

  return [color, loading];
}