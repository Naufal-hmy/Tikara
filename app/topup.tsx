import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';

const TOPUP_METHODS = [
    {
        group: 'Bayar Tunai',
        methods: [
            { id: 'indomaret', name: 'Indomaret', icon: '🏪', color: '#E53935' },
            { id: 'alfamart', name: 'Alfamart', icon: '🏬', color: '#E53935' },
        ]
    },
    {
        group: 'Lewat Bank',
        methods: [
            { id: 'bni', name: 'BNI', icon: '🏦', color: '#F57C00' },
            { id: 'bri', name: 'BRI', icon: '🏦', color: '#1565C0' },
            { id: 'bca', name: 'BCA', icon: '🏦', color: '#1E88E5' },
        ]
    }
];

const TOPUP_AMOUNTS = [50000, 100000, 200000, 500000, 1000000, 2000000];

const INSTRUCTIONS: Record<string, { title: string; steps: string[] }> = {
    indomaret: {
        title: 'Top Up via Indomaret',
        steps: [
            'Kunjungi gerai Indomaret terdekat',
            'Beritahu kasir bahwa Anda ingin melakukan top up Tikara',
            'Sebutkan nomor telepon yang terdaftar di aplikasi Tikara',
            'Masukkan jumlah saldo yang di inginkan',
            'Bayar sesuai nominal + biaya admin',
            'Simpan struk sebagai bukti pembayaran',
        ]
    },
    alfamart: {
        title: 'Top Up via Alfamart',
        steps: [
            'Kunjungi gerai Alfamart terdekat',
            'Beritahu kasir bahwa Anda ingin top up Tikara',
            'Sebutkan nomor HP yang terdaftar pada aplikasi Tikara',
            'Masukkan jumlah saldo yang di inginkan',
            'Bayar sesuai nominal + biaya admin',
            'Simpan struk sebagai bukti pembayaran',
        ]
    },
    bni: {
        title: 'Top up ATM BNI',
        steps: [
            'Masukan kartu ATM dan PIN BNI kamu',
            'Masuk ke Menu Transfer dan Klik BNI Virtual',
            'Masukan Kode perusahaan dan Nomor HP mu yang terdaftar pada aplikasi Tikara',
            'Masukan jumlah saldo yang di isi',
            'Ikuti petunjuk selanjutnya untuk menyelesaikan proses',
        ]
    },
    bri: {
        title: 'Top up ATM BRI',
        steps: [
            'Masukan kartu ATM dan PIN BRI kamu',
            'Masuk ke Menu Transfer dan Klik BRI Virtual',
            'Masukan Kode perusahaan dan Nomor HP mu yang terdaftar pada aplikasi Tikara',
            'Masukan jumlah saldo yang di isi',
            'Ikuti petunjuk selanjutnya untuk menyelesaikan proses',
        ]
    },
    bca: {
        title: 'Top up ATM BCA',
        steps: [
            'Masukan kartu ATM dan PIN BCA kamu',
            'Masuk ke Menu Transfer dan Klik BCA Virtual',
            'Masukan Kode perusahaan dan Nomor HP mu yang terdaftar pada aplikasi Tikara',
            'Masukan jumlah saldo yang di isi',
            'Ikuti petunjuk selanjutnya untuk menyelesaikan proses',
        ]
    },
};

