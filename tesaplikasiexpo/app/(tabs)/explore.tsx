import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import React, { useState, useEffect, useCallback } from 'react';
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  FlatList,
  Pressable
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { eventService } from '../../services/eventService';
import { orderService } from '../../services/orderService';

const ALL_CATEGORIES = ['Semua', 'Musik', 'Festival', 'Teater', 'Seni', 'Seminar'];

export default function ExploreScreen() {
  const { search } = useLocalSearchParams();
  const [searchText, setSearchText] = useState((search as string) || '');
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [popularSearches, setPopularSearches] = useState<string[]>([]);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<number>>(new Set());

  // Filter state
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [selectedLocation, setSelectedLocation] = useState('Semua');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);

  useEffect(() => {
    if (search) setSearchText(search as string);
  }, [search]);

  useFocusEffect(
    useCallback(() => {
      loadEvents();
      loadBookmarks();
      orderService.getPopularTitles().then(setPopularSearches);
    }, [])
  );

  // Ketika search dari params berubah, reset filters
  useEffect(() => {
    if (search) {
      // Cek apakah search param cocok dengan salah satu kategori
      const matchedCategory = ALL_CATEGORIES.find(
        c => c.toLowerCase() === (search as string).toLowerCase()
      );
      if (matchedCategory) {
        setSelectedCategory(matchedCategory);
        setSearchText('');
      } else {
        setSearchText(search as string);
        setSelectedCategory('Semua');
      }
    }
  }, [search]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await eventService.getAllEvents();
      setEvents(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadBookmarks = async () => {
    const bmIds = await eventService.getBookmarkedEventIds();
    setBookmarkedIds(bmIds);
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

  // Kumpulkan lokasi unik dari events
  const uniqueLocations = ['Semua', ...Array.from(new Set(events.map(e => e.location).filter(Boolean)))];

  // Filter events berdasarkan searchText, category, dan location
  const filteredEvents = events.filter(e => {
    const matchesSearch = searchText.length === 0 || 
      e.title.toLowerCase().includes(searchText.toLowerCase()) ||
      e.location?.toLowerCase().includes(searchText.toLowerCase()) ||
      e.category?.toLowerCase().includes(searchText.toLowerCase());
    
    const matchesCategory = selectedCategory === 'Semua' || 
      e.category?.toLowerCase() === selectedCategory.toLowerCase();

    const matchesLocation = selectedLocation === 'Semua' ||
      e.location?.toLowerCase() === selectedLocation.toLowerCase();

    return matchesSearch && matchesCategory && matchesLocation;
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.innerContainer}>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <MaterialCommunityIcons name="magnify" size={24} color="#A0A0A0" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari event, artis dan kota"
            placeholderTextColor="#A0A0A0"
            value={searchText}
            onChangeText={(text) => {
              setSearchText(text);
            }}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <MaterialCommunityIcons name="close-circle" size={20} color="#A0A0A0" />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

          {/* Pencarian Populer */}
          <Text style={styles.sectionTitle}>Pencarian Populer</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
            {popularSearches.map(term => (
               <SearchChip 
                 key={term} 
                 text={term} 
                 onPress={() => setSearchText(term)} 
                 onDelete={() => setPopularSearches(prev => prev.filter(p => p !== term))} 
               />
            ))}
          </ScrollView>

          {/* Filter Bar (Kategori, Lokasi) */}
          <Text style={styles.sectionTitle}>Filter</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
            <TouchableOpacity style={styles.filterIconBtn} onPress={() => {
              setSelectedCategory('Semua');
              setSelectedLocation('Semua');
              setSearchText('');
            }}>
              <MaterialCommunityIcons name="tune-vertical" size={20} color="#333" />
            </TouchableOpacity>
            <FilterChip 
              text={selectedCategory === 'Semua' ? 'Kategori' : selectedCategory} 
              active={selectedCategory !== 'Semua'}
              onPress={() => setShowCategoryModal(true)} 
            />
            <FilterChip 
              text={selectedLocation === 'Semua' ? 'Lokasi' : selectedLocation} 
              active={selectedLocation !== 'Semua'}
              onPress={() => setShowLocationModal(true)} 
            />
          </ScrollView>

          {/* List Event (Vertical) */}
          <View style={styles.listContainer}>
            {loading ? (
              <Text style={{ textAlign: 'center', marginTop: 20 }}>Memuat...</Text>
            ) : filteredEvents.length === 0 ? (
              <Text style={{ textAlign: 'center', marginTop: 20, color: '#999' }}>Tidak ada event ditemukan.</Text>
            ) : filteredEvents.map((eventData: any) => (
              <EventListCard
                key={eventData.id}
                id={eventData.id}
                image={eventData.image_url}
                title={eventData.title}
                category={eventData.category || 'Event'}
                promotor="Tikara Partner"
                location={eventData.location}
                date={eventData.date}
                price={`IDR ${eventData.price?.toLocaleString('id-ID')}`}
                isBookmarked={bookmarkedIds.has(eventData.id)}
                onToggleBookmark={handleToggleBookmark}
              />
            ))}
          </View>

        </ScrollView>
      </View>

      {/* Modal Dropdown Kategori */}
      <Modal visible={showCategoryModal} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setShowCategoryModal(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Pilih Kategori</Text>
            {ALL_CATEGORIES.map(cat => (
              <TouchableOpacity 
                key={cat} 
                style={[styles.modalItem, selectedCategory === cat && styles.modalItemActive]}
                onPress={() => {
                  setSelectedCategory(cat);
                  setShowCategoryModal(false);
                }}
              >
                <Text style={[styles.modalItemText, selectedCategory === cat && styles.modalItemTextActive]}>{cat}</Text>
                {selectedCategory === cat && <MaterialCommunityIcons name="check" size={20} color="#1E88E5" />}
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>

      {/* Modal Dropdown Lokasi */}
      <Modal visible={showLocationModal} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setShowLocationModal(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Pilih Lokasi</Text>
            {uniqueLocations.map(loc => (
              <TouchableOpacity 
                key={loc} 
                style={[styles.modalItem, selectedLocation === loc && styles.modalItemActive]}
                onPress={() => {
                  setSelectedLocation(loc);
                  setShowLocationModal(false);
                }}
              >
                <Text style={[styles.modalItemText, selectedLocation === loc && styles.modalItemTextActive]}>{loc}</Text>
                {selectedLocation === loc && <MaterialCommunityIcons name="check" size={20} color="#1E88E5" />}
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

// --- KOMPONEN KECIL ---

// Komponen Chip Riwayat Pencarian (ada tombol X)
const SearchChip = ({ text, onPress, onDelete }: { text: string, onPress: () => void, onDelete: () => void }) => (
  <View style={styles.searchChip}>
    <TouchableOpacity onPress={onPress} style={{flexDirection: 'row', alignItems: 'center'}}>
      <MaterialCommunityIcons name="magnify" size={16} color="#666" style={{ marginRight: 6 }} />
      <Text style={styles.searchChipText}>{text}</Text>
    </TouchableOpacity>
    <TouchableOpacity onPress={onDelete} style={{ marginLeft: 6, paddingHorizontal: 2 }}>
      <MaterialCommunityIcons name="close-circle" size={18} color="#A0A0A0" />
    </TouchableOpacity>
  </View>
);

// Komponen Chip Dropdown Filter
const FilterChip = ({ text, active, onPress }: { text: string; active?: boolean; onPress: () => void }) => (
  <TouchableOpacity style={[styles.filterChip, active && styles.filterChipActive]} onPress={onPress}>
    <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>{text}</Text>
    <MaterialCommunityIcons name="chevron-down" size={18} color={active ? '#1E88E5' : '#666'} style={{ marginLeft: 4 }} />
  </TouchableOpacity>
);

// Komponen Kartu Event Horizontal
const EventListCard = ({ image, title, category, promotor, location, date, price, id, isBookmarked, onToggleBookmark }: { image: string, title: string, category: string, promotor: string, location: string, date: string, price: string, id: number, isBookmarked: boolean, onToggleBookmark: (id: number) => void }) => {
  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.6}
      onPress={() => router.push({ pathname: '/event-detail', params: { id } })}
    >

      {/* Gambar Kiri */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: image }} style={styles.cardImage} />
        <TouchableOpacity
          style={styles.cardLikeButton}
          onPress={async () => {
             onToggleBookmark(id);
          }}
        >
          <MaterialCommunityIcons
            name={isBookmarked ? "bookmark" : "bookmark-outline"}
            size={18}
            color="#1E88E5" 
          />
        </TouchableOpacity>
      </View>

      {/* Konten Kanan */}
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={2}>{title}</Text>

        <View style={styles.categoryBadge}>
          <MaterialCommunityIcons name="tag" size={12} color="#1E88E5" />
          <Text style={styles.categoryBadgeText}>{category}</Text>
        </View>

        <View style={styles.cardDetailRow}>
          <MaterialCommunityIcons name="account" size={14} color="#666" />
          <Text style={styles.cardDetailText}>{promotor}</Text>
        </View>
        <View style={styles.cardDetailRow}>
          <MaterialCommunityIcons name="map-marker" size={14} color="#666" />
          <Text style={styles.cardDetailText}>{location}</Text>
        </View>
        <View style={styles.cardDetailRow}>
          <MaterialCommunityIcons name="calendar-month-outline" size={14} color="#666" />
          <Text style={styles.cardDetailText}>{date}</Text>
        </View>

        <Text style={styles.cardPrice}>{price}</Text>
      </View>

    </TouchableOpacity>
  );
};

// --- GAYA TAMPILAN ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  innerContainer: { flex: 1, paddingTop: 10 },

  // Search Bar
  searchContainer: { flexDirection: 'row', backgroundColor: '#F5F5F5', borderRadius: 12, paddingHorizontal: 15, height: 50, alignItems: 'center', marginHorizontal: 20, marginBottom: 20 },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 14, color: '#333' },

  scrollContent: { paddingBottom: 30 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginHorizontal: 20, marginTop: 10, marginBottom: 12 },
  horizontalScroll: { paddingHorizontal: 20, marginBottom: 20, gap: 10 },

  // Chips
  searchChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#E0E0E0' },
  searchChipText: { fontSize: 13, color: '#333' },

  filterIconBtn: { justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF', width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: '#E0E0E0' },
  filterChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', paddingHorizontal: 14, height: 36, borderRadius: 18, borderWidth: 1, borderColor: '#E0E0E0' },
  filterChipActive: { backgroundColor: '#E3F2FD', borderColor: '#1E88E5' },
  filterChipText: { fontSize: 13, color: '#333' },
  filterChipTextActive: { color: '#1E88E5', fontWeight: 'bold' },

  // Modal dropdown
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#FFF', borderRadius: 15, padding: 20, width: '80%', maxHeight: '60%' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  modalItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 10, borderRadius: 8, marginBottom: 4 },
  modalItemActive: { backgroundColor: '#E3F2FD' },
  modalItemText: { fontSize: 15, color: '#333' },
  modalItemTextActive: { color: '#1E88E5', fontWeight: 'bold' },

  // List Container
  listContainer: { paddingHorizontal: 20, gap: 16 },

  // Horizontal Card Style
  card: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 12, padding: 10, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, borderWidth: 1, borderColor: '#F0F0F0' },
  imageContainer: { position: 'relative' },
  cardImage: { width: 110, height: 110, borderRadius: 10, backgroundColor: '#E0E0E0' },
  cardLikeButton: { position: 'absolute', top: 6, left: 6, backgroundColor: '#FFFFFF', padding: 5, borderRadius: 15, elevation: 2 },

  cardContent: { flex: 1, marginLeft: 12, justifyContent: 'space-between' },
  cardTitle: { fontSize: 14, fontWeight: 'bold', color: '#1E88E5', marginBottom: 4 },

  categoryBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E1F5FE', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginBottom: 6, gap: 4 },
  categoryBadgeText: { fontSize: 10, color: '#1E88E5', fontWeight: 'bold' },

  cardDetailRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  cardDetailText: { fontSize: 11, color: '#666' },

  cardPrice: { fontSize: 14, fontWeight: 'bold', color: '#E53935', textAlign: 'right', marginTop: 8 },
});