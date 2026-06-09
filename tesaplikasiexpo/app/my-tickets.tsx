import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { orderService } from '../services/orderService';

export default function MyTicketsScreen() {
    const [tickets, setTickets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        try {
            setLoading(true);
            const data = await orderService.getMyTickets();
            setTickets(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#1E88E5" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Tiket Saya</Text>
                <TouchableOpacity onPress={fetchTickets}>
                    <MaterialCommunityIcons name="refresh" size={24} color="#1E88E5" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {tickets.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <MaterialCommunityIcons name="ticket-outline" size={80} color="#DDD" />
                        <Text style={styles.emptyText}>Belum ada tiket yang dibeli.</Text>
                        <TouchableOpacity style={styles.browseBtn} onPress={() => router.push('/(tabs)')}>
                            <Text style={styles.browseBtnText}>Cari Konser</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    tickets.map((order) => (
                        <View
                            key={order.id}
                            style={[styles.ticketCard, order.is_checked_in && styles.cardUsed]}
                        >
                            {/* Status Badge */}
                            <View style={styles.cardHeader}>
                                <View style={[
                                    styles.statusBadge,
                                    order.is_checked_in ? styles.badgeUsed : styles.badgeActive
                                ]}>
                                    <Text style={[
                                        styles.statusText,
                                        order.is_checked_in ? styles.textUsed : styles.textActive
                                    ]}>
                                        {order.is_checked_in ? 'SUDAH TERPAKAI' : 'TIKET AKTIF'}
                                    </Text>
                                </View>
                                <Text style={styles.orderDate}>
                                    {new Date(order.created_at).toLocaleDateString('id-ID')}
                                </Text>
                            </View>

                            {/* Event Info */}
                            <View style={styles.cardBody}>
                                <Image source={{ uri: order.events?.image_url }} style={styles.eventImage} />
                                <View style={styles.eventDetails}>
                                    <Text style={styles.eventTitle} numberOfLines={1}>{order.events?.title}</Text>
                                    <View style={styles.infoRow}>
                                        <MaterialCommunityIcons name="calendar" size={14} color="#666" />
                                        <Text style={styles.infoText}>{order.events?.date}</Text>
                                    </View>
                                    <View style={styles.infoRow}>
                                        <MaterialCommunityIcons name="map-marker" size={14} color="#666" />
                                        <Text style={styles.infoText}>{order.events?.location}</Text>
                                    </View>
                                </View>
                            </View>

                            {/* QR Section */}
                            <View style={styles.barcodeContainer}>
                                {!order.is_checked_in ? (
                                    <>
                                        <Image
                                            source={{ uri: `https://chart.googleapis.com/chart?chs=300x300&cht=qr&chl=https://tikara.id/verify/${order.id}&choe=UTF-8` }}
                                            style={styles.qrCode}
                                        />
                                        <Text style={styles.barcodeText}>TUNJUKKAN QR SAAT MASUK</Text>
                                    </>
                                ) : (
                                    <View style={styles.usedContainer}>
                                        <MaterialCommunityIcons name="check-decagram" size={60} color="#CCC" />
                                        <Text style={styles.usedLabelText}>TERVERIFIKASI</Text>
                                        <Text style={styles.checkInTime}>
                                            Masuk pada: {new Date(order.checked_in_at).toLocaleTimeString()}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    ))
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#FFF', elevation: 2 },
    headerTitle: { fontSize: 18, fontWeight: 'bold' },
    backButton: { padding: 5 },
    scrollContent: { padding: 20 },
    ticketCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 20, marginBottom: 20, elevation: 3 },
    cardUsed: { opacity: 0.7, backgroundColor: '#FAFAFA' },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
    badgeActive: { backgroundColor: '#E3F2FD' },
    badgeUsed: { backgroundColor: '#F5F5F5' },
    statusText: { fontSize: 10, fontWeight: 'bold' },
    textActive: { color: '#1E88E5' },
    textUsed: { color: '#999' },
    orderDate: { fontSize: 11, color: '#999' },
    cardBody: { flexDirection: 'row', gap: 15, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
    eventImage: { width: 65, height: 65, borderRadius: 12 },
    eventDetails: { flex: 1, justifyContent: 'center' },
    eventTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 6 },
    infoRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 3 },
    infoText: { fontSize: 12, color: '#666' },
    barcodeContainer: { marginTop: 20, alignItems: 'center', padding: 10 },
    qrCode: { width: 160, height: 160 },
    barcodeText: { fontSize: 11, fontWeight: 'bold', color: '#333', marginTop: 10, letterSpacing: 1 },
    usedContainer: { alignItems: 'center', paddingVertical: 20 },
    usedLabelText: { fontSize: 16, fontWeight: 'bold', color: '#CCC', marginTop: 10 },
    checkInTime: { fontSize: 10, color: '#BBB', marginTop: 5 },
    emptyContainer: { alignItems: 'center', marginTop: 100 },
    emptyText: { color: '#999', marginTop: 15, fontSize: 15 },
    browseBtn: { marginTop: 25, backgroundColor: '#1E88E5', paddingHorizontal: 30, paddingVertical: 12, borderRadius: 12 },
    browseBtnText: { color: '#FFF', fontWeight: 'bold' }
});