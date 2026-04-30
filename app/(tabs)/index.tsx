import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authService } from '../../services/authService';
import { eventService } from '../../services/eventService';
import { orderService } from '../../services/orderService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');
const BANNER_WIDTH = width * 0.75 + 15;

export default function HomeScreen() {
  const [activeBanner, setActiveBanner] = useState(0);
  const [events, setEvents] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [bannerEvents, setBannerEvents] = useState<any[]>([]);
  const [lastTransaction, setLastTransaction] = useState<string>('Belum ada transaksi');
  const [isLoading, setIsLoading] = useState(true);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<number>>(new Set());
  const [activeChip, setActiveChip] = useState('sorotan');
  const [hasUnreadNotif, setHasUnreadNotif] = useState(true);

  const categories = [
    { name: 'Musik', icon: 'music-note', color: '#1E3A5F' },
    { name: 'Festival', icon: 'tent', color: '#D32F2F' },
    { name: 'Teater', icon: 'drama-masks', color: '#E65100' },
    { name: 'Seni', icon: 'palette', color: '#6A1B9A' },
    { name: 'Seminar', icon: 'school', color: '#5D4037' }
  ];

  useFocusEffect(
    useCallback(() => {
      loadData();
      checkNotifStatus();
    }, [])
  );

  const checkNotifStatus = async () => {
    try {
      const val = await AsyncStorage.getItem('notif_all_read');
      setHasUnreadNotif(val !== 'true');
    } catch (e) {
      setHasUnreadNotif(true);
    }
  };

  const loadData = async () => {
    try {
      setIsLoading(true);
      const userData = await authService.getCurrentProfile();
      setProfile(userData);
      
      const data = await eventService.getAllEvents();
      if (data && data.length > 0) {
        const randomEvents = [...data].sort(() => 0.5 - Math.random()).slice(0, 3);
        setBannerEvents(randomEvents);
      }
      setEvents(data);

      const bmIds = await eventService.getBookmarkedEventIds();
      setBookmarkedIds(bmIds);

      const orders = await orderService.getMyTickets();
      if (orders && orders.length > 0) {
         setLastTransaction(`Tiket ${orders[0].events?.title || 'Konser'}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleScroll = (event: any) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(scrollPosition / BANNER_WIDTH);
    setActiveBanner(currentIndex);
  };

  const handleToggleBookmark = async (eventId: number) => {
    const result = await eventService.toggleBookmark(eventId);
    setBookmarkedIds(prev => {
      const next = new Set(prev);
      if (result) {
        next.add(eventId);
      } else {
        next.delete(eventId);
      }
      return next;
    });
  };

  // Filter events berdasarkan chip aktif
  const getFilteredEvents = () => {
    if (!events || events.length === 0) return [];
    switch (activeChip) {
      case 'populer':
        // Sort by price descending (event populer biasanya mahal / banyak terjual)
        return [...events].sort((a, b) => (b.price || 0) - (a.price || 0));
      case 'terbaru':
        // Sort by ID descending (terbaru = ID terbesar)
        return [...events].sort((a, b) => b.id - a.id);
      case 'sorotan':
      default:
        // Shuffle (sorotan = random recommendation)
        return [...events].sort(() => 0.5 - Math.random());
    }
  };

  const filteredRecommendations = getFilteredEvents();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          <LinearGradient colors={['#5DB2E5', '#FFFFFF']} style={styles.gradientHeader}>
            <View style={[styles.header, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
              <View>
                <Text style={styles.greetingTitle}>Tikara</Text>
                <Text style={styles.greetingName}>Hallo {profile?.full_name || 'User'}</Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <TouchableOpacity onPress={async () => {
                  await AsyncStorage.setItem('notif_all_read', 'true');
                  setHasUnreadNotif(false);
                  router.push('/notifications');
                }} style={styles.iconBtn}>
                  <MaterialCommunityIcons name="bell" size={20} color="#1E88E5" />
                  {hasUnreadNotif && <View style={styles.notificationDot} />}
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.push('/bookmarks')} style={styles.iconBtn}>
                  <MaterialCommunityIcons name="bookmark" size={20} color="#1E88E5" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.searchContainer}>
              <MaterialCommunityIcons name="magnify" size={22} color="#888" />
              <TextInput style={styles.searchInput} placeholder="Cari event, artis dan kota" placeholderTextColor="#888" />
            </View>
          </LinearGradient>

          {/* DOMPET (Wallet Card) */}
          <View style={styles.walletCardWrapper}>
            <View style={styles.walletCardTop}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <MaterialCommunityIcons name="cash-multiple" size={22} color="#333" />
                  <Text style={{ fontSize: 13, color: '#333' }}>Saldo Tikara</Text>
                </View>
                <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }} onPress={() => router.push('/topup')}>
                  <Text style={{ fontSize: 12, color: '#333' }}>Topup</Text>
                  <MaterialCommunityIcons name="credit-card" size={18} color="#1E88E5" />
                </TouchableOpacity>
              </View>
              <Text style={{ fontSize: 14, color: '#333', marginTop: 10 }}>Rp. {profile?.balance?.toLocaleString('id-ID') || '0'}</Text>
            </View>
            
            <TouchableOpacity style={styles.walletCardBottom} onPress={() => router.push('/(tabs)/ticket')}>
              <Text style={{ color: '#FFF', fontSize: 12 }}>Transaksi terakhir : {lastTransaction}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Text style={{ color: '#FFF', fontSize: 12 }}>Riwayat</Text>
                <MaterialCommunityIcons name="wallet-outline" size={16} color="#FFF" />
              </View>
            </TouchableOpacity>
          </View>

          {/* CAROUSEL BANNERS */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.bannerContainer}
            contentContainerStyle={{ paddingHorizontal: 20 }}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            snapToInterval={BANNER_WIDTH}
            decelerationRate="fast"
          >
            {bannerEvents.map((evt, index) => (
              <TouchableOpacity 
                key={`banner-${evt.id}-${index}`} 
                activeOpacity={0.8}
                onPress={() => router.push({ pathname: '/event-detail', params: { id: evt.id } })}
              >
                <Image source={{ uri: evt.image_url || 'https://picsum.photos/400/200' }} style={styles.bannerImage} />
              </TouchableOpacity>
            ))}
          </ScrollView>
          <View style={styles.carouselDots}>
            {bannerEvents.map((_, i) => (
              <View key={i} style={[styles.dot, i === activeBanner && styles.dotActive]} />
            ))}
          </View>

          {/* MENU KATEGORI EVENT */}
          <View style={styles.categoriesRow}>
            {categories.map((cat, i) => (
              <TouchableOpacity key={i} style={styles.categoryItem} onPress={() => router.push({ pathname: '/(tabs)/explore', params: { search: cat.name } })}>
                <View style={styles.categoryIconBg}>
                  <MaterialCommunityIcons name={cat.icon as any} size={24} color={cat.color} />
                </View>
                <Text style={styles.categoryText}>{cat.name}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* REKOMENDASI UNTUK KAMU */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Rekomendasi Untuk Kamu</Text>
          </View>

          {/* FILTER CHIPS — sekarang berfungsi */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsContainer}>
            <TouchableOpacity style={[styles.chip, activeChip === 'sorotan' && styles.chipActive]} onPress={() => setActiveChip('sorotan')}>
              <Text style={styles.chipEmoji}>💡</Text>
              <Text style={[styles.chipText, activeChip === 'sorotan' && styles.chipTextActive]}>Sorotan</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.chip, activeChip === 'populer' && styles.chipActive]} onPress={() => setActiveChip('populer')}>
              <Text style={styles.chipEmoji}>🔥</Text>
              <Text style={[styles.chipText, activeChip === 'populer' && styles.chipTextActive]}>Populer</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.chip, activeChip === 'terbaru' && styles.chipActive]} onPress={() => setActiveChip('terbaru')}>
              <Text style={styles.chipEmoji}>⏰</Text>
              <Text style={[styles.chipText, activeChip === 'terbaru' && styles.chipTextActive]}>Terbaru</Text>
            </TouchableOpacity>
          </ScrollView>

          {/* DAFTAR EVENT */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recommendationContainer}>
             {isLoading ? (
               <ActivityIndicator size="large" color="#1E88E5" style={{ marginLeft: 20 }} />
             ) : (
               filteredRecommendations.map((eventData: any, idx: number) => (
                 <RecommendationCard 
                   key={`${eventData.id}-${idx}`} 
                   event={eventData} 
                   isBookmarked={bookmarkedIds.has(eventData.id)}
                   onToggleBookmark={handleToggleBookmark}
                 />
               ))
             )}
          </ScrollView>

        </ScrollView>

        {/* FAB KHUSUS ORGANIZER (Scanner & Add Event) */}
        {profile?.role === 'organizer' && (
          <View style={{ position: 'absolute', bottom: 30, right: 20, gap: 10 }}>
            <TouchableOpacity
              style={[styles.fab, { backgroundColor: '#333' }]}
              onPress={() => router.push('/scanner')}
            >
              <MaterialCommunityIcons name="qrcode-scan" size={24} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.fab}
              onPress={() => router.push('/create-event')}
            >
              <MaterialCommunityIcons name="plus" size={30} color="#FFF" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

// Sub Komponen Card
const RecommendationCard = ({ event, isBookmarked, onToggleBookmark }: { event: any; isBookmarked: boolean; onToggleBookmark: (id: number) => void }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={() => router.push({ pathname: '/event-detail', params: { id: event.id } })}>
      {/* Top Banner with Badges */}
      <View style={styles.cardImageWrapper}>
        <Image source={{ uri: event.image_url || 'https://picsum.photos/300/200' }} style={styles.cardImage} />
        {/* Bookmark Badge */}
        <TouchableOpacity 
          style={styles.heartBadge}
          onPress={async (e) => {
             e.stopPropagation?.();
             onToggleBookmark(event.id);
          }}>
          <MaterialCommunityIcons name={isBookmarked ? "bookmark" : "bookmark-outline"} size={16} color="#1E88E5" />
        </TouchableOpacity>
        {/* Category Label */}
        <View style={styles.catLabel}>
          <MaterialCommunityIcons name="tag" size={12} color="#666" />
          <Text style={styles.catLabelText}>{event.category || 'Event'}</Text>
        </View>
      </View>
      
      {/* Content */}
      <View style={styles.cardContent}>
        <Text style={styles.cardEventTitle} numberOfLines={2}>
          {event.title}
        </Text>
        <View style={styles.cardRow}>
           <MaterialCommunityIcons name="map-marker" size={14} color="#666" />
           <Text style={styles.cardRowText}>{event.location}</Text>
        </View>
        <View style={styles.cardRow}>
           <MaterialCommunityIcons name="calendar-range" size={14} color="#666" />
           <Text style={styles.cardRowText}>{event.date}</Text>
        </View>
        
        {/* Prices */}
        <Text style={styles.strikePrice}>IDR {(event.price + 500000).toLocaleString('id-ID')}</Text>
        <Text style={styles.promoPrice}>IDR {event.price?.toLocaleString('id-ID')}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContent: { paddingBottom: 100 },
  
  // Header section
  gradientHeader: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 60, borderBottomLeftRadius: 0, borderBottomRightRadius: 0 },
  header: { marginBottom: 20 },
  greetingTitle: { fontSize: 26, fontWeight: 'bold', color: '#FFFFFF' },
  greetingName: { fontSize: 13, color: '#E3F2FD' },
  iconBtn: { backgroundColor: 'white', padding: 8, borderRadius: 20, position: 'relative' },
  notificationDot: { position: 'absolute', top: 6, right: 8, width: 8, height: 8, backgroundColor: '#E53935', borderRadius: 4, borderWidth: 1, borderColor: 'white' },
  
  searchContainer: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 12, paddingHorizontal: 15, height: 48, alignItems: 'center', elevation: 2 },
  searchInput: { flex: 1, fontSize: 13, marginLeft: 10 },
  
  // Wallet Card
  walletCardWrapper: { marginHorizontal: 20, borderRadius: 12, marginTop: -30, elevation: 8, backgroundColor: '#FFF', overflow: 'hidden' },
  walletCardTop: { padding: 15, backgroundColor: '#FFF' },
  walletCardBottom: { backgroundColor: '#1E88E5', paddingHorizontal: 15, paddingVertical: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  
  // Carousel
  bannerContainer: { marginTop: 25 },
  bannerImage: { width: width * 0.75, height: 130, borderRadius: 15, marginRight: 15 },
  carouselDots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 15 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#D9D9D9' },
  dotActive: { backgroundColor: '#1E88E5', width: 8 },

  // Categories
  categoriesRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 25, marginTop: 25 },
  categoryItem: { alignItems: 'center' },
  categoryIconBg: { width: 50, height: 50, borderRadius: 18, backgroundColor: '#E1F5FE', justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
  categoryText: { fontSize: 11, fontWeight: 'bold', color: '#000' },

  // Section
  sectionHeader: { paddingHorizontal: 20, marginTop: 30 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#000' },
  
  // Chips
  chipsContainer: { paddingHorizontal: 20, marginTop: 15, gap: 10, paddingBottom: 10 },
  chip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#EEE' },
  chipActive: { backgroundColor: '#F0F8FF', borderColor: '#BBDEFB' },
  chipEmoji: { fontSize: 14, marginRight: 5 },
  chipText: { fontSize: 12, color: '#666', fontWeight: '500' },
  chipTextActive: { color: '#1E88E5', fontWeight: 'bold' },

  // Recommendation Event Cards
  recommendationContainer: { paddingHorizontal: 20, gap: 15, marginTop: 5 },
  card: { width: width * 0.6, backgroundColor: '#FFF', borderRadius: 15, overflow: 'hidden', elevation: 2, marginRight: 15, borderWidth: 1, borderColor: '#F5F5F5' },
  cardImageWrapper: { width: '100%', height: 120, position: 'relative' },
  cardImage: { width: '100%', height: '100%' },
  heartBadge: { position: 'absolute', top: 10, left: 10, backgroundColor: '#FFF', borderRadius: 15, width: 26, height: 26, justifyContent: 'center', alignItems: 'center', elevation: 2 },
  catLabel: { position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(255,255,255,0.9)', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 15, gap: 4 },
  catLabelText: { fontSize: 10, color: '#666', fontWeight: 'bold' },
  
  cardContent: { padding: 12 },
  cardEventTitle: { fontWeight: 'bold', fontSize: 14, color: '#000', marginBottom: 8, lineHeight: 20 },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  cardRowText: { fontSize: 11, color: '#666' },
  
  strikePrice: { fontSize: 11, color: '#A0A0A0', textDecorationLine: 'line-through', marginTop: 10 },
  promoPrice: { fontSize: 14, fontWeight: 'bold', color: '#E53935', marginTop: 2 },
  
  fab: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#1E88E5', justifyContent: 'center', alignItems: 'center', elevation: 10 },
});