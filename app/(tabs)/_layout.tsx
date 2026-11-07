import React from 'react';
import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Radius } from '../../src/constants/theme';

type TabIconProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  focused: boolean;
};

function TabIcon({ icon, label, focused }: TabIconProps) {
  return (
    <View style={styles.tabItem}>
      <Ionicons name={icon} size={21} color={focused ? Colors.accent : Colors.textSecondary} />
      <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>{label}</Text>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
        tabBarItemStyle: styles.tabBarItem,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="home" label="Home" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="products"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="cube-outline" label="Products" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="routine"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="calendar-outline" label="Routine" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="journey"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="stats-chart-outline" label="Journey" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="guide"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="book-outline" label="Guide" focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.surface,
    borderTopWidth: 0,
    borderRadius: 22,
    height: 78,
    marginHorizontal: 10,
    marginBottom: 10,
    paddingHorizontal: 6,
    paddingTop: 7,
    paddingBottom: 7,
    shadowColor: '#163B2B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 5,
  },
  tabBarItem: { borderRadius: Radius.lg },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    minWidth: 58,
    paddingHorizontal: 4,
    paddingVertical: 5,
    borderRadius: Radius.md,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.textSecondary,
  },
  tabLabelActive: {
    color: Colors.accent,
    fontWeight: Typography.fontWeight.semibold,
  },
});
