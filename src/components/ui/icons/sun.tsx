import * as React from 'react';
import type { SvgProps } from 'react-native-svg';
import Svg, { Circle, Line } from 'react-native-svg';

type Props = SvgProps & {
  size?: number;
};

const RAYS = [
  { x1: 12, y1: 1, x2: 12, y2: 3 },
  { x1: 12, y1: 21, x2: 12, y2: 23 },
  { x1: 4.22, y1: 4.22, x2: 5.64, y2: 5.64 },
  { x1: 18.36, y1: 18.36, x2: 19.78, y2: 19.78 },
  { x1: 1, y1: 12, x2: 3, y2: 12 },
  { x1: 21, y1: 12, x2: 23, y2: 12 },
  { x1: 4.22, y1: 19.78, x2: 5.64, y2: 18.36 },
  { x1: 18.36, y1: 5.64, x2: 19.78, y2: 4.22 },
];

export function Sun({ color = '#F59E0B', size = 24, ...props }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      <Circle cx={12} cy={12} r={5} stroke={color} strokeWidth={2} />
      {RAYS.map((ray, i) => (
        <Line
          key={i}
          x1={ray.x1}
          y1={ray.y1}
          x2={ray.x2}
          y2={ray.y2}
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
        />
      ))}
    </Svg>
  );
}
