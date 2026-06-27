import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView,
  KeyboardAvoidingView, Platform, Image, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';
import { FontSize, FontWeight, Radius, Shadow, Spacing } from '../../constants/theme';
import { Button } from '../../components/ui/Button';
import { db } from '../../config/firebase';
import { collection, addDoc, doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';

const TIMES = ['9:00 AM', '11:00 AM', '2:00 PM', '4:00 PM', '6:00 PM'];

const getNextFiveDays = () => {
  const days = [];
  const options: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric' };
  for (let i = 1; i <= 5; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    days.push(d.toLocaleDateString('en-US', options));
  }
  return days;
};

export default function ViewingRequestScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { propertyId, propertyTitle, landlordId } = useLocalSearchParams<{ 
    propertyId?: string;
    propertyTitle?: string;
    landlordId?: string;
  }>();

  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [tenantName, setTenantName] = useState('');
  const [tenantPhone, setTenantPhone] = useState('');
  const [note, setNote] = useState('');
  const [sent, setSent] = useState(false);
  const [loadingLandlord, setLoadingLandlord] = useState(false);
  const [landlord, setLandlord] = useState<{
    name: string;
    avatar: string;
    phone: string;
    isVerified: boolean;
    responseTime: string;
  } | null>(null);

  const datesList = getNextFiveDays();

  // Initialize selected date and prefill tenant details
  useEffect(() => {
    if (datesList.length > 0) {
      setSelectedDate(datesList[0]);
    }
  }, []);

  useEffect(() => {
    if (user) {
      setTenantName(user.name || '');
      setTenantPhone(user.phone || '');
    }
  }, [user]);

  // Fetch landlord info on mount
  useEffect(() => {
    if (!landlordId) return;
    const fetchLandlord = async () => {
      setLoadingLandlord(true);
      try {
        const userRef = doc(db, 'users', landlordId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.data();
          setLandlord({
            name: userData.displayName || userData.name || 'Landlord',
            avatar: userData.avatarUrl || userData.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&q=80',
            phone: userData.phoneNumber || userData.phone || '+256 700 000000',
            isVerified: !!userData.isVerified,
            responseTime: 'within an hour',
          });
        }
      } catch (err) {
        console.log('Error fetching landlord info:', err);
      } finally {
        setLoadingLandlord(false);
      }
    };
    fetchLandlord();
  }, [landlordId]);

  const handleSend = async () => {
    if (!tenantName.trim() || !tenantPhone.trim()) {
      Alert.alert('Required Fields', 'Please enter your name and phone number so the landlord can contact you.');
      return;
    }
    if (!selectedDate || !selectedTime) {
      Alert.alert('Required Fields', 'Please select a preferred date and time for your visit.');
      return;
    }

    setSent(true);
    try {
      if (user) {
        await addDoc(collection(db, 'viewingRequests'), {
          propertyId: propertyId || '',
          propertyTitle: propertyTitle || '',
          landlordId: landlordId || '',
          tenantName: tenantName.trim(),
          tenantPhone: tenantPhone.trim(),
          preferredDate: selectedDate,
          preferredTime: selectedTime,
          note: note.trim(),
          userId: user.id,
          tenantId: user.id,
          status: 'pending',
          createdAt: new Date().toISOString()
        });
      }
    } catch (e) {
      console.log('Error adding viewing request:', e);
    }
    setTimeout(() => {
      router.back();
    }, 2000);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Request a Viewing</Text>
        <View style={{ width: 40 }} />
      </View>

      {!sent ? (
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 90}
        >
          <ScrollView 
            contentContainerStyle={styles.body} 
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.title}>Request a Viewing 📅</Text>
            {propertyTitle && (
              <Text style={styles.subtitle} numberOfLines={2}>{propertyTitle}</Text>
            )}

            {/* Landlord details card */}
            {landlord && (
              <View style={styles.landlordContainer}>
                <Text style={styles.landlordSectionLabel}>Host / Landlord Information</Text>
                <View style={[styles.landlordCard, Shadow.sm]}>
                  <Image source={{ uri: landlord.avatar }} style={styles.landlordAvatar} />
                  <View style={{ flex: 1 }}>
                    <View style={styles.landlordNameRow}>
                      <Text style={styles.landlordName}>{landlord.name}</Text>
                      {landlord.isVerified && (
                        <MaterialCommunityIcons name="shield-check" size={16} color={Colors.trust} />
                      )}
                    </View>
                    <Text style={styles.landlordPhone}>📞 {landlord.phone}</Text>
                    <View style={styles.responseRow}>
                      <MaterialCommunityIcons name="clock-outline" size={13} color={Colors.muted} />
                      <Text style={styles.responseText}>Responds {landlord.responseTime}</Text>
                    </View>
                  </View>
                </View>
              </View>
            )}

            <Text style={styles.label}>Tenant Contact Name *</Text>
            <TextInput
              value={tenantName}
              onChangeText={setTenantName}
              placeholder="Your contact name"
              placeholderTextColor={Colors.placeholder}
              style={styles.textInput}
            />

            <Text style={styles.label}>Contact Phone Number *</Text>
            <TextInput
              value={tenantPhone}
              onChangeText={setTenantPhone}
              placeholder="e.g. +256 700 000000"
              placeholderTextColor={Colors.placeholder}
              keyboardType="phone-pad"
              style={styles.textInput}
            />

            <Text style={styles.label}>Choose a preferred date *</Text>
            <View style={styles.timeGrid}>
              {datesList.map(d => (
                <TouchableOpacity
                  key={d}
                  activeOpacity={0.78}
                  onPress={() => setSelectedDate(d)}
                  style={[styles.timeChip, selectedDate === d && styles.timeChipActive]}
                >
                  <Text style={[styles.timeText, selectedDate === d && styles.timeTextActive]}>{d}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Choose a preferred time *</Text>
            <View style={styles.timeGrid}>
              {TIMES.map(t => (
                <TouchableOpacity
                  key={t}
                  activeOpacity={0.78}
                  onPress={() => setSelectedTime(t)}
                  style={[styles.timeChip, selectedTime === t && styles.timeChipActive]}
                >
                  <Text style={[styles.timeText, selectedTime === t && styles.timeTextActive]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Note / Special Request (optional)</Text>
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="E.g. Let me know if there's parking space..."
              placeholderTextColor={Colors.placeholder}
              style={styles.noteInput}
              multiline
              numberOfLines={3}
            />

            <Button
              label="Send Viewing Request"
              onPress={handleSend}
              disabled={!selectedTime || !selectedDate || !tenantName.trim() || !tenantPhone.trim()}
              fullWidth
            />
          </ScrollView>
        </KeyboardAvoidingView>
      ) : (
        <View style={styles.successContainer}>
          <View style={styles.successIcon}>
            <MaterialCommunityIcons name="send-check" size={44} color={Colors.primary} />
          </View>
          <Text style={styles.successTitle}>Viewing Request Sent 📩</Text>
          <Text style={styles.successMessage}>
            The owner will respond shortly. Check your messages for updates.
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.base, paddingVertical: Spacing.md,
    backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.surfaceSecondary, alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text },
  body: { padding: Spacing.xl, gap: Spacing.sm, paddingBottom: 40 },
  title: { fontSize: FontSize['2xl'], fontWeight: FontWeight.bold, color: Colors.text, marginBottom: 4 },
  subtitle: { fontSize: FontSize.sm, color: Colors.muted, marginBottom: Spacing.lg },
  
  // Landlord Styles
  landlordContainer: {
    marginBottom: Spacing.lg,
  },
  landlordSectionLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  landlordCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  landlordAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.surfaceSecondary,
  },
  landlordNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  landlordName: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
    color: Colors.text,
  },
  landlordPhone: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.primary,
    marginBottom: 4,
  },
  responseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  responseText: {
    fontSize: FontSize.xs,
    color: Colors.muted,
  },

  textInput: {
    borderWidth: 1.5, borderColor: Colors.border, borderRadius: Radius.md,
    padding: Spacing.md, fontSize: FontSize.base, color: Colors.text,
    backgroundColor: Colors.surface, marginBottom: Spacing.md,
  },
  label: {
    fontSize: FontSize.sm, fontWeight: FontWeight.semibold,
    color: Colors.text, marginBottom: Spacing.sm, marginTop: Spacing.xs,
  },
  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.md },
  timeChip: {
    paddingHorizontal: Spacing.md, paddingVertical: 9,
    borderRadius: Radius.full, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.surface,
  },
  timeChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  timeText: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: FontWeight.medium },
  timeTextActive: { color: Colors.white, fontWeight: FontWeight.semibold },
  noteInput: {
    borderWidth: 1.5, borderColor: Colors.border, borderRadius: Radius.md,
    padding: Spacing.md, fontSize: FontSize.base, color: Colors.text,
    backgroundColor: Colors.surface, marginBottom: Spacing.lg,
    textAlignVertical: 'top', minHeight: 90,
  },
  successContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md, padding: Spacing.xl },
  successIcon: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.md, ...Shadow.md,
  },
  successTitle: { fontSize: FontSize['2xl'], fontWeight: FontWeight.bold, color: Colors.text, textAlign: 'center' },
  successMessage: { fontSize: FontSize.base, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22 },
});
