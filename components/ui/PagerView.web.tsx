import React, { useRef } from 'react';
import { ScrollView, View, Dimensions } from 'react-native';

interface PagerViewProps {
  style?: any;
  initialPage?: number;
  onPageSelected?: (e: { nativeEvent: { position: number } }) => void;
  children: React.ReactNode;
}

export default function PagerView({ style, initialPage = 0, onPageSelected, children }: PagerViewProps) {
  const scrollViewRef = useRef<ScrollView>(null);

  const handleScroll = (event: any) => {
    if (!onPageSelected) return;
    const contentOffset = event.nativeEvent.contentOffset.x;
    const layoutWidth = event.nativeEvent.layoutMeasurement.width || Dimensions.get('window').width;
    const page = Math.round(contentOffset / layoutWidth);
    onPageSelected({ nativeEvent: { position: page } });
  };

  return (
    <ScrollView
      ref={scrollViewRef}
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      style={style}
      onMomentumScrollEnd={handleScroll}
      onScroll={handleScroll}
      scrollEventThrottle={16}
    >
      {React.Children.map(children, (child, index) => {
        if (!child) return null;
        return (
          <View style={{ width: Dimensions.get('window').width, height: style?.height || 300 }} key={index}>
            {child}
          </View>
        );
      })}
    </ScrollView>
  );
}
