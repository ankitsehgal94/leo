import * as React from 'react';
import type { SvgProps } from 'react-native-svg';
import Svg, { Circle, Path } from 'react-native-svg';

type Props = SvgProps & {
  size?: number;
};

export function AlarmClock({ color = '#FF7B1A', size = 24, ...props }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      {/* Bell tops */}
      <Path
        d="M4 4L6.5 6.5M20 4L17.5 6.5"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
      {/* Clock body */}
      <Circle cx={12} cy={13} r={8} stroke={color} strokeWidth={2} />
      {/* Clock hands */}
      <Path
        d="M12 9v4l2 2"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
