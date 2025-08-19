import React from 'react';
import * as Icons from 'lucide-react-native';
import { View } from 'react-native';

interface CategoryIconProps {
  iconName: string;
  color: string;
  size?: number;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ iconName, color, size = 24 }) => {
  const Icon = (Icons as any)[iconName] || Icons.HelpCircle;
  
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Icon size={size} color={color} />
    </View>
  );
};
