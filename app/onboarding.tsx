import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, Dimensions,
  TouchableOpacity, ImageBackground, NativeSyntheticEvent, NativeScrollEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '../constants/colors';
import { FontSize, FontWeight, Radius, Spacing, Shadow } from '../constants/theme';

const { width, height } = Dimensions.get('window');

interface Slide {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: any;
  accentColor: string;
}

const img1 = require('../assets/img1.png');
const img2 = require('../assets/img2.png');
const img3 = require('../assets/img3.png');

const SLIDES: Slide[] = [
  {
    id: '1',
    title: 'Find & Book Any Space',
    subtitle: 'Safely, verified, and fast.',
    description: "Browse Kampala's finest apartments, modern coworking offices, retail storefronts, and daily Airbnbs in seconds.",
    image: img1,
    accentColor: Colors.primary,
  },
  {
    id: '2',
    title: 'Trust First, Always',
    subtitle: 'Verified listings you can count on.',
    description: 'We inspect every property. Look out for the verification badges and landlord trust scores to rent with total peace of mind.',
    image: img2,
    accentColor: Colors.trust,
  },
  {
    id: '3',
    title: 'Direct Landlord Chat',
    subtitle: 'Connect instantly without brokers.',
    description: 'Chat directly in-app, schedule physical viewings, send requests, and securely book your space without hidden fees.',
    image: img3,
    accentColor: Colors.success,
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const flatListRef = useRef<FlatList<Slide>>(null);
  const insets = useSafeAreaInsets();

  const updateCurrentSlideIndex = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = e.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(contentOffsetX / width);
    if (currentIndex >= 0 && currentIndex < SLIDES.length) {
      setCurrentSlideIndex(currentIndex);
    }
  };

  const handleNext = async () => {
    const nextIndex = currentSlideIndex + 1;
    if (nextIndex < SLIDES.length) {
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setCurrentSlideIndex(nextIndex);
    } else {
      await handleComplete();
    }
  };

  const handleSkip = async () => {
    await handleComplete();
  };

  const handleComplete = async () => {
    await AsyncStorage.setItem('onboarding_done', 'true');
    router.replace('/' as any);
  };

  const renderSlide = ({ item }: { item: Slide }) => {
    return (
      <View style={styles.slideContainer}>
        <ImageBackground
          source={item.image}
          style={StyleSheet.absoluteFillObject}
          resizeMode="cover"
        >
          <LinearGradient
            colors={['rgba(15, 23, 42, 0.2)', 'rgba(15, 23, 42, 0.85)']}
            style={StyleSheet.absoluteFillObject}
          />
          <View style={[styles.textContainer, { paddingBottom: insets.bottom + 110 }]}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={[styles.subtitle, { color: item.accentColor }]}>{item.subtitle}</Text>
            <Text style={styles.description}>{item.description}</Text>
          </View>
        </ImageBackground>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Main FlatList for slides */}
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={updateCurrentSlideIndex}
        keyExtractor={(item) => item.id}
        bounces={false}
        style={{ flex: 1 }}
      />

      {/* Top bar (Skip button) */}
      <View style={[styles.header, { top: insets.top }]}>
        <View />
        {currentSlideIndex < SLIDES.length - 1 && (
          <TouchableOpacity onPress={handleSkip} activeOpacity={0.7}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Bottom control bar (Indicators + Next Button) */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.md }]}>
        {/* Slide indicator dots */}
        <View style={styles.indicatorContainer}>
          {SLIDES.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                currentSlideIndex === index && {
                  width: 20,
                  backgroundColor: SLIDES[currentSlideIndex].accentColor,
                },
              ]}
            />
          ))}
        </View>

        {/* Next / Get Started button */}
        <TouchableOpacity
          onPress={handleNext}
          activeOpacity={0.85}
          style={[
            styles.actionButton,
            { backgroundColor: SLIDES[currentSlideIndex].accentColor }
          ]}
        >
          <Text style={styles.actionButtonText}>
            {currentSlideIndex === SLIDES.length - 1 ? 'Get Started' : 'Next'}
          </Text>
          <MaterialCommunityIcons
            name={currentSlideIndex === SLIDES.length - 1 ? 'chevron-right' : 'arrow-right'}
            size={18}
            color={Colors.white}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 10,
    height: 48,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  skipText: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  slideContainer: {
    width: width,
    height: height,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
  },
  title: {
    fontSize: FontSize['3xl'],
    fontWeight: FontWeight.bold,
    color: Colors.white,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.semibold,
  },
  description: {
    fontSize: FontSize.base,
    color: '#E2E8F0',
    lineHeight: 24,
    marginTop: Spacing.xs,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
  },
  indicatorContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  indicator: {
    height: 6,
    width: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.xl,
    paddingVertical: 14,
    borderRadius: Radius.xl,
    ...Shadow.sm,
  },
  actionButtonText: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
    color: Colors.white,
  },
});
