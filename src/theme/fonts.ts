/**
 * Font configuration — defines all available fonts and their metadata.
 * Font files located in assets/fonts/.
 */

import { FontConfig } from '../types';

export const FONT_LIST: FontConfig[] = [
  { id: 'default', name: '系统默认', file: null, preview: 'YuiTodo 任务清单', category: 'system' },
  { id: 'huakang', name: '华康少女', file: require('../../assets/fonts/华康少女文字W5.ttf'), preview: '今天也要加油呀', category: 'rounded' },
  { id: 'lianxing', name: '恋星圆体', file: require('../../assets/fonts/恋星圆体.ttf'), preview: '温柔待世界', category: 'rounded' },
  { id: 'mengshen', name: '萌神手写', file: require('../../assets/fonts/萌神手写体.ttf'), preview: '随手记录生活', category: 'handwriting' },
  { id: 'fukai', name: '福楷', file: require('../../assets/fonts/字体家AI造字福楷.ttf'), preview: '硬朗端正楷书', category: 'kai' },
  { id: 'togalit', name: '托加里特', file: require('../../assets/fonts/托加里特体-medium.otf'), preview: 'Elegant Style', category: 'serif' },
  { id: 'maple', name: 'Maple Mono', file: require('../../assets/fonts/MapleMono-Regular.ttf'), preview: 'code await fetch()', category: 'mono' },
  { id: 'zcool-kuaile', name: '站酷快乐体', file: require('../../assets/fonts/ZCOOLKuaiLe-Regular.ttf'), preview: '快乐每一天', category: 'rounded' },
  { id: 'zcool-xiaowei', name: '站酷小薇体', file: require('../../assets/fonts/ZCOOLXiaoWei-Regular.ttf'), preview: '优雅小薇风格', category: 'serif' },
  { id: 'zcool-huangyou', name: '庆科黄油体', file: require('../../assets/fonts/ZCOOLQingKeHuangYou-Regular.ttf'), preview: '圆润黄油质感', category: 'rounded' },
];

export const FONT_CATEGORIES = [
  { id: 'all', name: '全部' },
  { id: 'rounded', name: '圆润' },
  { id: 'handwriting', name: '手写' },
  { id: 'kai', name: '楷体' },
  { id: 'serif', name: '衬线' },
  { id: 'mono', name: '等宽' },
  { id: 'system', name: '系统' },
];

export function getFontConfig(fontId: string): FontConfig {
  return FONT_LIST.find((f) => f.id === fontId) || FONT_LIST[0];
}
