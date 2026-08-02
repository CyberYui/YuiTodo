// 全局文本组件：自动应用字体设置
import React from 'react';
import { Text } from 'react-native';
import { useFont, FontStyleMap } from '../context/FontContext';
import { FontStyle } from '../context/FontContext';

export default function ThemedText({ style, children, ...props }) {
  const { fontFamily, fontStyle } = useFont();
  const extraStyle = FontStyleMap[fontStyle] || FontStyleMap[FontStyle.DEFAULT];
  return <Text style={[{ fontFamily, fontStyle: extraStyle.fontStyle, fontWeight: extraStyle.fontWeight }, style]} {...props}>{children}</Text>;
}
