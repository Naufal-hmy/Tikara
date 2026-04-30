import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import React, { useState, useCallback } from 'react';
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { eventService } from '../services/eventService';

export default function BookmarksScreen() {
    const [bookmarks, setBookmarks] = useState<any[]>([]);

    // Refresh setiap kali halaman difokuskan
    useFocusEffect(
        useCallback(() => {
            loadBookmarks();
        }, [])
    );

    const loadBookmarks = async () => {
        const data = await eventService.getMyBookmarks();
        setBookmarks(data);
    };

    const handleRemove = async (eventId: number) => {
        await eventService.toggleBookmark(eventId);
        loadBookmarks(); // Refresh
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Bookmark Saya</Text>
                <View style={{ width: 24 }} />
            </View>

            {/* List Bookmark */}
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {bookmarks.length === 0 && <Text style={{textAlign: 'center', marginTop: 30}}>Belum ada acara yang ditandai.</Text>}
                
                {bookmarks.map((bm: any) => (
                    <BookmarkItem
                        key={bm.id}
                        id={bm.events?.id}
                        image={bm.events?.image_url}
                        title={bm.events?.title}
                        date={bm.events?.date}
                        price={`IDR ${bm.events?.price?.toLocaleString('id-ID')}`}
                        onRemove={() => handleRemove(bm.events?.id)}
                    />
                ))}

            </ScrollView>
        </SafeAreaView>
    );
}
// --- KOMPONEN ITEM BOOKMARK ---
const BookmarkItem = ({ id, image, title, date, price, onRemove }: { id: number, image: string, title: string, date: string, price: string, onRemove: () => void }) => {
    return (
        <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={() => router.push({ pathname: '/event-detail', params: { id } })}>
            <Image source={{ uri: image }} style={styles.image} />
            <View style={styles.info}>
                <Text style={styles.title} numberOfLines={1}>{title}</Text>
                <View style={styles.row}>
                    <MaterialCommunityIcons name="calendar" size={14} color="#666" />
                    <Text style={styles.detailText}>{date}</Text>
                </View>
                <View style={styles.row}>
                    <MaterialCommunityIcons name="ticket" size={14} color="#666" />
                    <Text style={styles.detailText} numberOfLines={1}>{price}</Text>
                </View>
            </View>
            <TouchableOpacity style={styles.removeBtn} onPress={onRemove}>
                <MaterialCommunityIcons name="bookmark-remove" size={22} color="#1E88E5" />
            </TouchableOpacity>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0'
    },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#000' },

    scrollContent: { padding: 20 },

    card: {
        flexDirection: 'row',
        backgroundColor: '#FFF',
        borderRadius: 12,
        marginBottom: 15,
        padding: 10,
        borderWidth: 1,
        borderColor: '#F0F0F0',
        alignItems: 'center'
    },
    image: { width: 70, height: 70, borderRadius: 10, backgroundColor: '#EEE' },
    info: { flex: 1, marginLeft: 15, justifyContent: 'center' },
    title: { fontSize: 15, fontWeight: 'bold', color: '#333', marginBottom: 5 },
    row: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 2 },
    detailText: { fontSize: 12, color: '#666' },

    removeBtn: { padding: 10 }
});