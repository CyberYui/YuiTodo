/**
 * Global text component — applies font settings automatically.
 */

import React from 'react';
import { Text, TextProps } from 'react-native';
import { useFont } from '../context/FontContext';

export default function ThemedText({ style, children, ...props }: TextProps) {
  const { currentFont } = useFont();
  const fontFamily = currentFont.id === 'default' ? undefined : currentFont.id;
  return <Text style={[{ fontFamily }, style]} {...props}>{children}</Text>;
}
