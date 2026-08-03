// 全局文本组件：自动应用字体设置
import React from 'react';
import { Text } from 'react-native';
import { useFont } from '../context/FontContext';

export default function ThemedText({ style, children, ...props }) {
  const { currentFont } = useFont();
  const fontFamily = currentFont.id === 'default' ? undefined : currentFont.id;
  return <Text style={[{ fontFamily }, style]} {...props}>{children}</Text>;
}
