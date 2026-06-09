import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function BuyTicketScreen() {
    const { id, price: p } = useLocalSearchParams();
    // State untuk jumlah tiket
    const [silverCount, setSilverCount] = useState(0);
    const [goldCount, setGoldCount] = useState(0);

    const pricePerTicket = Number(p) || 960000;
    const silverPrice = pricePerTicket;
    const goldPrice = pricePerTicket + 50000;

    const totalTickets = silverCount + goldCount;
    const totalPrice = (silverCount * silverPrice) + (goldCount * goldPrice);

    const handleCheckout = () => {
        if (totalTickets === 0) return;
        router.push({
            pathname: '/checkout',
            params: {
                id,
                silverQty: silverCount,
                goldQty: goldCount,
                silverPrice: silverPrice,
                goldPrice: goldPrice,
                totalPrice: totalPrice,
                totalTickets: totalTickets
            }
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Custom Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <MaterialCommunityIcons name="chevron-left" size={30} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Beli tiket</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Tiket Silver */}
                <TicketCategoryCard
                    title="Silver"
                    priceDesc={`Rp.${silverPrice.toLocaleString('id-ID')} + pajak 10% dan layanan 5%`}
                    price={silverPrice}
                    count={silverCount}
                    onAdd={() => setSilverCount(silverCount + 1)}
                    onRemove={() => silverCount > 0 && setSilverCount(silverCount - 1)}
                />

                {/* Tiket Gold */}
                <TicketCategoryCard
                    title="Gold"
                    priceDesc={`Rp.${goldPrice.toLocaleString('id-ID')} + pajak 10% dan layanan 5%`}
                    price={goldPrice}
                    count={goldCount}
                    onAdd={() => setGoldCount(goldCount + 1)}
                    onRemove={() => goldCount > 0 && setGoldCount(goldCount - 1)}
                />

            </ScrollView>

            {/* Floating Footer - Hanya muncul jika ada tiket yang dipilih */}
            {totalTickets > 0 && (
                <View style={styles.footer}>
                    <View>
                        <Text style={styles.totalPriceText}>IDR {totalPrice.toLocaleString('id-ID')}</Text>
                        <Text style={styles.totalTicketCount}>{totalTickets} Tiket</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.checkoutBtn}
                        onPress={handleCheckout} // Panggil Handle Checkout
                    >
                        <Text style={styles.checkoutBtnText}>Lihat Pesanan</Text>
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
}

// --- KOMPONEN KARTU KATEGORI TIKET ---
const TicketCategoryCard = ({ title, priceDesc, price, count, onAdd, onRemove }: { title: string, priceDesc: string, price: number, count: number, onAdd: () => void, onRemove: () => void }) => (
    <View style={styles.card}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardPriceDesc}>{priceDesc}</Text>

        <View style={styles.benefitRow}>
            <MaterialCommunityIcons name="history" size={18} color="#666" />
            <Text style={styles.benefitText}>Tidak bisa refund</Text>
        </View>
        <View style={styles.benefitRow}>
            <MaterialCommunityIcons name="ticket-percent-outline" size={18} color="#666" />
            <Text style={styles.benefitText}>tiket FLEXI: Berlaku 1 hari sejak tanggal terpilih</Text>
        </View>
        <View style={styles.benefitRow}>
            <MaterialCommunityIcons name="seat-outline" size={18} color="#666" />
            <Text style={styles.benefitText}>Tempat duduk bebas: Bebas menempati kursi kosong di venue</Text>
        </View>

        <TouchableOpacity><Text style={styles.detailLink}>Detail</Text></TouchableOpacity>

        <View style={styles.cardFooter}>
            <Text style={styles.priceTag}>IDR {price.toLocaleString('id-ID')}</Text>

            {count === 0 ? (
                <TouchableOpacity style={styles.addBtn} onPress={onAdd}>
                    <Text style={styles.addBtnText}>Tambah Tiket</Text>
                </TouchableOpacity>
            ) : (
                <View style={styles.counterContainer}>
                    <TouchableOpacity style={styles.counterBtn} onPress={onRemove}>
                        <MaterialCommunityIcons name="minus" size={20} color="#FFF" />
                    </TouchableOpacity>
                    <Text style={styles.counterValue}>{count}</Text>
                    <TouchableOpacity style={styles.counterBtn} onPress={onAdd}>
                        <MaterialCommunityIcons name="plus" size={20} color="#FFF" />
                    </TouchableOpacity>
                </View>
            )}
        </View>
    </View>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    header: { flexDirection: 'row', alignItems: 'center', padding: 20, gap: 15 },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#000' },
    scrollContent: { paddingHorizontal: 20, paddingBottom: 100 },

    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 15,
        padding: 20,
        marginBottom: 20,
        elevation: 4,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 10,
        borderWidth: 1,
        borderColor: '#F0F0F0'
    },
    cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 5 },
    cardPriceDesc: { fontSize: 11, color: '#666', marginBottom: 15 },
    benefitRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
    benefitText: { fontSize: 11, color: '#333', flex: 1 },
    detailLink: { color: '#1E88E5', fontSize: 12, fontWeight: 'bold', marginVertical: 10 },

    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
    priceTag: { fontSize: 14, fontWeight: 'bold', color: '#E53935' },

    addBtn: { backgroundColor: '#1E88E5', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 8 },
    addBtnText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },

    counterContainer: { flexDirection: 'row', alignItems: 'center', gap: 15 },
    counterBtn: { backgroundColor: '#1E88E5', width: 30, height: 30, borderRadius: 6, justifyContent: 'center', alignItems: 'center' },
    counterValue: { fontSize: 14, fontWeight: 'bold', color: '#333' },

    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFFFFF',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#EEE',
        elevation: 20
    },
    totalPriceText: { fontSize: 16, fontWeight: 'bold', color: '#E53935' },
    totalTicketCount: { fontSize: 12, color: '#666' },
    checkoutBtn: { backgroundColor: '#1E88E5', paddingHorizontal: 25, paddingVertical: 12, borderRadius: 10 },
    checkoutBtnText: { color: '#FFF', fontSize: 14, fontWeight: 'bold' }
});