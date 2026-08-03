// App根组件：导航容器 + 全局状态提供者
// 应用启动时第一个被渲染的组件
// 职责：1. 包裹全局Provider  2. 配置导航栈  3. 定义页面路由

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

// 导入全局状态Provider
import { ThemeProvider } from './src/context/ThemeContext';
import { FontProvider } from './src/context/FontContext';
import { TaskProvider } from './src/context/TaskContext';

// 导入页面组件
import HomeScreen from './src/screens/HomeScreen';
import StatisticsScreen from './src/screens/StatisticsScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import FontPickerScreen from './src/components/FontPicker';

// 导入字体加载Hook
import { useFontLoader } from './src/hooks/useFontLoader';

// 创建导航栈
const Stack = createNativeStackNavigator();

// 字体加载界面
function FontLoadingScreen() {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#3B82F6" />
      <Text style={styles.loadingText}>正在加载字体...</Text>
    </View>
  );
}

/**
 * 应用根组件
 */
function AppContent() {
  const { loaded } = useFontLoader();

  if (!loaded) {
    return <FontLoadingScreen />;
  }

  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: true,
          headerTitleStyle: {
            fontWeight: '700',
            fontSize: 18,
          },
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: 'YuiTodo' }}
        />
        <Stack.Screen
          name="Statistics"
          component={StatisticsScreen}
          options={{ title: '数据统计' }}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ title: '设置' }}
        />
        <Stack.Screen
          name="FontPicker"
          component={FontPickerScreen}
          options={{ title: '选择字体' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    // 手势处理根容器：必须包裹所有使用手势的组件
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* 安全区域Provider：处理刘海屏/圆角屏的边距 */}
      <SafeAreaProvider>
        {/* 主题Provider：提供日/夜间主题色 */}
        <ThemeProvider>
          {/* 字体Provider：提供全局字体设置 */}
          <FontProvider>
            {/* 任务数据Provider：提供任务列表和操作函数 */}
            <TaskProvider>
              <AppContent />
            </TaskProvider>
          </FontProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' },
  loadingText: { marginTop: 16, fontSize: 14, color: '#6B7280' },
});
