import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import QRCode from 'react-native-qrcode-svg';
import { orderService } from '../services/orderService';
import { authService } from '../services/authService';

export default function TicketDetailScreen() {
    const { id } = useLocalSearchParams();
    const [ticket, setTicket] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);

    useEffect(() => {
        if (id) {
            orderService.getMyTickets().then(tickets => {
                const found = tickets.find(t => t.id === id);
                setTicket(found);
            });
            authService.getCurrentProfile().then(setProfile);
        }
    }, [id]);

    if (!ticket) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#1E88E5" />
            </SafeAreaView>
        );
    }

    const { events } = ticket;

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <MaterialCommunityIcons name="chevron-left" size={28} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Tiket saya</Text>
                <View style={{ width: 28 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20 }}>
                {/* Event Image Banner */}
                <Image
                    source={{ uri: events.image_url || 'https://picsum.photos/600/300' }}
                    style={styles.bannerImage}
                />

                <Text style={styles.eventTitle}>{events.title}</Text>

                <View style={styles.infoGrid}>
                    <View style={styles.infoCol}>
                        <Text style={styles.label}>Nama</Text>
                        <Text style={styles.value}>{profile?.full_name || 'User'}</Text>
                    </View>
                    <View style={styles.infoCol}>
                        <Text style={styles.label}>Jumlah Tiket</Text>
                        <Text style={styles.value}>{ticket.quantity} Tiket</Text>
                    </View>
                </View>

                <View style={styles.infoGrid}>
                    <View style={styles.infoCol}>
                        <Text style={styles.label}>Waktu</Text>
                        <Text style={styles.value}>{events.time || '-'}</Text>
                    </View>
                    <View style={styles.infoCol}>
                        <Text style={styles.label}>Tanggal</Text>
                        <Text style={styles.value}>{events.date}</Text>
                    </View>
                </View>

                <View style={styles.singleRow}>
                    <Text style={styles.label}>Lokasi</Text>
                    <Text style={styles.value}>{events.location}</Text>
                </View>

                {/* Perforated Divider */}
                <View style={styles.dividerWrapper}>
                    <View style={styles.circleLeft} />
                    <View style={styles.dashedLine} />
                    <View style={styles.circleRight} />
                </View>

                {/* QR Section */}
                <View style={styles.qrSection}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.qrDesc}>Pindai kode QR ini atau tunjukkan tiket ini saat konser.</Text>
                        <Text style={styles.qrOrderId}>Order ID: {ticket.id.substring(0, 8).toUpperCase()}</Text>
                    </View>
                    <View style={styles.qrCodeWrapper}>
                        <QRCode
                            value={ticket.ticket_code || ticket.id}
                            size={90}
                            backgroundColor="white"
                            color="black"
                        />
                    </View>
                </View>

                {/* Download Button */}
                <TouchableOpacity style={styles.downloadBtn}>
                    <Text style={styles.downloadText}>Download Tiket</Text>
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15, paddingVertical: 10 },
    backBtn: { padding: 5 },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },

    bannerImage: { width: '100%', height: 200, borderRadius: 15, marginBottom: 20 },
    eventTitle: { fontSize: 20, fontWeight: 'bold', color: '#1E3A5F', marginBottom: 20 },

    infoGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
    infoCol: { flex: 1 },
    label: { fontSize: 13, color: '#666', marginBottom: 4 },
    value: { fontSize: 15, fontWeight: 'bold', color: '#333' },
    singleRow: { marginBottom: 20 },

    dividerWrapper: { flexDirection: 'row', alignItems: 'center', marginVertical: 20, marginHorizontal: -20 },
    circleLeft: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#F8F9FA', marginLeft: -10 },
    dashedLine: { flex: 1, height: 1, borderWidth: 1, borderColor: '#EEE', borderStyle: 'dashed' },
    circleRight: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#F8F9FA', marginRight: -10 },

    qrSection: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30, padding: 15, backgroundColor: '#F8FAFC', borderRadius: 15 },
    qrDesc: { fontSize: 13, color: '#666', lineHeight: 20, paddingRight: 10 },
    qrOrderId: { fontSize: 11, color: '#999', marginTop: 15, fontFamily: 'monospace' },
    qrCodeWrapper: { padding: 10, backgroundColor: '#FFF', borderRadius: 10, elevation: 2 },

    downloadBtn: { backgroundColor: '#1E88E5', height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
    downloadText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' }
});
