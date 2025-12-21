import * as React from 'react';
import type { SvgProps } from 'react-native-svg';
import Svg, { Path } from 'react-native-svg';

type Props = SvgProps & {
  size?: number;
};

export const ArrowLeft = ({ color = '#CCC', size = 24, ...props }: Props) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
    <Path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" fill={color} />
  </Svg>
);
