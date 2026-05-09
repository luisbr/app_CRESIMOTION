import React, {useRef, useState} from 'react';
import {ScrollView, View, StyleSheet, ScrollViewProps, ViewStyle} from 'react-native';
import {useSelector} from 'react-redux';
import {moderateScale} from '../../common/constants';

interface CCustomScrollViewProps extends ScrollViewProps {
  containerStyle?: ViewStyle | ViewStyle[];
  trackColor?: string;
  thumbColor?: string;
  showIndicatorWhenNoScroll?: boolean;
}

export default function CCustomScrollView({
  children,
  containerStyle,
  contentContainerStyle,
  style,
  trackColor = 'rgba(0, 0, 0, 0.08)',
  thumbColor,
  showIndicatorWhenNoScroll = true,
  ...rest
}: CCustomScrollViewProps) {
  const colors = useSelector((state: any) => state.theme.theme);
  const resolvedThumbColor = thumbColor || colors.primary;

  const [scrollIndicator, setScrollIndicator] = useState({visible: false, top: 0, height: 0});
  const scrollLayoutHeightRef = useRef(0);
  const scrollContentHeightRef = useRef(0);

  const updateScrollIndicator = (scrollY = 0) => {
    const layoutHeight = scrollLayoutHeightRef.current;
    const contentHeight = scrollContentHeightRef.current;

    if (!layoutHeight) {
      setScrollIndicator({visible: false, top: 0, height: 0});
      return;
    }

    if (!contentHeight || contentHeight <= layoutHeight + 4) {
      if (!showIndicatorWhenNoScroll) {
        setScrollIndicator({visible: false, top: 0, height: 0});
        return;
      }
      setScrollIndicator({
        visible: true,
        top: 0,
        height: Math.max(layoutHeight - moderateScale(8), moderateScale(36)),
      });
      return;
    }

    const trackHeight = Math.max(layoutHeight - moderateScale(8), 1);
    const thumbHeight = Math.max((layoutHeight / contentHeight) * trackHeight, moderateScale(36));
    const maxScroll = Math.max(contentHeight - layoutHeight, 1);
    const maxThumbTop = Math.max(trackHeight - thumbHeight, 0);
    const thumbTop = (scrollY / maxScroll) * maxThumbTop;

    setScrollIndicator({
      visible: true,
      top: thumbTop,
      height: thumbHeight,
    });
  };

  return (
    <View style={[styles.wrap, containerStyle]}>
      <ScrollView
        {...rest}
        style={[{flex: 1}, style]}
        contentContainerStyle={contentContainerStyle}
        showsVerticalScrollIndicator={false}
        onLayout={event => {
          scrollLayoutHeightRef.current = event.nativeEvent.layout.height;
          updateScrollIndicator();
          rest.onLayout?.(event);
        }}
        onContentSizeChange={(width, height) => {
          scrollContentHeightRef.current = height;
          updateScrollIndicator();
          rest.onContentSizeChange?.(width, height);
        }}
        onScroll={event => {
          updateScrollIndicator(event.nativeEvent.contentOffset.y);
          rest.onScroll?.(event);
        }}
        scrollEventThrottle={rest.scrollEventThrottle ?? 16}>
        {children}
      </ScrollView>

      {scrollIndicator.visible && (
        <View pointerEvents="none" style={[styles.track, {backgroundColor: trackColor}]}>
          <View
            style={[
              styles.thumb,
              {
                top: scrollIndicator.top,
                height: scrollIndicator.height,
                backgroundColor: resolvedThumbColor,
              },
            ]}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'relative',
    flex: 1,
  },
  track: {
    position: 'absolute',
    top: moderateScale(4),
    bottom: moderateScale(4),
    right: moderateScale(4),
    width: moderateScale(8),
    borderRadius: moderateScale(4),
  },
  thumb: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderRadius: moderateScale(4),
  },
});
