import React from 'react';
import {TouchableOpacity} from 'react-native';
import {useRoute} from '@react-navigation/native';
import * as Clipboard from 'expo-clipboard';
import {SHOW_SCREEN_TOOLTIP} from '../../config/debug';
import CText from './CText';

type Props = {
  name?: string;
};

export default function ScreenTooltip({name}: Props) {
  const route = useRoute();
  if (!SHOW_SCREEN_TOOLTIP) return null;
  const label = name || (route?.name as string) || 'UnknownScreen';
  return (
    <TouchableOpacity
      style={styles.tooltip}
      onPress={() => Clipboard.setStringAsync(label)}
      activeOpacity={0.8}
    >
      <CText type={'S12'} color={'#fff'}>
        {label}
      </CText>
    </TouchableOpacity>
  );
}

const styles = {
  tooltip: {
    position: 'absolute' as const,
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
};
