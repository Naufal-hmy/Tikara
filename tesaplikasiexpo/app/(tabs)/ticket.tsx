import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import React, { useState, useCallback } from 'react';
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

import { orderService } from '../../services/orderService';

export default function TicketScreen() {
    // State untuk switch tab: 'upcoming' atau 'finished'
    const [activeTab, setActiveTab] = useState('upcoming');
    const [tickets, setTickets] = useState<any[]>([]);

    // Refresh tiket setiap kali layar difokuskan (misal setelah checkout)
    useFocusEffect(
        useCallback(() => {
            orderService.getMyTickets().then(setTickets);
        }, [])
    );

    const displayedTickets = tickets.filter(t => activeTab === 'upcoming' ? !t.is_checked_in : t.is_checked_in);

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Tiket</Text>
            </View>

            {/* Tab Switcher */}
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tabButton, activeTab === 'upcoming' && styles.activeTabButton]}
                    onPress={() => setActiveTab('upcoming')}
                >
                    <Text style={[styles.tabText, activeTab === 'upcoming' && styles.activeTabText]}>Akan Datang</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.tabButton, activeTab === 'finished' && styles.activeTabButton]}
                    onPress={() => setActiveTab('finished')}
                >
                    <Text style={[styles.tabText, activeTab === 'finished' && styles.activeTabText]}>Selesai</Text>
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                {activeTab === 'upcoming' ? (
                    // TAMPILAN TIKET AKAN DATANG
                    <View style={styles.listContainer}>
                        {displayedTickets.length === 0 && <Text style={{textAlign: 'center', marginTop: 20}}>Belum ada tiket.</Text>}
                        {displayedTickets.map(order => (
                            <TicketCard
                                key={order.id}
                                id={order.id}
                                title={order.events?.title}
                                date={order.events?.date}
                                location={order.events?.location}
                                type={`${order.quantity} Tiket`}
                                status="Terverifikasi"
                                isUpcoming={true}
                                orderId={order.id.slice(0, 8).toUpperCase()}
                            />
                        ))}
                    </View>
                ) : (
                    // TAMPILAN TIKET SELESAI
                    <View style={styles.listContainer}>
                        {displayedTickets.length === 0 && <Text style={{textAlign: 'center', marginTop: 20}}>Belum ada tiket selesai.</Text>}
                        {displayedTickets.map(order => (
                            <TicketCard
                                key={order.id}
                                id={order.id}
                                title={order.events?.title}
                                date={order.events?.date}
                                location={order.events?.location}
                                type={`${order.quantity} Tiket`}
                                status="Selesai"
                                isUpcoming={false}
                                orderId={order.id.slice(0, 8).toUpperCase()}
                            />
                        ))}
                    </View>
                )}

            </ScrollView>
        </SafeAreaView>
    );
}

// --- KOMPONEN KARTU TIKET ---
const TicketCard = ({ id, title, date, location, type, status, isUpcoming, orderId }: { id: string, title: string, date: string, location: string, type: string, status: string, isUpcoming: boolean, orderId?: string }) => {
    return (
        <TouchableOpacity style={styles.ticketWrapper} onPress={() => router.push({ pathname: '/ticket-detail', params: { id } })}>
            {/* Bagian Atas (Biru Muda) */}
            <View style={styles.ticketHeader}>
                <Text style={styles.ticketTitle}>{title}</Text>
                <View style={styles.ticketDateRow}>
                    <MaterialCommunityIcons name="calendar-month" size={14} color="#333" />
                    <Text style={styles.ticketDateText}>{date}</Text>
                </View>
            </View>

            {/* Bagian Bawah (Putih) */}
            <View style={styles.ticketBody}>
                <Text style={styles.ticketLocation}>{location}</Text>

                <View style={styles.ticketInfoRow}>
                    <Text style={styles.ticketType}>{type}</Text>
                    <View style={[styles.statusBadge, !isUpcoming && styles.statusBadgeFinished]}>
                        <Text style={styles.statusText}>{status}</Text>
                    </View>
                </View>

                {/* Garis Putus-putus */}
                <View style={styles.dashedLine} />

                {isUpcoming ? (
                    // Jika Akan Datang: Muncul QR Code
                    <View style={styles.qrContainer}>
                        <MaterialCommunityIcons name="qrcode-scan" size={100} color="#000" />
                        <Text style={styles.orderId}>Order ID: {orderId || '113350TIX01'}</Text>
                    </View>
                ) : (
                    // Jika Selesai: Hanya Order ID
                    <Text style={styles.orderIdFinished}>Order ID: {orderId || '113350TIX01'}</Text>
                )}
            </View>
        </TouchableOpacity>
    );
};

// --- STYLES ---
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    header: { paddingHorizontal: 20, paddingVertical: 15 },
    headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#000' },

    // Tabs
    tabContainer: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 20 },
    tabButton: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: '#F0F0F0' },
    activeTabButton: { borderBottomColor: '#1E88E5' },
    tabText: { fontSize: 14, color: '#A0A0A0', fontWeight: 'bold' },
    activeTabText: { color: '#1E88E5' },

    scrollContent: { paddingBottom: 30 },
    listContainer: { paddingHorizontal: 20, gap: 20 },

    // Ticket Card
    ticketWrapper: {
        backgroundColor: '#FFFFFF',
        borderRadius: 15,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        overflow: 'hidden',
    },
    ticketHeader: { backgroundColor: '#92C2E0', padding: 15 }, // Warna biru muda sesuai desain
    ticketTitle: { fontSize: 15, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 5 },
    ticketDateRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    ticketDateText: { fontSize: 11, color: '#333', fontWeight: '500' },

    ticketBody: { padding: 15 },
    ticketLocation: { fontSize: 13, color: '#666', marginBottom: 10 },
    ticketInfoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    ticketType: { fontSize: 14, fontWeight: 'bold', color: '#333' },

    statusBadge: { backgroundColor: '#92C2E0', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 6 },
    statusBadgeFinished: { backgroundColor: '#A2D2EE' }, // Sedikit beda warna untuk selesai
    statusText: { fontSize: 10, color: '#FFFFFF', fontWeight: 'bold' },

    dashedLine: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderStyle: 'dashed',
        marginVertical: 10,
        height: 1,
        width: '100%',
    },

    qrContainer: { alignItems: 'center', marginTop: 10 },
    orderId: { fontSize: 10, color: '#666', marginTop: 10 },
    orderIdFinished: { fontSize: 10, color: '#666', textAlign: 'center' }
});