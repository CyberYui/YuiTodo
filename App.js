// App根组件 - 稳定版本
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { View, Text, StyleSheet } from 'react-native';

// 全局状态Provider
import { ThemeProvider } from './src/context/ThemeContext';
import { FontProvider } from './src/context/FontContext';
import { BackgroundProvider } from './src/context/BackgroundContext';
import { TaskProvider } from './src/context/TaskContext';

// 页面组件
import HomeScreen from './src/screens/HomeScreen';
import StatisticsScreen from './src/screens/StatisticsScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import FontPickerScreen from './src/components/FontPicker';
import BackgroundSettingsScreen from './src/screens/BackgroundSettingsScreen';

const Stack = createNativeStackNavigator();

function AppContent() {
  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: true,
          headerTitleStyle: { fontWeight: '700', fontSize: 18 },
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: '' }} />
        <Stack.Screen name="Statistics" component={StatisticsScreen} options={{ title: '数据统计' }} />
        <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: '设置' }} />
        <Stack.Screen name="FontPicker" component={FontPickerScreen} options={{ title: '字体' }} />
        <Stack.Screen name="BackgroundSettings" component={BackgroundSettingsScreen} options={{ title: '背景' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <FontProvider>
            <BackgroundProvider>
              <TaskProvider>
                <AppContent />
              </TaskProvider>
            </BackgroundProvider>
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
