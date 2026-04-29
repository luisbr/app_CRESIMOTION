import React, {useRef, useState} from 'react';
import {SectionList, View, StyleSheet, SectionListProps, ViewStyle} from 'react-native';
import {useSelector} from 'react-redux';
import {moderateScale} from '../../common/constants';

interface CCustomSectionListProps<T, SectionT> extends SectionListProps<T, SectionT> {
  containerStyle?: ViewStyle | ViewStyle[];
  trackColor?: string;
  thumbColor?: string;
}

export default function CCustomSectionList<T, SectionT>({
  containerStyle,
  contentContainerStyle,
  trackColor = 'rgba(0, 0, 0, 0.08)',
  thumbColor,
  onScroll,
  onContentSizeChange,
  onLayout,
  ...rest
}: CCustomSectionListProps<T, SectionT>) {
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
      <SectionList
        {...rest}
        contentContainerStyle={contentContainerStyle}
        showsVerticalScrollIndicator={false}
        onLayout={event => {
          scrollLayoutHeightRef.current = event.nativeEvent.layout.height;
          updateScrollIndicator();
          onLayout?.(event);
        }}
        onContentSizeChange={(w, h) => {
          scrollContentHeightRef.current = h;
          updateScrollIndicator();
          onContentSizeChange?.(w, h);
        }}
        onScroll={event => {
          updateScrollIndicator(event.nativeEvent.contentOffset.y);
          onScroll?.(event);
        }}
        scrollEventThrottle={16}
      />

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
