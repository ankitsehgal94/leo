import * as React from 'react';
import type { SvgProps } from 'react-native-svg';
import Svg, { Rect } from 'react-native-svg';

type Props = SvgProps & {
  size?: number;
};

export function BarChart({ color = '#818CF8', size = 24, ...props }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      <Rect x={6} y={10} width={4} height={10} rx={1} fill={color} />
      <Rect x={14} y={4} width={4} height={16} rx={1} fill={color} />
    </Svg>
  );
}
