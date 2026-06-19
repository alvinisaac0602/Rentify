import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, Dimensions,
  TouchableOpacity, Image, NativeSyntheticEvent, NativeScrollEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../constants/colors';
import { FontSize, FontWeight, Radius, Spacing, Shadow } from '../constants/theme';

const { width, height } = Dimensions.get('window');

interface Slide {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  gradientColors: [string, string];
}

const SLIDES: Slide[] = [
  {
    id: '1',
    title: 'Find & Book Any Space',
    subtitle: 'Safely, verified, and fast.',
    description: 'Browse Kampala\'s finest apartments, modern coworking offices, retail storefronts, and daily Airbnbs in seconds.',
    icon: 'home-search-outline',
    gradientColors: [Colors.primary, '#3B82F6'],
  },
  {
    id: '2',
    title: 'Trust First, Always',
    subtitle: 'Verified listings you can count on.',
    description: 'We inspect every property. Look out for the verification badges and landlord trust scores to rent with total peace of mind.',
    icon: 'shield-check-outline',
    gradientColors: ['#0EA5E9', '#0284C7'],
  },
  {
    id: '3',
    title: 'Tailored Categories',
    subtitle: 'Everything under one roof.',
    description: 'Whether it\'s a long-term family home, a commercial arcade stall, or a cozy weekend stay, Rentify has you fully covered.',
    icon: 'office-building-marker-outline',
    gradientColors: ['#10B981', '#059669'],
  },
  {
    id: '4',
    title: 'Direct landlord Chat',
    subtitle: 'Connect instantly without brokers.',
    description: 'Chat directly in-app, schedule physical viewings, send requests, and securely book your space without hidden fees.',
    icon: 'chat-processing-outline',
    gradientColors: ['#F59E0B', '#D97706'],
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const flatListRef = useRef<FlatList<Slide>>(null);

  const updateCurrentSlideIndex = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = e.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(contentOffsetX / width);
    setCurrentSlideIndex(currentIndex);
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
        {/* Top graphic block with custom gradient */}
        <LinearGradient
          colors={item.gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.graphicBox}
        >
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons name={item.icon} size={64} color={Colors.white} />
          </View>
          
          {/* Subtle design elements */}
          <View style={[styles.bubble, { top: '20%', left: '15%', width: 60, height: 60, opacity: 0.15 }]} />
          <View style={[styles.bubble, { bottom: '15%', right: '10%', width: 100, height: 100, opacity: 0.1 }]} />
          <View style={[styles.bubble, { top: '10%', right: '20%', width: 40, height: 40, opacity: 0.1 }]} />
        </LinearGradient>

        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: item.gradientColors[0] }]}>{item.title}</Text>
          <Text style={styles.subtitle}>{item.subtitle}</Text>
          <Text style={styles.description}>{item.description}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Top bar (Skip button) */}
      <View style={styles.header}>
        <View />
        {currentSlideIndex < SLIDES.length - 1 && (
          <TouchableOpacity onPress={handleSkip} activeOpacity={0.7}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        )}
      </View>

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

      {/* Bottom control bar (Indicators + Next Button) */}
      <View style={styles.footer}>
        {/* Slide indicator dots */}
        <View style={styles.indicatorContainer}>
          {SLIDES.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                currentSlideIndex === index && styles.indicatorActive,
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
            { backgroundColor: SLIDES[currentSlideIndex].gradientColors[0] }
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  header: {
    height: 48,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  skipText: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: Colors.muted,
  },
  slideContainer: {
    width: width,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  graphicBox: {
    width: width - (Spacing.xl * 2),
    height: height * 0.36,
    borderRadius: Radius['2xl'],
    marginTop: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    ...Shadow.md,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.sm,
  },
  bubble: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: Colors.white,
  },
  textContainer: {
    width: width - (Spacing.xl * 2),
    marginTop: Spacing.xl,
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  title: {
    fontSize: FontSize['2xl'],
    fontWeight: FontWeight.bold,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
  },
  description: {
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    lineHeight: 24,
    marginTop: Spacing.xs,
  },
  footer: {
    height: 100,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  indicatorContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  indicator: {
    height: 6,
    width: 6,
    borderRadius: 3,
    backgroundColor: Colors.border,
  },
  indicatorActive: {
    width: 20,
    backgroundColor: Colors.primary,
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
