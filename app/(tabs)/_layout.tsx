import type { ComponentType } from 'react';
import { StyleSheet, View } from 'react-native';
import { Tabs } from 'expo-router';
import { CalendarDays, Heart, User } from 'lucide-react-native';

import { COLORS } from '@/constants/colors';
import { FONTS } from '@/constants/theme';

type TabIconProps = {
  focused: boolean;
  icon: ComponentType<any>;
};

function TabIcon({ focused, icon: Icon }: TabIconProps) {
  return (
    <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
      <Icon
        size={20}
        color={focused ? COLORS.primary : COLORS.textSecondary}
        strokeWidth={focused ? 2.4 : 2}
      />
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarLabelStyle: {
          fontFamily: FONTS.semibold,
          fontSize: 10.5,
          marginTop: 2,
          letterSpacing: 0.2,
        },
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopWidth: 1,
          borderTopColor: COLORS.border,
          height: 70,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Decidir',
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon={Heart} />,
        }}
      />
      <Tabs.Screen
        name="historial"
        options={{
          title: 'Calendario',
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon={CalendarDays} />,
        }}
      />
      <Tabs.Screen
        name="ofertas"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon={User} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    width: 38,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: {
    backgroundColor: COLORS.primarySoft,
  },
});
