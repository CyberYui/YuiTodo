/**
 * Typography styles — unified font size and weight management.
 */

import { TextStyle } from 'react-native';

export const Typography: Record<string, TextStyle> = {
  title: { fontSize: 24, fontWeight: '700' },
  subtitle: { fontSize: 18, fontWeight: '600' },
  body: { fontSize: 16, fontWeight: '400' },
  caption: { fontSize: 13, fontWeight: '400' },
  tiny: { fontSize: 11, fontWeight: '500' },
};
