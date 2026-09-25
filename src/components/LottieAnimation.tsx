import React from 'react';
import LottieImport from 'lottie-react';
import type { LottieRefCurrentProps } from 'lottie-react';

// lottie-react ships CJS: under SSR/ESM interop the default import can be
// the module namespace object instead of the component.
const Lottie: any =
  (LottieImport as any)?.default ?? (LottieImport as any);

interface LottieAnimationProps {
  animationData: any;
  loop?: boolean;
  autoplay?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onComplete?: () => void;
}

export const LottieAnimation: React.FC<LottieAnimationProps> = ({
  animationData,
  loop = true,
  autoplay = true,
  className = '',
  style,
  onComplete,
}) => {
  const lottieRef = React.useRef<LottieRefCurrentProps>(null);

  return (
    <Lottie
      lottieRef={lottieRef}
      animationData={animationData}
      loop={loop}
      autoplay={autoplay}
      className={className}
      style={style}
      onComplete={onComplete}
    />
  );
};

export default LottieAnimation;
