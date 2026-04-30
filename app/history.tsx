import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { orderService } from '../services/orderService';

export default function HistoryScreen() {
    const [orders, setOrders] = useState<any[]>([]);

    useFocusEffect(
        useCallback(() => {
            orderService.getMyTickets().then(setOrders);
        }, [])
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <MaterialCommunityIcons name="chevron-left" size={28} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Riwayat</Text>
                <View style={{ width: 28 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {orders.length === 0 && (
                    <View style={{ alignItems: 'center', marginTop: 60 }}>
                        <MaterialCommunityIcons name="history" size={48} color="#CCC" />
                        <Text style={{ color: '#999', marginTop: 10 }}>Belum ada riwayat transaksi.</Text>
                    </View>
                )}

                {orders.map((order) => (
                    <View key={order.id} style={styles.ticketCard}>
                        {/* Header Biru */}
                        <View style={styles.cardHeader}>
                            <Text style={styles.cardTitle} numberOfLines={1}>{order.events?.title || 'Event'}</Text>
                            <View style={styles.cardDateRow}>
                                <MaterialCommunityIcons name="calendar-month" size={14} color="#E3F2FD" />
                                <Text style={styles.cardDateText}>{order.events?.date || '-'}</Text>
                            </View>
                        </View>

                        {/* Body Putih */}
                        <View style={styles.cardBody}>
                            <Text style={styles.locationText}>{order.events?.location || '-'}</Text>

                            <View style={styles.cardInfoRow}>
                                <Text style={styles.ticketType}>Silver</Text>
                                <View style={[styles.statusBadge, order.is_checked_in ? styles.statusSelesai : styles.statusBerhasil]}>
                                    <Text style={styles.statusText}>{order.is_checked_in ? 'Selesai' : 'Berhasil'}</Text>
                                </View>
                            </View>

                            {/* Garis putus-putus */}
                            <View style={styles.dashedLine} />

                            <Text style={styles.orderId}>Order ID: {order.id.slice(0, 10).toUpperCase()}</Text>
                        </View>
                    </View>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#000' },
    scrollContent: { padding: 20, paddingBottom: 40 },

    ticketCard: { backgroundColor: '#FFF', borderRadius: 15, overflow: 'hidden', marginBottom: 20, elevation: 3, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 10, shadowOffset: { width: 0, height: 2 } },

    cardHeader: { backgroundColor: '#92C2E0', padding: 15 },
    cardTitle: { fontSize: 15, fontWeight: 'bold', color: '#FFF', marginBottom: 4 },
    cardDateRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    cardDateText: { fontSize: 11, color: '#E3F2FD', fontWeight: '500' },

    cardBody: { padding: 15 },
    locationText: { fontSize: 13, color: '#666', marginBottom: 12 },

    cardInfoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    ticketType: { fontSize: 14, fontWeight: 'bold', color: '#333' },

    statusBadge: { paddingHorizontal: 14, paddingVertical: 5, borderRadius: 6 },
    statusSelesai: { backgroundColor: '#E8F5E9' },
    statusBerhasil: { backgroundColor: '#E3F2FD' },
    statusText: { fontSize: 11, fontWeight: 'bold', color: '#1E88E5' },

    dashedLine: { borderWidth: 1, borderColor: '#E0E0E0', borderStyle: 'dashed', height: 1, width: '100%', marginVertical: 10 },

    orderId: { fontSize: 11, color: '#999', textAlign: 'center' },
});