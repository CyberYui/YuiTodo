/**
 * Production App — Full version with all features
 * ErrorBoundary wraps entire app to catch initialization errors
 */

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { ThemeProvider } from './src/context/ThemeContext';
import { FontProvider } from './src/context/FontContext';
import { BackgroundProvider } from './src/context/BackgroundContext';
import { TaskProvider } from './src/context/TaskContext';
import { ListProvider } from './src/context/ListContext';
import { ReminderProvider } from './src/context/ReminderContext';
import { DragSortProvider } from './src/context/DragSortContext';

import HomeScreen from './src/screens/HomeScreen';
import StatisticsScreen from './src/screens/StatisticsScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import BackgroundSettingsScreen from './src/screens/BackgroundSettingsScreen';
import RecycleBinScreen from './src/screens/RecycleBinScreen';
import IconPickerScreen from './src/screens/IconPickerScreen';
import ReminderSettingsScreen from './src/screens/ReminderSettingsScreen';
import FontPicker from './src/components/FontPicker';
import ErrorBoundary from './src/components/ErrorBoundary';

const Stack = createNativeStackNavigator();

function AppContent() {
  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator initialRouteName="Home"
        screenOptions={{ headerShown: true, headerTitleStyle: { fontWeight: '700', fontSize: 18 }, headerShadowVisible: false }}>
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: '' }} />
        <Stack.Screen name="Statistics" component={StatisticsScreen} options={{ title: '数据统计' }} />
        <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: '设置' }} />
        <Stack.Screen name="FontPicker" component={FontPicker} options={{ title: '字体' }} />
        <Stack.Screen name="BackgroundSettings" component={BackgroundSettingsScreen} options={{ title: '背景' }} />
        <Stack.Screen name="RecycleBin" component={RecycleBinScreen} options={{ title: '回收站' }} />
        <Stack.Screen name="IconPicker" component={IconPickerScreen} options={{ title: '图标' }} />
        <Stack.Screen name="ReminderSettings" component={ReminderSettingsScreen} options={{ title: '提醒' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <ThemeProvider>
            <FontProvider>
              <BackgroundProvider>
                <TaskProvider>
                  <ListProvider>
                    <ReminderProvider>
                      <DragSortProvider>
                        <AppContent />
                      </DragSortProvider>
                    </ReminderProvider>
                  </ListProvider>
                </TaskProvider>
              </BackgroundProvider>
            </FontProvider>
          </ThemeProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
