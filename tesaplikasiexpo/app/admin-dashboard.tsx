import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { eventService } from '../services/eventService';
import { authService } from '../services/authService';

export default function AdminDashboardScreen() {
    const [events, setEvents] = useState<any[]>([]);
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            setLoading(true);
            const userData = await authService.getCurrentProfile();
            setProfile(userData);
            
            // Asumsikan admin bisa melihat semua event, organizer hanya eventnya (tapi saat ini kita ambil semua)
            const eventData = await eventService.getAllEvents();
            setEvents(eventData);
        } catch(e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <View style={styles.centered}><ActivityIndicator size="large" color="#1E88E5" /></View>;
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <MaterialCommunityIcons name="chevron-left" size={28} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Dashboard {profile?.role === 'admin' ? 'Admin' : 'Penyelenggara'}</Text>
                <View style={{ width: 28 }} />
            </View>

            <ScrollView contentContainerStyle={{ padding: 20 }}>
                {/* Statistik Cepat */}
                <View style={styles.statsRow}>
                    <View style={styles.statCard}>
                        <MaterialCommunityIcons name="calendar-multiselect" size={30} color="#1E88E5" />
                        <Text style={styles.statNumber}>{events.length}</Text>
                        <Text style={styles.statLabel}>Total Event</Text>
                    </View>
                    <View style={styles.statCard}>
                        <MaterialCommunityIcons name="ticket-confirmation" size={30} color="#E53935" />
                        <Text style={styles.statNumber}>150+</Text>
                        <Text style={styles.statLabel}>Tiket Terjual</Text>
                    </View>
                </View>

                {/* Aksi Cepat */}
                <Text style={styles.sectionTitle}>Aksi Cepat</Text>
                <TouchableOpacity style={styles.actionBtn}>
                    <MaterialCommunityIcons name="plus-circle-outline" size={24} color="#FFF" />
                    <Text style={styles.actionBtnText}>Buat Event Baru</Text>
                </TouchableOpacity>
                
                {profile?.role === 'admin' && (
                    <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#43A047', marginTop: 10 }]}>
                        <MaterialCommunityIcons name="account-group" size={24} color="#FFF" />
                        <Text style={styles.actionBtnText}>Kelola Pengguna</Text>
                    </TouchableOpacity>
                )}

                {/* Event Aktif */}
                <Text style={[styles.sectionTitle, { marginTop: 30 }]}>Event Aktif Anda</Text>
                {events.slice(0, 3).map((e) => (
                    <View key={e.id} style={styles.eventItem}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.eventTitle}>{e.title}</Text>
                            <Text style={styles.eventDate}>{e.date}</Text>
                        </View>
                        <TouchableOpacity style={styles.editBtn}>
                            <MaterialCommunityIcons name="pencil" size={20} color="#1E88E5" />
                        </TouchableOpacity>
                    </View>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15, paddingVertical: 15, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#EEE' },
    backBtn: { padding: 5 },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    
    statsRow: { flexDirection: 'row', gap: 15, marginBottom: 30 },
    statCard: { flex: 1, backgroundColor: '#FFF', padding: 20, borderRadius: 15, alignItems: 'center', elevation: 2 },
    statNumber: { fontSize: 24, fontWeight: 'bold', color: '#333', marginTop: 10 },
    statLabel: { fontSize: 12, color: '#666', marginTop: 5 },

    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 15 },
    actionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#1E88E5', padding: 15, borderRadius: 10, gap: 10 },
    actionBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },

    eventItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 15, borderRadius: 12, marginBottom: 10, elevation: 1 },
    eventTitle: { fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 4 },
    eventDate: { fontSize: 12, color: '#666' },
    editBtn: { padding: 10, backgroundColor: '#F0F8FF', borderRadius: 10 }
});
