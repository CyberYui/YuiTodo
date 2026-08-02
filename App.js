// App根组件：导航容器 + 全局状态提供者
// 应用启动时第一个被渲染的组件
// 职责：1. 包裹全局Provider  2. 配置导航栈  3. 定义页面路由

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// 导入全局状态Provider
import { ThemeProvider } from './src/context/ThemeContext';
import { FontProvider } from './src/context/FontContext';
import { TaskProvider } from './src/context/TaskContext';

// 导入页面组件
import HomeScreen from './src/screens/HomeScreen';
import StatisticsScreen from './src/screens/StatisticsScreen';
import SettingsScreen from './src/screens/SettingsScreen';

// 创建导航栈
const Stack = createNativeStackNavigator();

/**
 * 应用根组件
 */
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
            {/* 导航容器：管理页面路由 */}
            <NavigationContainer>
              {/* 状态栏样式跟随主题 */}
              <StatusBar style="auto" />
              {/* 导航栈定义 */}
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
                {/* 首页：任务列表 */}
                <Stack.Screen
                  name="Home"
                  component={HomeScreen}
                  options={{ title: 'YuiTodo' }}
                />
                {/* 统计面板页 */}
                <Stack.Screen
                  name="Statistics"
                  component={StatisticsScreen}
                  options={{ title: '数据统计' }}
                />
                {/* 设置页 */}
                <Stack.Screen
                  name="Settings"
                  component={SettingsScreen}
                  options={{ title: '设置' }}
                />
              </Stack.Navigator>
            </NavigationContainer>
          </TaskProvider>
          </FontProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
