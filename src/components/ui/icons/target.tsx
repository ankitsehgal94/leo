import * as React from 'react';
import type { SvgProps } from 'react-native-svg';
import Svg, { Circle } from 'react-native-svg';

type Props = SvgProps & {
  size?: number;
};

export function Target({ color = '#E5E5E5', size = 24, ...props }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      <Circle cx={12} cy={12} r={10} stroke={color} strokeWidth={2} />
      <Circle cx={12} cy={12} r={6} stroke={color} strokeWidth={2} />
      <Circle cx={12} cy={12} r={2} stroke={color} strokeWidth={2} />
    </Svg>
  );
}
