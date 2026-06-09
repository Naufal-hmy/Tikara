import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { eventService } from '../services/eventService';

const { width } = Dimensions.get('window');

export default function EventDetailScreen() {
    const { id } = useLocalSearchParams();
    const [event, setEvent] = useState<any>(null);
    const [isBookmarked, setIsBookmarked] = useState(false);

    useEffect(() => {
        if (id) {
            eventService.getEventById(id as string).then(setEvent);
            // Cek bookmark status
            eventService.getBookmarkedEventIds().then(ids => {
                setIsBookmarked(ids.has(Number(id)));
            });
        }
    }, [id]);

    if (!event) return <View style={styles.container}><Text style={{marginTop: 50, textAlign: 'center'}}>Loading...</Text></View>;

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

                {/* Image Header Section */}
                <View style={styles.imageContainer}>
                    <Image
                        source={{ uri: event.image_url || 'https://picsum.photos/600/400?random=50' }}
                        style={styles.headerImage}
                    />

                    {/* Floating Buttons */}
                    <SafeAreaView style={styles.headerButtons} edges={['top']}>
                        <TouchableOpacity style={styles.circleBtn} onPress={() => router.back()}>
                            <MaterialCommunityIcons name="chevron-left" size={28} color="#1E88E5" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.circleBtn} onPress={async () => {
                            const result = await eventService.toggleBookmark(Number(id));
                            setIsBookmarked(result);
                        }}>
                            <MaterialCommunityIcons
                                name={isBookmarked ? "bookmark" : "bookmark-outline"}
                                size={24}
                                color="#1E88E5"
                            />
                        </TouchableOpacity>
                    </SafeAreaView>
                </View>

                {/* Content Section */}
                <View style={styles.contentWrapper}>
                    <Text style={styles.eventTitle}>{event.title}</Text>
                    <Text style={styles.createdBy}>Dibuat oleh, <Text style={{ color: '#1E88E5' }}>Tikara Partner</Text></Text>

                    {/* Info Rows */}
                    <View style={styles.infoSection}>
                        <View style={styles.infoRow}>
                            <MaterialCommunityIcons name="map-marker" size={20} color="#E53935" />
                            <Text style={styles.infoText}>
                                {event.location}
                            </Text>
                        </View>

                        <View style={styles.infoRow}>
                            <MaterialCommunityIcons name="calendar-month" size={20} color="#E53935" />
                            <Text style={styles.infoText}>{event.date}</Text>
                        </View>

                        <View style={styles.infoRow}>
                            <MaterialCommunityIcons name="ticket-confirmation" size={20} color="#E53935" />
                            <Text style={styles.infoText}>Harga tiket mulai dari IDR {event.price?.toLocaleString('id-ID')}</Text>
                        </View>
                    </View>

                    <Text style={styles.warningText}>Tiket tersedia, beli sebelum kehabisan</Text>

                    {/* Main Action Button */}
                    <TouchableOpacity
                        style={styles.buyBtn}
                        onPress={() => router.push({ pathname: '/buy-ticket', params: { id: event.id, price: event.price } })}
                    >
                        <Text style={styles.buyBtnText}>Beli Tiket Sekarang</Text>
                    </TouchableOpacity>

                    {/* Pricing Table Section */}
                    <View style={styles.tableCard}>
                        <Text style={styles.tableTitle}>Kategori dan Harga</Text>

                        <View style={styles.tableHeader}>
                            <Text style={styles.columnLabel}>Kategori</Text>
                            <Text style={styles.columnLabel}>Harga</Text>
                        </View>

                        {event.price ? (
                            <>
                                <PriceRow label="Silver" price={`IDR ${event.price.toLocaleString('id-ID')}`} />
                                <PriceRow label="Gold" price={`IDR ${(event.price + 50000).toLocaleString('id-ID')}`} />
                                <PriceRow label="Platinum" price={`IDR ${(event.price + 150000).toLocaleString('id-ID')}`} isLast={true} />
                            </>
                        ) : (
                            <Text style={{textAlign: 'center', padding: 15, color: '#666'}}>Kategori tidak tersedia saat ini.</Text>
                        )}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

// --- Komponen Baris Harga ---
const PriceRow = ({ label, price, isLast }: { label: string, price: string, isLast?: boolean }) => (
    <View style={[styles.priceRow, isLast && { borderBottomWidth: 0 }]}>
        <Text style={styles.priceLabel}>{label}</Text>
        <Text style={styles.priceValue}>{price}</Text>
    </View>
);

// --- Styles ---
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    imageContainer: { width: width, height: 300, position: 'relative' },
    headerImage: { width: '100%', height: '100%', backgroundColor: '#EEE' },
    headerButtons: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 10
    },
    circleBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4
    },
    contentWrapper: { padding: 20, marginTop: -20, backgroundColor: '#FFF', borderTopLeftRadius: 25, borderTopRightRadius: 25 },
    eventTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
    createdBy: { fontSize: 13, color: '#666', marginTop: 5, marginBottom: 20 },

    infoSection: { gap: 15, marginBottom: 20 },
    infoRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
    infoText: { flex: 1, fontSize: 13, color: '#666', lineHeight: 18 },

    warningText: { fontSize: 12, color: '#333', marginBottom: 15 },
    buyBtn: { backgroundColor: '#1E88E5', height: 50, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 30 },
    buyBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },

    // Table Styles
    tableCard: {
        backgroundColor: '#F8FAFC',
        borderRadius: 15,
        padding: 15,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 5
    },
    tableTitle: { fontSize: 15, fontWeight: 'bold', color: '#333', marginBottom: 15 },
    tableHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#DDD'
    },
    columnLabel: { fontSize: 13, fontWeight: 'bold', color: '#333' },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#EEE'
    },
    priceLabel: { fontSize: 13, color: '#333', fontWeight: '500' },
    priceValue: { fontSize: 13, color: '#333', fontWeight: '500' }
});