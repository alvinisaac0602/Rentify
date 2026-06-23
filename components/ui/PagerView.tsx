import React from 'react';
import RNPagerView from 'react-native-pager-view';

interface PagerViewProps {
  style?: any;
  initialPage?: number;
  onPageSelected?: (e: { nativeEvent: { position: number } }) => void;
  children: React.ReactNode;
}

export default function PagerView({ style, initialPage = 0, onPageSelected, children }: PagerViewProps) {
  return (
    <RNPagerView
      style={style}
      initialPage={initialPage}
      onPageSelected={onPageSelected as any}
    >
      {children}
    </RNPagerView>
  );
}
