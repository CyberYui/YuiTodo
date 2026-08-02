// 主题颜色定义：浅色模式与深色模式两套配色
// 深色模式采用低亮度柔和配色，避免高对比刺眼

export const LightTheme = {
  // 背景色
  background: '#F8F9FA',          // 页面主背景（浅灰白）
  cardBackground: '#FFFFFF',      // 卡片背景（纯白）
  separator: '#E5E7EB',           // 分割线

  // 文字色
  textPrimary: '#1F2937',         // 主文字（深灰）
  textSecondary: '#6B7280',       // 次文字（中灰）
  textTertiary: '#9CA3AF',        // 辅助文字（浅灰）

  // 功能色
  primary: '#3B82F6',             // 主色（蓝色）
  success: '#10B981',             // 完成（绿色）
  warning: '#F59E0B',             // 延后（琥珀色）
  danger: '#EF4444',              // 删除/危险（红色）

  // 状态色
  pending: '#3B82F6',             // 待完成（蓝）
  done: '#10B981',                // 已完成（绿）
  postponed: '#F59E0B',           // 延后（琥珀）
  archived: '#9CA3AF',            // 归档（灰）

  // 滑动操作色
  swipeCompleteBg: '#DCFCE7',     // 完成滑动背景
  swipePostponeBg: '#FEF3C7',     // 延后滑动背景
  swipeDeleteBg: '#FEE2E2',       // 删除滑动背景
};

export const DarkTheme = {
  // 背景色（低亮度护眼）
  background: '#111827',          // 页面主背景（深蓝黑）
  cardBackground: '#1F2937',      // 卡片背景（深灰蓝）
  separator: '#374151',           // 分割线

  // 文字色（降低对比度护眼）
  textPrimary: '#F3F4F6',         // 主文字（浅灰白）
  textSecondary: '#9CA3AF',       // 次文字（中灰）
  textTertiary: '#6B7280',        // 辅助文字（暗灰）

  // 功能色（饱和度降低，避免刺眼）
  primary: '#60A5FA',             // 主色（柔和蓝）
  success: '#34D399',             // 完成（柔和绿）
  warning: '#FBBF24',             // 延后（柔和琥珀）
  danger: '#F87171',              // 删除/危险（柔和红）

  // 状态色
  pending: '#60A5FA',             // 待完成
  done: '#34D399',                // 已完成
  postponed: '#FBBF24',           // 延后
  archived: '#6B7280',            // 归档

  // 滑动操作色
  swipeCompleteBg: '#064E3B',     // 完成滑动背景（深绿）
  swipePostponeBg: '#78350F',     // 延后滑动背景（深琥珀）
  swipeDeleteBg: '#7F1D1D',       // 删除滑动背景（深红）
};
