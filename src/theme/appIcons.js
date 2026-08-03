// App图标配置
import { Asset } from 'expo-asset';

const ICON_FILES = {
  icon1: require('../../assets/icon.png'),
  icon2: require('../../assets/XXI_0_newHead_1024.png'),
  icon3: require('../../assets/伊什梅尔_newHead_1024.png'),
  icon4: require('../../assets/曲_2_headCode_1024.png'),
  icon5: require('../../assets/檀心_newHead_1024.png'),
  icon6: require('../../assets/洁塔薇_0_newHead_1024.png'),
  icon7: require('../../assets/灼惘_newHead_1024.png'),
  icon8: require('../../assets/芒星之迹_0_newHead_1024.png'),
  icon9: require('../../assets/avatar_20251020_0a453e6e2cb44914b06c9f38243a0c6820251020.png'),
  icon10: require('../../assets/avatar_20251117_a69220dd3efd4d3e8312719b6696fa2c20251117.png'),
  icon11: require('../../assets/avatar_20260202_bc77d9ff74144b16ae1e8ec8ec859c5920260202.png'),
};

export const APP_ICONS = [
  { id: 'icon1', name: '默认', file: ICON_FILES.icon1 },
  { id: 'icon2', name: 'XXI', file: ICON_FILES.icon2 },
  { id: 'icon3', name: '伊什梅尔', file: ICON_FILES.icon3 },
  { id: 'icon4', name: '曲', file: ICON_FILES.icon4 },
  { id: 'icon5', name: '檀心', file: ICON_FILES.icon5 },
  { id: 'icon6', name: '洁塔薇', file: ICON_FILES.icon6 },
  { id: 'icon7', name: '灼惘', file: ICON_FILES.icon7 },
  { id: 'icon8', name: '芒星之迹', file: ICON_FILES.icon8 },
  { id: 'icon9', name: '头像1', file: ICON_FILES.icon9 },
  { id: 'icon10', name: '头像2', file: ICON_FILES.icon10 },
  { id: 'icon11', name: '头像3', file: ICON_FILES.icon11 },
];

export function getAppIcon(id) {
  return APP_ICONS.find((i) => i.id === id) || APP_ICONS[0];
}
