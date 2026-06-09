import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { orderService } from '../services/orderService';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function NotificationsScreen() {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [readIds, setReadIds] = useState<Set<number>>(new Set());

    useEffect(() => {
        loadNotifications();
        loadReadStatus();
    }, []);

    const loadReadStatus = async () => {
        try {
            const stored = await AsyncStorage.getItem('notif_read_ids');
            if (stored) {
                setReadIds(new Set(JSON.parse(stored)));
            }
        } catch (e) {}
    };

    const saveReadStatus = async (ids: Set<number>) => {
        try {
            await AsyncStorage.setItem('notif_read_ids', JSON.stringify([...ids]));
        } catch (e) {}
    };

    const loadNotifications = async () => {
        const baseNotifs = [
            { id: 1, type: 'system', title: 'Akun anda berhasil di buat!', message: 'Pembuatan akun Anda berhasil, Anda sekarang dapat menggunakan layanan kami.', date: 'Pendaftaran' },
        ];

        try {
            const tickets = await orderService.getMyTickets();
            const ticketNotifs = tickets.map((t, index) => {
                if (t.events) {
                    return {
                        id: 100 + index,
                        type: 'event',
                        title: 'Acara Anda Semakin Dekat!',
                        message: `Jangan lupa, konser ${t.events.title} akan diselenggarakan pada ${t.events.date}. Siapkan tiket Anda!`,
                        date: 'Hari ini'
                    };
                }
                return null;
            }).filter(Boolean);

            const purchaseNotifs = tickets.map((t, index) => ({
                id: 200 + index,
                type: 'purchase',
                title: 'Pembelian Tiket Berhasil!',
                message: `Tiket ${t.events?.title || 'Event'} (${t.quantity} tiket) berhasil dibeli. Lihat di halaman Tiket Saya.`,
                date: new Date(t.created_at).toLocaleDateString('id-ID')
            }));

            setNotifications([...ticketNotifs, ...purchaseNotifs, ...baseNotifs]);
        } catch (err) {
            setNotifications(baseNotifs);
        }
    };

    const handleRead = async (id: number) => {
        const newSet = new Set(readIds);
        newSet.add(id);
        setReadIds(newSet);
        await saveReadStatus(newSet);

        // Jika semua dibaca, update global status
        if (newSet.size >= notifications.length) {
            await AsyncStorage.setItem('notif_all_read', 'true');
        }
    };

    const handleDelete = async (id: number) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
        // Jika setelah hapus semua dibaca, set all_read
        const remaining = notifications.filter(n => n.id !== id);
        const allRead = remaining.every(n => readIds.has(n.id));
        if (allRead || remaining.length === 0) {
            await AsyncStorage.setItem('notif_all_read', 'true');
        }
    };

    const handleMarkAllRead = async () => {
        const allIds = new Set(notifications.map(n => n.id));
        setReadIds(allIds);
        await saveReadStatus(allIds);
        await AsyncStorage.setItem('notif_all_read', 'true');
    };

    const unreadCount = notifications.filter(n => !readIds.has(n.id)).length;

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <MaterialCommunityIcons name="chevron-left" size={28} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Notifikasi</Text>
                {unreadCount > 0 ? (
                    <TouchableOpacity onPress={handleMarkAllRead}>
                        <Text style={{ color: '#1E88E5', fontSize: 12, fontWeight: 'bold' }}>Baca Semua</Text>
                    </TouchableOpacity>
                ) : (
                    <View style={{ width: 70 }} />
                )}
            </View>

            {unreadCount > 0 && (
                <View style={{ backgroundColor: '#E3F2FD', paddingHorizontal: 20, paddingVertical: 8 }}>
                    <Text style={{ fontSize: 12, color: '#1E88E5', fontWeight: '500' }}>{unreadCount} pesan belum dibaca</Text>
                </View>
            )}

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {notifications.length === 0 && (
                    <View style={{ alignItems: 'center', marginTop: 60 }}>
                        <MaterialCommunityIcons name="bell-off-outline" size={48} color="#CCC" />
                        <Text style={{ color: '#999', marginTop: 10 }}>Tidak ada notifikasi</Text>
                    </View>
                )}

                {notifications.map((notif: any) => {
                    const isRead = readIds.has(notif.id);
                    return (
                        <TouchableOpacity
                            key={notif.id}
                            style={[styles.notifCard, !isRead && styles.notifUnread]}
                            activeOpacity={0.7}
                            onPress={() => handleRead(notif.id)}
                        >
                            {notif.type === 'system' ? (
                                <View style={[styles.avatar, { backgroundColor: '#E3F2FD' }]}>
                                    <MaterialCommunityIcons name="account" size={24} color="#1E88E5" />
                                </View>
                            ) : notif.type === 'purchase' ? (
                                <View style={[styles.avatar, { backgroundColor: '#E8F5E9' }]}>
                                    <MaterialCommunityIcons name="check-circle" size={24} color="#43A047" />
                                </View>
                            ) : (
                                <View style={[styles.avatar, { backgroundColor: '#FFF0F5' }]}>
                                    <MaterialCommunityIcons name="ticket-confirmation" size={24} color="#E53935" />
                                </View>
                            )}

                            <View style={styles.content}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <Text style={[styles.title, !isRead && { color: '#000' }]}>{notif.title}</Text>
                                    <TouchableOpacity
                                        onPress={() => {
                                            Alert.alert("Hapus notifikasi?", "Pesan ini akan dihapus.", [
                                                { text: "Batal", style: "cancel" },
                                                { text: "Hapus", style: "destructive", onPress: () => handleDelete(notif.id) }
                                            ]);
                                        }}
                                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                    >
                                        <MaterialCommunityIcons name="close" size={18} color="#CCC" />
                                    </TouchableOpacity>
                                </View>
                                <Text style={styles.date}>{notif.date}</Text>
                                <Text style={styles.message}>{notif.message}</Text>
                            </View>

                            {!isRead && <View style={styles.unreadDot} />}
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#EEE' },
    backBtn: { padding: 5 },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    scrollContent: { padding: 20, paddingBottom: 40 },

    notifCard: { flexDirection: 'row', marginBottom: 15, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#F0F0F0', position: 'relative' },
    notifUnread: { backgroundColor: '#F0F8FF', marginHorizontal: -10, paddingHorizontal: 10, paddingTop: 10, borderRadius: 10 },
    avatar: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    content: { flex: 1 },
    title: { fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 4, flex: 1, marginRight: 10 },
    date: { fontSize: 12, color: '#999', marginBottom: 8 },
    message: { fontSize: 13, color: '#666', lineHeight: 20 },
    unreadDot: { position: 'absolute', top: 15, left: -2, width: 6, height: 6, borderRadius: 3, backgroundColor: '#1E88E5' },
});
