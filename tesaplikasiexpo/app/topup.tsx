import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Animated, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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

// Generate nomor virtual account
const generateVA = (method: string) => {
    const prefixes: Record<string, string> = {
        bni: '8808', bri: '7702', bca: '3901',
        indomaret: 'IDM-', alfamart: 'ALF-',
    };
    const prefix = prefixes[method] || '0000';
    const rand = Math.floor(1000000000 + Math.random() * 9000000000).toString();
    return prefix + rand;
};

export default function TopUpScreen() {
    const [selectedMethod, setSelectedMethod] = useState('');
    const [selectedAmount, setSelectedAmount] = useState(0);
    const [currentBalance, setCurrentBalance] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);

    // Payment gateway simulation states
    const [showPaymentGateway, setShowPaymentGateway] = useState(false);
    const [paymentStep, setPaymentStep] = useState<'waiting' | 'processing' | 'success'>('waiting');
    const [vaNumber] = useState(() => generateVA(''));
    const [gatewayVA, setGatewayVA] = useState('');
    const [gatewayTimer, setGatewayTimer] = useState(299);
    const timerRef = useRef<any>(null);

    // Animation
    const successAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        loadBalance();
    }, []);

    // Timer for payment gateway
    useEffect(() => {
        if (showPaymentGateway && paymentStep === 'waiting') {
            setGatewayTimer(299);
            timerRef.current = setInterval(() => {
                setGatewayTimer(prev => {
                    if (prev <= 0) {
                        clearInterval(timerRef.current);
                        Alert.alert("Waktu Habis", "Waktu pembayaran sudah habis.", [
                            { text: "OK", onPress: () => { setShowPaymentGateway(false); setPaymentStep('waiting'); } }
                        ]);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timerRef.current);
    }, [showPaymentGateway, paymentStep]);

    const formatTimer = (s: number) => {
        const min = Math.floor(s / 60);
        const sec = s % 60;
        return `${min < 10 ? '0' : ''}${min}:${sec < 10 ? '0' : ''}${sec}`;
    };

    const loadBalance = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data: profile } = await supabase.from('profiles').select('balance').eq('id', user.id).single();
        if (profile) setCurrentBalance(profile.balance || 0);
    };

    // Open payment gateway
    const openPaymentGateway = () => {
        if (selectedAmount === 0) {
            Alert.alert("Pilih Nominal", "Silahkan pilih nominal top up terlebih dahulu");
            return;
        }
        setGatewayVA(generateVA(selectedMethod));
        setPaymentStep('waiting');
        setShowPaymentGateway(true);
    };

    // Simulasi proses pembayaran
    const handleSimulatePayment = async () => {
        if (isProcessing) return;
        setIsProcessing(true);
        setPaymentStep('processing');
        clearInterval(timerRef.current);

        // Simulasi delay 2 detik seolah memproses
        await new Promise(res => setTimeout(res, 2000));

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
                setPaymentStep('waiting');
            } else {
                setCurrentBalance(newBalance);
                setPaymentStep('success');
                // Animate success
                Animated.spring(successAnim, {
                    toValue: 1, friction: 4, tension: 40, useNativeDriver: true,
                }).start();
            }
        } catch (err: any) {
            Alert.alert("Error", err.message);
            setPaymentStep('waiting');
        } finally {
            setIsProcessing(false);
        }
    };

    const getMethodLabel = (id: string) => {
        const labels: Record<string, string> = {
            indomaret: 'Indomaret', alfamart: 'Alfamart',
            bni: 'Bank BNI', bri: 'Bank BRI', bca: 'Bank BCA',
        };
        return labels[id] || id;
    };

    const isBank = ['bni', 'bri', 'bca'].includes(selectedMethod);

    // ========== PAYMENT GATEWAY MODAL ==========
    const renderPaymentGateway = () => (
        <Modal visible={showPaymentGateway} animationType="slide" onRequestClose={() => {
            if (paymentStep !== 'processing') {
                clearInterval(timerRef.current);
                setShowPaymentGateway(false);
                setPaymentStep('waiting');
            }
        }}>
            <SafeAreaView style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    {paymentStep !== 'success' && (
                        <TouchableOpacity onPress={() => {
                            clearInterval(timerRef.current);
                            setShowPaymentGateway(false);
                            setPaymentStep('waiting');
                        }}>
                            <MaterialCommunityIcons name="chevron-left" size={28} color="#000" />
                        </TouchableOpacity>
                    )}
                    {paymentStep !== 'success' && <Text style={styles.headerTitle}>Payment Gateway</Text>}
                    <View style={{ width: 28 }} />
                </View>

                {paymentStep === 'waiting' && (
                    <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 140 }}>
                        {/* Timer */}
                        <View style={styles.gwTimerBox}>
                            <Text style={{ fontSize: 12, color: '#999' }}>Selesaikan pembayaran dalam</Text>
                            <Text style={styles.gwTimerText}>{formatTimer(gatewayTimer)}</Text>
                        </View>

                        {/* Amount */}
                        <View style={styles.gwAmountBox}>
                            <Text style={{ fontSize: 13, color: '#666' }}>Total Pembayaran</Text>
                            <Text style={styles.gwAmountText}>Rp {selectedAmount.toLocaleString('id-ID')}</Text>
                        </View>

                        {/* Payment Info */}
                        <View style={styles.gwInfoCard}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 }}>
                                <MaterialCommunityIcons name={isBank ? 'bank' : 'store'} size={24} color="#1E88E5" />
                                <Text style={{ fontSize: 15, fontWeight: 'bold', color: '#333', marginLeft: 10 }}>
                                    {getMethodLabel(selectedMethod)}
                                </Text>
                            </View>

                            <Text style={{ fontSize: 12, color: '#999', marginBottom: 6 }}>
                                {isBank ? 'Nomor Virtual Account' : 'Kode Pembayaran'}
                            </Text>
                            <View style={styles.gwVARow}>
                                <Text style={styles.gwVAText}>{gatewayVA}</Text>
                                <TouchableOpacity style={styles.gwCopyBtn}>
                                    <MaterialCommunityIcons name="content-copy" size={18} color="#1E88E5" />
                                    <Text style={{ color: '#1E88E5', fontSize: 12, fontWeight: 'bold', marginLeft: 4 }}>Salin</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.gwDivider} />

                            <View style={styles.gwDetailRow}>
                                <Text style={styles.gwDetailLabel}>Metode</Text>
                                <Text style={styles.gwDetailValue}>{getMethodLabel(selectedMethod)}</Text>
                            </View>
                            <View style={styles.gwDetailRow}>
                                <Text style={styles.gwDetailLabel}>Nominal Top Up</Text>
                                <Text style={styles.gwDetailValue}>Rp {selectedAmount.toLocaleString('id-ID')}</Text>
                            </View>
                            <View style={styles.gwDetailRow}>
                                <Text style={styles.gwDetailLabel}>Biaya Admin</Text>
                                <Text style={styles.gwDetailValue}>Rp 0</Text>
                            </View>
                        </View>

                        {/* Petunjuk */}
                        <View style={styles.gwHintBox}>
                            <MaterialCommunityIcons name="information-outline" size={18} color="#1E88E5" />
                            <Text style={{ flex: 1, fontSize: 12, color: '#666', marginLeft: 8, lineHeight: 18 }}>
                                {isBank
                                    ? 'Transfer ke nomor Virtual Account di atas melalui ATM, Mobile Banking, atau Internet Banking.'
                                    : 'Tunjukkan kode pembayaran ke kasir dan bayar sesuai nominal.'}
                            </Text>
                        </View>
                    </ScrollView>
                )}

                {paymentStep === 'processing' && (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 }}>
                        <ActivityIndicator size="large" color="#1E88E5" />
                        <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333', marginTop: 20 }}>Memproses Pembayaran...</Text>
                        <Text style={{ fontSize: 13, color: '#999', marginTop: 8, textAlign: 'center' }}>Mohon tunggu, sedang memverifikasi pembayaran Anda</Text>
                    </View>
                )}

                {paymentStep === 'success' && (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 }}>
                        <Animated.View style={{
                            transform: [{ scale: successAnim }],
                            backgroundColor: '#E8F5E9', width: 100, height: 100, borderRadius: 50,
                            justifyContent: 'center', alignItems: 'center', marginBottom: 25,
                        }}>
                            <MaterialCommunityIcons name="check-circle" size={60} color="#4CAF50" />
                        </Animated.View>
                        <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#333' }}>Pembayaran Berhasil! 🎉</Text>
                        <Text style={{ fontSize: 14, color: '#666', marginTop: 10, textAlign: 'center' }}>
                            Saldo bertambah Rp {selectedAmount.toLocaleString('id-ID')}
                        </Text>
                        <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#1E88E5', marginTop: 8 }}>
                            Saldo: Rp {currentBalance.toLocaleString('id-ID')}
                        </Text>
                        <TouchableOpacity style={[styles.simulateBtn, { marginTop: 30, paddingHorizontal: 40 }]}
                            onPress={() => { setShowPaymentGateway(false); setPaymentStep('waiting'); router.back(); }}>
                            <Text style={styles.simulateBtnText}>Kembali</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Footer — tombol bayar */}
                {paymentStep === 'waiting' && (
                    <View style={styles.footer}>
                        <TouchableOpacity style={styles.simulateBtn} onPress={handleSimulatePayment}>
                            <Text style={styles.simulateBtnText}>Simulasi Bayar Sekarang</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </SafeAreaView>
        </Modal>
    );

    // STEP 2: Detail instruksi + pilih nominal
    if (selectedMethod) {
        const info = INSTRUCTIONS[selectedMethod];
        return (
            <SafeAreaView style={styles.container}>
                {renderPaymentGateway()}
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
                        style={[styles.simulateBtn, selectedAmount === 0 && { backgroundColor: '#CCC' }]}
                        disabled={selectedAmount === 0}
                        onPress={openPaymentGateway}
                    >
                        <Text style={styles.simulateBtnText}>Lanjutkan Pembayaran</Text>
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

    // Payment Gateway styles
    gwTimerBox: { alignItems: 'center', marginBottom: 20, paddingVertical: 15, backgroundColor: '#FFF8E1', borderRadius: 12 },
    gwTimerText: { fontSize: 28, fontWeight: 'bold', color: '#E53935', marginTop: 5 },
    gwAmountBox: { alignItems: 'center', marginBottom: 20, padding: 20, backgroundColor: '#E3F2FD', borderRadius: 12 },
    gwAmountText: { fontSize: 24, fontWeight: 'bold', color: '#1E88E5', marginTop: 5 },
    gwInfoCard: { backgroundColor: '#FFF', borderRadius: 15, padding: 20, elevation: 2, borderWidth: 1, borderColor: '#F0F0F0', marginBottom: 15 },
    gwVARow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F8FAFC', padding: 15, borderRadius: 10, marginBottom: 15 },
    gwVAText: { fontSize: 18, fontWeight: 'bold', color: '#333', letterSpacing: 1 },
    gwCopyBtn: { flexDirection: 'row', alignItems: 'center' },
    gwDivider: { height: 1, backgroundColor: '#F0F0F0', marginBottom: 15 },
    gwDetailRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    gwDetailLabel: { fontSize: 13, color: '#999' },
    gwDetailValue: { fontSize: 13, color: '#333', fontWeight: '500' },
    gwHintBox: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#F0F7FF', padding: 15, borderRadius: 12 },
});