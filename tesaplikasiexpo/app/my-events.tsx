import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import React, { useState, useCallback } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { eventService } from '../services/eventService';

export default function MyEventsScreen() {
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchMyEvents = async () => {
        setLoading(true);
        const data = await eventService.getMyOrganizedEvents();
        setEvents(data);
        setLoading(false);
    };

    useFocusEffect(
        useCallback(() => {
            fetchMyEvents();
        }, [])
    );

    const renderEvent = ({ item }: { item: any }) => (
        <View style={styles.card}>
            <Image source={{ uri: item.image_url || 'https://picsum.photos/400/200' }} style={styles.cardImage} />
            <View style={styles.cardContent}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
                    <View style={[styles.badge, item.status === 'published' ? styles.badgeSuccess : styles.badgeWarning]}>
                        <Text style={styles.badgeText}>{item.status.toUpperCase()}</Text>
                    </View>
                </View>
                <Text style={styles.cardLocation}><MaterialCommunityIcons name="map-marker" /> {item.location}</Text>
                
                <TouchableOpacity 
                    style={styles.editBtn} 
                    onPress={() => router.push({ pathname: '/edit-event', params: { id: item.id } })}
                >
                    <MaterialCommunityIcons name="pencil" size={16} color="#1E88E5" />
                    <Text style={styles.editBtnText}>Edit Event</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.headerNav}>
                <TouchableOpacity onPress={() => router.back()}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Event Buatanku</Text>
                <View style={{ width: 24 }} />
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#1E88E5" />
                </View>
            ) : events.length === 0 ? (
                <View style={styles.center}>
                    <MaterialCommunityIcons name="calendar-blank" size={60} color="#CCC" />
                    <Text style={styles.emptyText}>Kamu belum membuat event apa pun.</Text>
                    <TouchableOpacity style={styles.createBtn} onPress={() => router.push('/create-event')}>
                        <Text style={styles.createBtnText}>Buat Event Sekarang</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={events}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderEvent}
                    contentContainerStyle={{ padding: 15 }}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    headerNav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
    headerTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    emptyText: { color: '#666', marginTop: 15, marginBottom: 20 },
    createBtn: { backgroundColor: '#1E88E5', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 25 },
    createBtnText: { color: '#FFF', fontWeight: 'bold' },
    card: { backgroundColor: '#FFF', borderRadius: 15, marginBottom: 15, overflow: 'hidden', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
    cardImage: { width: '100%', height: 150, backgroundColor: '#E5E7EB' },
    cardContent: { padding: 15 },
    cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', flex: 1, marginRight: 10 },
    cardLocation: { fontSize: 13, color: '#666', marginTop: 5, marginBottom: 15 },
    badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
    badgeSuccess: { backgroundColor: '#DEF7EC' },
    badgeWarning: { backgroundColor: '#FEF3C7' },
    badgeText: { fontSize: 10, fontWeight: 'bold', color: '#333' },
    editBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F0F8FF', padding: 10, borderRadius: 8, gap: 5 },
    editBtnText: { color: '#1E88E5', fontWeight: 'bold' }
});