export default function TopUpScreen() {
    const [selectedMethod, setSelectedMethod] = useState('');
    const [selectedAmount, setSelectedAmount] = useState(0);
    const [currentBalance, setCurrentBalance] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        loadBalance();
    }, []);

    const loadBalance = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data: profile } = await supabase.from('profiles').select('balance').eq('id', user.id).single();
        if (profile) setCurrentBalance(profile.balance || 0);
    };

    // Simulasi top up — langsung tambah saldo di Supabase
    const handleSimulateTopUp = async () => {
        if (isProcessing) return;
        if (selectedAmount === 0) {
            Alert.alert("Pilih Nominal", "Silahkan pilih nominal top up terlebih dahulu");
            return;
        }
        setIsProcessing(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { Alert.alert("Error", "Belum login"); setIsProcessing(false); return; }

            const { data: profile, error: fetchErr } = await supabase
                .from('profiles')
                .select('balance')
                .eq('id', user.id)
                .single();

            if (fetchErr) { Alert.alert("Error", fetchErr.message); setIsProcessing(false); return; }

            const newBalance = (profile?.balance || 0) + selectedAmount;

            const { error: updateErr } = await supabase
                .from('profiles')
                .update({ balance: newBalance })
                .eq('id', user.id);

            if (updateErr) {
                Alert.alert("Gagal TopUp", updateErr.message);
            } else {
                setCurrentBalance(newBalance);
                Alert.alert(
                    "Top Up Berhasil! 🎉",
                    `Saldo bertambah Rp ${selectedAmount.toLocaleString('id-ID')}\nSaldo sekarang: Rp ${newBalance.toLocaleString('id-ID')}`,
                    [{ text: "Mantap", onPress: () => router.back() }]
                );
            }
        } catch (err: any) {
            Alert.alert("Error", err.message);
        } finally {
            setIsProcessing(false);
        }
    };

    // STEP 2: Detail instruksi + pilih nominal
    if (selectedMethod) {
        const info = INSTRUCTIONS[selectedMethod];
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => { setSelectedMethod(''); setSelectedAmount(0); }}>
                        <MaterialCommunityIcons name="chevron-left" size={28} color="#000" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{info.title}</Text>
                    <View style={{ width: 28 }} />
                </View>

                <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 180 }}>
                    {/* Method indicator */}
                    <View style={styles.methodIndicator}>
                        <MaterialCommunityIcons name="bank" size={20} color="#1E88E5" />
                        <Text style={{ fontSize: 14, color: '#333', fontWeight: '500', marginLeft: 10 }}>
                            Bayar Lewat {selectedMethod.toUpperCase()}
                        </Text>
                    </View>

                    {/* Steps */}
                    {info.steps.map((step, i) => (
                        <View key={i} style={styles.stepRow}>
                            <View style={styles.stepNumber}>
                                <Text style={styles.stepNumberText}>{i + 1}</Text>
                            </View>
                            <Text style={styles.stepText}>{step}</Text>
                        </View>
                    ))}

                    {/* Pilih Nominal */}
                    <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333', marginTop: 25, marginBottom: 15 }}>
                        Pilih Nominal Top Up
                    </Text>
                    <View style={styles.amountGrid}>
                        {TOPUP_AMOUNTS.map((amount) => (
                            <TouchableOpacity
                                key={amount}
                                style={[
                                    styles.amountCard,
                                    selectedAmount === amount && styles.amountCardActive
                                ]}
                                onPress={() => setSelectedAmount(amount)}
                            >
                                <Text style={[
                                    styles.amountText,
                                    selectedAmount === amount && styles.amountTextActive
                                ]}>
                                    Rp {amount.toLocaleString('id-ID')}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </ScrollView>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.balanceInfo}>Saldo saat ini: Rp {currentBalance.toLocaleString('id-ID')}</Text>
                    {selectedAmount > 0 && (
                        <Text style={{ textAlign: 'center', color: '#333', fontWeight: 'bold', marginBottom: 10, fontSize: 15 }}>
                            Top Up: Rp {selectedAmount.toLocaleString('id-ID')}
                        </Text>
                    )}
                    <TouchableOpacity
                        style={[styles.simulateBtn, (isProcessing || selectedAmount === 0) && { backgroundColor: '#CCC' }]}
                        disabled={isProcessing || selectedAmount === 0}
                        onPress={handleSimulateTopUp}
                    >
                        <Text style={styles.simulateBtnText}>
                            {isProcessing ? 'Memproses...' : 'Simulasi Top Up'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    // STEP 1: Pilih metode
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <MaterialCommunityIcons name="chevron-left" size={28} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Top Up</Text>
                <View style={{ width: 28 }} />
            </View>

            <ScrollView contentContainerStyle={{ padding: 20 }}>
                {/* Saldo Card */}
                <View style={styles.balanceCard}>
                    <Text style={{ fontSize: 13, color: '#666' }}>Saldo Saat Ini</Text>
                    <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#1E88E5', marginTop: 4 }}>
                        Rp {currentBalance.toLocaleString('id-ID')}
                    </Text>
                </View>

                <Text style={styles.sectionTitle}>Metode Top Up</Text>

                {TOPUP_METHODS.map((group) => (
                    <View key={group.group} style={{ marginBottom: 25 }}>
                        <Text style={styles.groupTitle}>{group.group}</Text>
                        <View style={styles.methodsGrid}>
                            {group.methods.map((method) => (
                                <TouchableOpacity
                                    key={method.id}
                                    style={styles.methodCard}
                                    onPress={() => setSelectedMethod(method.id)}
                                >
                                    <View style={[styles.methodIconBox, { backgroundColor: method.color + '15' }]}>
                                        <Text style={{ fontSize: 28 }}>{method.icon}</Text>
                                    </View>
                                    <Text style={styles.methodName}>{method.name}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFF' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },

    balanceCard: { backgroundColor: '#E3F2FD', borderRadius: 15, padding: 20, alignItems: 'center', marginBottom: 25 },

    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 20 },
    groupTitle: { fontSize: 14, fontWeight: 'bold', color: '#666', marginBottom: 12 },

    methodsGrid: { flexDirection: 'row', gap: 15, flexWrap: 'wrap' },
    methodCard: { alignItems: 'center', width: 80 },
    methodIconBox: { width: 65, height: 55, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 6, elevation: 1, backgroundColor: '#F0F7FF' },
    methodName: { fontSize: 12, color: '#333', fontWeight: '500', textAlign: 'center' },

    // Detail page
    methodIndicator: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0F7FF', padding: 15, borderRadius: 12, marginBottom: 25 },

    stepRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 18, gap: 15 },
    stepNumber: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#E3F2FD', justifyContent: 'center', alignItems: 'center', marginTop: 2 },
    stepNumberText: { color: '#1E88E5', fontWeight: 'bold', fontSize: 13 },
    stepText: { flex: 1, fontSize: 14, color: '#333', lineHeight: 22 },

    // Amount selection
    amountGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    amountCard: { width: '47%', padding: 18, backgroundColor: '#F8FAFC', borderRadius: 12, alignItems: 'center', borderWidth: 1.5, borderColor: '#E0E0E0' },
    amountCardActive: { backgroundColor: '#E3F2FD', borderColor: '#1E88E5' },
    amountText: { fontWeight: 'bold', color: '#666', fontSize: 14 },
    amountTextActive: { color: '#1E88E5' },

    footer: { backgroundColor: '#FFF', padding: 20, borderTopWidth: 1, borderTopColor: '#EEE' },
    balanceInfo: { fontSize: 13, color: '#666', textAlign: 'center', marginBottom: 8 },
    simulateBtn: { backgroundColor: '#1E88E5', padding: 16, borderRadius: 12, alignItems: 'center' },
    simulateBtnText: { color: '#FFF', fontSize: 15, fontWeight: 'bold' },
});