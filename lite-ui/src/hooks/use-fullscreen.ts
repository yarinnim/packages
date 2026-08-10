import { useEffect, useState } from 'react';

const hasFullScreen = () => !!(document.fullscreenElement || false);

export default function useFullscreen() {
  const [isFullScreen, setFullScreen] = useState(hasFullScreen());

  const enterFullScreen = (element: any) => {
    setFullScreen(true);
    if (hasFullScreen()) return false;
    return (
      (element.requestFullScreen && element.requestFullScreen())
      || (element.mozRequestFullScreen && element.mozRequestFullScreen())
      || (element.webkitRequestFullScreen && element.webkitRequestFullScreen())
      || (element.msRequestFullScreen && element.msRequestFullScreen())
    );
  };

  const exitFullScreen = () => {
    setFullScreen(false);
    if (!hasFullScreen()) return false;
    return (document.exitFullscreen && document.exitFullscreen());
  };

  useEffect(() => { }, []);
  return { enterFullScreen, exitFullScreen, isFullScreen };
}
