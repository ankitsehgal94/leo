import * as React from 'react';
import type { SvgProps } from 'react-native-svg';
import Svg, { Path } from 'react-native-svg';

type Props = SvgProps & {
  size?: number;
};

export function CloudSun({ color = '#64748B', size = 24, ...props }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        d="M12 2v2M12 2v2M4.93 4.93l1.41 1.41M17.66 4.93l-1.41 1.41M2 12h2M4.93 19.07l1.41-1.41"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M10.083 7.518a4 4 0 0 1 6.168 4.233"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <Path
        d="M17.5 19a4.5 4.5 0 1 0-.882-8.91 5.5 5.5 0 1 0-9.118 5.91A4.5 4.5 0 0 0 17.5 19Z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
