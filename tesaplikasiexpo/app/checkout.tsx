import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState, useEffect, useRef } from 'react';
import { ActivityIndicator, Alert, Animated, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import QRCode from 'react-native-qrcode-svg';
import { supabase } from '../lib/supabase';
import { eventService } from '../services/eventService';
import { authService } from '../services/authService';
import { orderService } from '../services/orderService';

export default function CheckoutScreen() {
    const params = useLocalSearchParams();
    // Step: 1=Detail Buy Ticket, 2=Detail Payment, 3=Payment Method (full list), 4=Payment QRIS
    const [step, setStep] = useState(1);
    const [selectedMethod, setSelectedMethod] = useState('');
    const [event, setEvent] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [userEmail, setUserEmail] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [loadingError, setLoadingError] = useState('');
    const [timer, setTimer] = useState(299); // 4:59 in seconds

    // Payment gateway simulation states
    const [showEwalletModal, setShowEwalletModal] = useState(false);
    const [ewalletStep, setEwalletStep] = useState<'connecting' | 'confirm' | 'processing' | 'success'>('connecting');
    const successScale = useRef(new Animated.Value(0)).current;

    const eventId = params.id;
    const sQty = Number(params.silverQty) || 0;
    const gQty = Number(params.goldQty) || 0;
    const silverPriceVal = Number(params.silverPrice) || 0;
    const goldPriceVal = Number(params.goldPrice) || 0;
    const finalPrice = Number(params.totalPrice) || 0;
    const finalTickets = Number(params.totalTickets) || 0;



    const pajak = finalPrice * 0.10;
    const biayaLayanan = finalPrice * 0.05;
    const grandTotal = finalPrice + pajak + biayaLayanan;

    const orderId = `${Date.now().toString().slice(-10)}TIX`;

    // Timer countdown saat masuk step 2+
    const timerRef = useRef<any>(null);
    useEffect(() => {
        if (step >= 2) {
            timerRef.current = setInterval(() => {
                setTimer(prev => {
                    if (prev <= 0) {
                        clearInterval(timerRef.current);
                        Alert.alert("Waktu Habis", "Waktu pembayaran sudah habis.", [
                            { text: "OK", onPress: () => router.back() }
                        ]);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timerRef.current);
    }, [step]);

    const formatTimer = (s: number) => {
        const min = Math.floor(s / 60);
        const sec = s % 60;
        return `00 : 0${min} : ${sec < 10 ? '0' : ''}${sec}`;
    };

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoadingError('');

            // Load user email from auth
            const { data: { user } } = await supabase.auth.getUser();
            if (user?.email) {
                setUserEmail(user.email);
            }

            // Load profile
            const profileData = await authService.getCurrentProfile();
            if (!profileData) {
                setLoadingError('Gagal memuat profil. Pastikan Anda sudah login.');
                return;
            }
            setProfile(profileData);

            // eventId bisa berupa string atau array (expo-router quirk)
            const eid = Array.isArray(eventId) ? eventId[0] : eventId;

            if (eid) {
                const eventData = await eventService.getEventById(eid);
                if (eventData) {
                    setEvent(eventData);
                } else {
                    setLoadingError('Event tidak ditemukan (ID: ' + eid + ')');
                }
            } else {
                setLoadingError('ID event tidak tersedia');
            }
        } catch (err: any) {
            console.error('Checkout loadData error:', err);
            setLoadingError(err.message || 'Gagal memuat data');
        }
    };

    const saldoCukup = (profile?.balance || 0) >= grandTotal;

    const handleConfirmPayment = async () => {
        if (isProcessing) return;
        setIsProcessing(true);

        try {
            const result = await orderService.purchaseTicket(Number(eventId), finalTickets, grandTotal);
            if (result.success) {
                Alert.alert("Pembayaran Berhasil! 🎉", result.message || "Tiket Anda sudah aktif.", [
                    { text: "Lihat Tiket", onPress: () => router.replace('/(tabs)/ticket') }
                ]);
            } else {
                Alert.alert("Gagal", result.message);
            }
        } catch (error: any) {
            Alert.alert("Gagal", error.message || "Terjadi kesalahan.");
        } finally {
            setIsProcessing(false);
        }
    };

    // E-wallet simulation handler
    const ewalletLabels: Record<string, string> = { ovo: 'OVO', gopay: 'GoPay', shopeepay: 'ShopeePay' };

    const openEwalletSimulation = (method: string) => {
        setSelectedMethod(method);
        setEwalletStep('connecting');
        setShowEwalletModal(true);
        successScale.setValue(0);
        // Simulate connecting delay
        setTimeout(() => setEwalletStep('confirm'), 2000);
    };

    const handleEwalletPay = async () => {
        setEwalletStep('processing');
        await new Promise(res => setTimeout(res, 2500));
        try {
            const result = await orderService.purchaseTicket(Number(eventId), finalTickets, grandTotal);
            if (result.success) {
                setEwalletStep('success');
                Animated.spring(successScale, { toValue: 1, friction: 4, tension: 40, useNativeDriver: true }).start();
            } else {
                Alert.alert("Gagal", result.message);
                setShowEwalletModal(false);
            }
        } catch (error: any) {
            Alert.alert("Gagal", error.message || "Terjadi kesalahan.");
            setShowEwalletModal(false);
        }
    };

    // E-wallet modal renderer
    const renderEwalletModal = () => (
        <Modal visible={showEwalletModal} animationType="slide" onRequestClose={() => {
            if (ewalletStep !== 'processing') { setShowEwalletModal(false); }
        }}>
            <SafeAreaView style={styles.container}>
                {ewalletStep === 'connecting' && (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 }}>
                        <ActivityIndicator size="large" color="#1E88E5" />
                        <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333', marginTop: 20 }}>
                            Menghubungkan ke {ewalletLabels[selectedMethod] || selectedMethod}...
                        </Text>
                        <Text style={{ fontSize: 13, color: '#999', marginTop: 8 }}>Mohon tunggu sebentar</Text>
                    </View>
                )}

                {ewalletStep === 'confirm' && (
                    <>
                        <View style={styles.header}>
                            <TouchableOpacity onPress={() => setShowEwalletModal(false)}>
                                <MaterialCommunityIcons name="chevron-left" size={28} color="#000" />
                            </TouchableOpacity>
                            <Text style={styles.headerTitle}>{ewalletLabels[selectedMethod] || 'E-Wallet'}</Text>
                            <View style={{ width: 28 }} />
                        </View>
                        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 140 }}>
                            <View style={{ alignItems: 'center', padding: 20, backgroundColor: '#E3F2FD', borderRadius: 12, marginBottom: 20 }}>
                                <Text style={{ fontSize: 13, color: '#666' }}>Total Pembayaran</Text>
                                <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#1E88E5', marginTop: 5 }}>
                                    IDR {grandTotal.toLocaleString('id-ID')}
                                </Text>
                            </View>
                            <View style={{ backgroundColor: '#FFF', borderRadius: 15, padding: 20, elevation: 2, borderWidth: 1, borderColor: '#F0F0F0' }}>
                                <Text style={{ fontWeight: 'bold', color: '#333', fontSize: 15, marginBottom: 15 }}>Detail Pembayaran</Text>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                                    <Text style={{ color: '#999', fontSize: 13 }}>Event</Text>
                                    <Text style={{ color: '#333', fontSize: 13, fontWeight: '500' }}>{event?.title}</Text>
                                </View>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                                    <Text style={{ color: '#999', fontSize: 13 }}>Jumlah Tiket</Text>
                                    <Text style={{ color: '#333', fontSize: 13, fontWeight: '500' }}>{finalTickets} tiket</Text>
                                </View>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                                    <Text style={{ color: '#999', fontSize: 13 }}>Subtotal</Text>
                                    <Text style={{ color: '#333', fontSize: 13, fontWeight: '500' }}>IDR {finalPrice.toLocaleString('id-ID')}</Text>
                                </View>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                                    <Text style={{ color: '#999', fontSize: 13 }}>Pajak (10%)</Text>
                                    <Text style={{ color: '#333', fontSize: 13, fontWeight: '500' }}>IDR {pajak.toLocaleString('id-ID')}</Text>
                                </View>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                                    <Text style={{ color: '#999', fontSize: 13 }}>Biaya Layanan (5%)</Text>
                                    <Text style={{ color: '#333', fontSize: 13, fontWeight: '500' }}>IDR {biayaLayanan.toLocaleString('id-ID')}</Text>
                                </View>
                                <View style={{ height: 1, backgroundColor: '#F0F0F0', marginVertical: 10 }} />
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <Text style={{ color: '#333', fontSize: 14, fontWeight: 'bold' }}>Total</Text>
                                    <Text style={{ color: '#1E88E5', fontSize: 14, fontWeight: 'bold' }}>IDR {grandTotal.toLocaleString('id-ID')}</Text>
                                </View>
                            </View>
                        </ScrollView>
                        <View style={styles.footer}>
                            <TouchableOpacity style={styles.mainBtn} onPress={handleEwalletPay}>
                                <Text style={styles.mainBtnText}>Bayar dengan {ewalletLabels[selectedMethod]}</Text>
                            </TouchableOpacity>
                        </View>
                    </>
                )}

                {ewalletStep === 'processing' && (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 }}>
                        <ActivityIndicator size="large" color="#1E88E5" />
                        <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333', marginTop: 20 }}>Memproses Pembayaran...</Text>
                        <Text style={{ fontSize: 13, color: '#999', marginTop: 8, textAlign: 'center' }}>Sedang memverifikasi pembayaran via {ewalletLabels[selectedMethod]}</Text>
                    </View>
                )}

                {ewalletStep === 'success' && (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 }}>
                        <Animated.View style={{
                            transform: [{ scale: successScale }],
                            backgroundColor: '#E8F5E9', width: 100, height: 100, borderRadius: 50,
                            justifyContent: 'center', alignItems: 'center', marginBottom: 25,
                        }}>
                            <MaterialCommunityIcons name="check-circle" size={60} color="#4CAF50" />
                        </Animated.View>
                        <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#333' }}>Pembayaran Berhasil! 🎉</Text>
                        <Text style={{ fontSize: 14, color: '#666', marginTop: 10, textAlign: 'center' }}>Tiket Anda sudah aktif dan dapat dilihat di halaman Tiket</Text>
                        <TouchableOpacity style={[styles.mainBtn, { marginTop: 30, paddingHorizontal: 40 }]}
                            onPress={() => { setShowEwalletModal(false); router.replace('/(tabs)/ticket'); }}>
                            <Text style={styles.mainBtnText}>Lihat Tiket</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </SafeAreaView>
        </Modal>
    );

    // LOADING STATE
    if (!event || !profile) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <MaterialCommunityIcons name="chevron-left" size={28} color="#000" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Beli tiket</Text>
                    <View style={{ width: 28 }} />
                </View>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
                    {loadingError ? (
                        <>
                            <MaterialCommunityIcons name="alert-circle-outline" size={48} color="#E53935" />
                            <Text style={{ textAlign: 'center', color: '#E53935', marginTop: 15 }}>{loadingError}</Text>
                            <TouchableOpacity style={{ marginTop: 20, backgroundColor: '#1E88E5', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 }} onPress={loadData}>
                                <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Coba Lagi</Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <>
                            <ActivityIndicator size="large" color="#1E88E5" />
                            <Text style={{ textAlign: 'center', color: '#666', marginTop: 15 }}>Memuat data pesanan...</Text>
                        </>
                    )}
                </View>
            </SafeAreaView>
        );
    }

    // ============ STEP 1: Detail Buy Ticket (persis PDF) ============
    if (step === 1) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <MaterialCommunityIcons name="chevron-left" size={28} color="#000" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Beli tiket</Text>
                    <View style={{ width: 28 }} />
                </View>
                <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 140 }}>
                    <Text style={styles.sectionTitle}>Pesanan Anda</Text>

                    <View style={styles.card}>
                        {/* Event Info */}
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 }}>
                            <Image source={{ uri: event.image_url }} style={{ width: 55, height: 55, borderRadius: 10 }} />
                            <View style={{ flex: 1, marginLeft: 12 }}>
                                <Text style={{ fontSize: 15, fontWeight: 'bold', color: '#1E3A5F' }}>{event.title}</Text>
                            </View>
                        </View>

                        {/* Masa Berlaku */}
                        <View style={styles.infoRow}>
                            <Text style={styles.labelGrey}>Masa Berlaku</Text>
                            <Text style={styles.valueText}>{event.date}</Text>
                        </View>

                        {/* Tiket Silver */}
                        {sQty > 0 && (
                            <View style={styles.ticketSection}>
                                <Text style={styles.ticketCatTitle}>Silver</Text>
                                <Text style={styles.ticketPrice}>Rp.{silverPriceVal.toLocaleString('id-ID')} + pajak 10% dan layanan 5%</Text>
                                <View style={styles.benefitRow}><MaterialCommunityIcons name="history" size={16} color="#666" /><Text style={styles.benefitText}>Tidak bisa refund</Text></View>
                                <View style={styles.benefitRow}><MaterialCommunityIcons name="ticket-percent-outline" size={16} color="#666" /><Text style={styles.benefitText}>tiket FLEXI: Berlaku 1 hari sejak tanggal terpilih</Text></View>
                                <View style={styles.benefitRow}><MaterialCommunityIcons name="seat-outline" size={16} color="#666" /><Text style={styles.benefitText}>Tempat duduk bebas: Bebas menempati kursi kosong di venue</Text></View>
                                <TouchableOpacity><Text style={{ color: '#1E88E5', fontSize: 12, fontWeight: 'bold', marginTop: 8 }}>Detail</Text></TouchableOpacity>
                                
                                {/* Counter */}
                                <View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 12, marginTop: 10 }}>
                                    <View style={styles.counterBtn}><Text style={styles.counterText}>{sQty}</Text></View>
                                </View>
                            </View>
                        )}

                        {/* Tiket Gold */}
                        {gQty > 0 && (
                            <View style={styles.ticketSection}>
                                <Text style={styles.ticketCatTitle}>Gold</Text>
                                <Text style={styles.ticketPrice}>Rp.{goldPriceVal.toLocaleString('id-ID')} + pajak 10% dan layanan 5%</Text>
                                <View style={styles.benefitRow}><MaterialCommunityIcons name="history" size={16} color="#666" /><Text style={styles.benefitText}>Tidak bisa refund</Text></View>
                                <View style={styles.benefitRow}><MaterialCommunityIcons name="seat-outline" size={16} color="#666" /><Text style={styles.benefitText}>Tempat duduk bebas</Text></View>
                                <View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 12, marginTop: 10 }}>
                                    <View style={styles.counterBtn}><Text style={styles.counterText}>{gQty}</Text></View>
                                </View>
                            </View>
                        )}
                    </View>

                    {/* Detail Pemesan */}
                    <View style={styles.card}>
                        <Text style={styles.sectionTitle}>Detail Pemesanan</Text>
                        <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#333' }}>{profile.full_name || 'User'}</Text>
                        <Text style={{ fontSize: 12, color: '#666', marginTop: 2 }}>{profile.phone_number || '+62 811-0000-0000'}</Text>
                        <Text style={{ fontSize: 12, color: '#666', marginTop: 2 }}>{userEmail || '-'}</Text>
                    </View>
                </ScrollView>

                {/* Footer */}
                <View style={styles.footer}>
                    <View style={styles.summaryRow}><Text style={styles.sumLabel}>Subtotal</Text><Text style={styles.sumValue}>IDR {finalPrice.toLocaleString('id-ID')}</Text></View>
                    <View style={styles.summaryRow}><Text style={styles.sumLabel}>Pajak</Text><Text style={styles.sumValue}>IDR {pajak.toLocaleString('id-ID')}</Text></View>
                    <View style={styles.summaryRow}><Text style={styles.sumLabel}>Biaya layanan</Text><Text style={styles.sumValue}>IDR {biayaLayanan.toLocaleString('id-ID')}</Text></View>
                    <TouchableOpacity style={styles.mainBtn} onPress={() => setStep(2)}>
                        <Text style={styles.mainBtnText}>Pesan Sekarang</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    // ============ STEP 2: Detail Payment ============
    if (step === 2) {
        return (
            <SafeAreaView style={styles.container}>
                {renderEwalletModal()}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => setStep(1)}>
                        <MaterialCommunityIcons name="chevron-left" size={28} color="#000" />
                    </TouchableOpacity>
                    <View>
                        <Text style={styles.headerTitle}>Lanjutkan Pembayaran</Text>
                        <Text style={{ fontSize: 11, color: '#999', textAlign: 'center' }}>Order ID: {orderId}</Text>
                    </View>
                    <View style={{ width: 28 }} />
                </View>
                <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 140 }}>
                    {/* Timer */}
                    <View style={styles.timerCard}>
                        <Text style={styles.labelGrey}>Selesaikan sebelum</Text>
                        <Text style={styles.timerText}>{formatTimer(timer)}</Text>
                    </View>

                    {/* Event Card */}
                    <View style={styles.eventBanner}>
                        <Text style={{ fontWeight: 'bold', color: '#FFF', fontSize: 14 }}>{event.title}</Text>
                        <Text style={{ color: '#E3F2FD', fontSize: 11, marginTop: 4 }}>{event.date}</Text>
                    </View>

                    {/* Metode Pembayaran - ringkasan */}
                    <View style={{ marginTop: 25 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#333' }}>Metode pembayaran</Text>
                            <TouchableOpacity onPress={() => setStep(3)}>
                                <Text style={{ color: '#1E88E5', fontWeight: 'bold', fontSize: 13 }}>Lainnya {'>'}</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Saldo Tikara */}
                        <TouchableOpacity
                            style={[styles.methodCard, !saldoCukup && { opacity: 0.4 }]}
                            disabled={!saldoCukup}
                            onPress={() => {
                                setSelectedMethod('saldo');
                                // Langsung bayar
                                handleConfirmPayment();
                            }}
                        >
                            <MaterialCommunityIcons name="wallet-outline" size={22} color="#1E88E5" />
                            <View style={{ flex: 1, marginLeft: 12 }}>
                                <Text style={{ fontSize: 13, color: '#333', fontWeight: '500' }}>Saldo tersedia Rp. {(profile?.balance || 0).toLocaleString('id-ID')}</Text>
                            </View>
                        </TouchableOpacity>
                        {!saldoCukup && (
                            <Text style={{ color: '#E53935', fontSize: 11, marginTop: -8, marginBottom: 10, marginLeft: 5 }}>Saldo anda tidak mencukupi !</Text>
                        )}
                    </View>
                </ScrollView>

                {/* Footer */}
                <View style={styles.footer}>
                    <View style={styles.summaryRow}><Text style={styles.sumLabel}>Subtotal</Text><Text style={styles.sumValue}>IDR {finalPrice.toLocaleString('id-ID')}</Text></View>
                    <View style={styles.summaryRow}><Text style={styles.sumLabel}>Pajak</Text><Text style={styles.sumValue}>IDR {pajak.toLocaleString('id-ID')}</Text></View>
                    <View style={styles.summaryRow}><Text style={styles.sumLabel}>Biaya layanan</Text><Text style={styles.sumValue}>IDR {biayaLayanan.toLocaleString('id-ID')}</Text></View>
                    <TouchableOpacity style={styles.mainBtn} onPress={() => setStep(3)}>
                        <Text style={styles.mainBtnText}>Pesan Sekarang</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    // ============ STEP 3: Payment Method (Full List) ============
    if (step === 3) {
        return (
            <SafeAreaView style={styles.container}>
                {renderEwalletModal()}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => setStep(2)}>
                        <MaterialCommunityIcons name="chevron-left" size={28} color="#000" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Lanjutkan Pembayaran</Text>
                    <View style={{ width: 28 }} />
                </View>
                <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 140 }}>
                    <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 20 }}>Metode pembayaran</Text>

                    {/* QRIS */}
                    <View style={styles.methodGroupCard}>
                        <Text style={styles.methodGroupTitle}>Qris</Text>
                        <TouchableOpacity style={styles.methodItem} onPress={() => { setSelectedMethod('qris'); setStep(4); }}>
                            <MaterialCommunityIcons name="qrcode" size={22} color="#333" />
                            <Text style={styles.methodItemText}>Qris</Text>
                            <MaterialCommunityIcons name={selectedMethod === 'qris' ? 'radiobox-marked' : 'radiobox-blank'} size={20} color="#1E88E5" />
                        </TouchableOpacity>
                    </View>

                    {/* E-wallet */}
                    <View style={styles.methodGroupCard}>
                        <Text style={styles.methodGroupTitle}>E-wallet</Text>
                        <TouchableOpacity style={styles.methodItem} onPress={() => setSelectedMethod('ovo')}>
                            <Text style={styles.ewalletIcon}>ovo</Text>
                            <Text style={styles.methodItemText}>Ovo</Text>
                            <MaterialCommunityIcons name={selectedMethod === 'ovo' ? 'radiobox-marked' : 'radiobox-blank'} size={20} color="#1E88E5" />
                        </TouchableOpacity>
                        <View style={styles.dividerThin} />
                        <TouchableOpacity style={styles.methodItem} onPress={() => setSelectedMethod('gopay')}>
                            <MaterialCommunityIcons name="wallet" size={22} color="#00AA13" />
                            <Text style={styles.methodItemText}>Gopay</Text>
                            <MaterialCommunityIcons name={selectedMethod === 'gopay' ? 'radiobox-marked' : 'radiobox-blank'} size={20} color="#1E88E5" />
                        </TouchableOpacity>
                        <View style={styles.dividerThin} />
                        <TouchableOpacity style={styles.methodItem} onPress={() => setSelectedMethod('shopeepay')}>
                            <MaterialCommunityIcons name="shopping" size={22} color="#EE4D2D" />
                            <Text style={styles.methodItemText}>Shopee pay</Text>
                            <MaterialCommunityIcons name={selectedMethod === 'shopeepay' ? 'radiobox-marked' : 'radiobox-blank'} size={20} color="#1E88E5" />
                        </TouchableOpacity>
                    </View>

                    {/* Saldo */}
                    <View style={styles.methodGroupCard}>
                        <Text style={styles.methodGroupTitle}>Saldo</Text>
                        <TouchableOpacity 
                            style={[styles.methodItem, !saldoCukup && { opacity: 0.4 }]} 
                            disabled={!saldoCukup}
                            onPress={() => setSelectedMethod('saldo')}
                        >
                            <MaterialCommunityIcons name="wallet-outline" size={22} color="#1E88E5" />
                            <Text style={styles.methodItemText}>Saldo Tikara (Rp {(profile?.balance || 0).toLocaleString('id-ID')})</Text>
                            <MaterialCommunityIcons name={selectedMethod === 'saldo' ? 'radiobox-marked' : 'radiobox-blank'} size={20} color={saldoCukup ? "#1E88E5" : "#CCC"} />
                        </TouchableOpacity>
                        {!saldoCukup && <Text style={{ color: '#E53935', fontSize: 11, marginLeft: 10, marginTop: -5, marginBottom: 5 }}>Saldo tidak mencukupi</Text>}
                    </View>
                </ScrollView>

                {/* Footer */}
                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[styles.mainBtn, !selectedMethod && { backgroundColor: '#CCC' }]}
                        disabled={!selectedMethod || isProcessing}
                        onPress={() => {
                            if (selectedMethod === 'qris') {
                                setStep(4);
                            } else if (selectedMethod === 'saldo') {
                                handleConfirmPayment();
                            } else {
                                // Buka simulasi payment gateway e-wallet
                                openEwalletSimulation(selectedMethod);
                            }
                        }}
                    >
                        <Text style={styles.mainBtnText}>{isProcessing ? 'Memproses...' : 'Pilih Pembayaran'}</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    // ============ STEP 4: Payment - QRIS ============
    const handleQrisVerify = async () => {
        if (isProcessing) return;
        setIsProcessing(true);
        // Simulate verification delay
        await new Promise(res => setTimeout(res, 2500));
        try {
            const result = await orderService.purchaseTicket(Number(eventId), finalTickets, grandTotal);
            if (result.success) {
                setIsProcessing(false);
                setStep(5); // go to success step
                successScale.setValue(0);
                Animated.spring(successScale, { toValue: 1, friction: 4, tension: 40, useNativeDriver: true }).start();
            } else {
                Alert.alert("Gagal", result.message);
                setIsProcessing(false);
            }
        } catch (error: any) {
            Alert.alert("Gagal", error.message || "Terjadi kesalahan.");
            setIsProcessing(false);
        }
    };

    // STEP 5: Success screen (shared for QRIS)
    if (step === 5) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 }}>
                    <Animated.View style={{
                        transform: [{ scale: successScale }],
                        backgroundColor: '#E8F5E9', width: 100, height: 100, borderRadius: 50,
                        justifyContent: 'center', alignItems: 'center', marginBottom: 25,
                    }}>
                        <MaterialCommunityIcons name="check-circle" size={60} color="#4CAF50" />
                    </Animated.View>
                    <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#333' }}>Pembayaran Berhasil! 🎉</Text>
                    <Text style={{ fontSize: 14, color: '#666', marginTop: 10, textAlign: 'center' }}>
                        Tiket Anda sudah aktif dan dapat dilihat di halaman Tiket
                    </Text>
                    <TouchableOpacity style={[styles.mainBtn, { marginTop: 30, paddingHorizontal: 40 }]}
                        onPress={() => router.replace('/(tabs)/ticket')}>
                        <Text style={styles.mainBtnText}>Lihat Tiket</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => setStep(3)}>
                    <MaterialCommunityIcons name="chevron-left" size={28} color="#000" />
                </TouchableOpacity>
                <View>
                    <Text style={styles.headerTitle}>Lanjutkan Pembayaran</Text>
                    <Text style={{ fontSize: 11, color: '#999', textAlign: 'center' }}>Order ID: {orderId}</Text>
                </View>
                <View style={{ width: 28 }} />
            </View>
            <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 140, alignItems: 'center' }}>
                {/* Timer */}
                <View style={{ marginBottom: 15, alignItems: 'center' }}>
                    <Text style={{ fontSize: 12, color: '#999' }}>Selesaikan pembayaran dalam</Text>
                    <Text style={styles.timerText}>{formatTimer(timer)}</Text>
                </View>

                {/* QR Code besar */}
                <View style={styles.qrisBox}>
                    <QRCode value={`QRIS-TIKARA-${orderId}-${grandTotal}`} size={220} />
                </View>

                {/* Detail Paket */}
                <View style={[styles.card, { width: '100%', marginTop: 25 }]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 }}>
                        <Image source={{ uri: event.image_url }} style={{ width: 60, height: 60, borderRadius: 10 }} />
                        <View style={{ flex: 1, marginLeft: 12 }}>
                            <Text style={{ fontWeight: 'bold', color: '#1E3A5F', fontSize: 14 }}>{event.title}</Text>
                        </View>
                    </View>

                    <View style={styles.infoRow}>
                        <Text style={styles.labelGrey}>Detail Paket</Text>
                        <Text style={styles.valueText}>Order Detail ID: {orderId}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.labelGrey}>Jumlah Tiket</Text>
                        <Text style={styles.valueText}>{finalTickets} tiket</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.labelGrey}>Masa Berlaku</Text>
                        <Text style={styles.valueText}>{event.date}</Text>
                    </View>
                </View>

                {/* Subtotal */}
                <View style={{ width: '100%', marginTop: 15 }}>
                    <View style={styles.summaryRow}>
                        <Text style={styles.sumLabel}>Subtotal</Text>
                        <Text style={styles.sumValue}>IDR {grandTotal.toLocaleString('id-ID')}</Text>
                    </View>
                </View>
            </ScrollView>

            {/* Footer QRIS */}
            <View style={styles.footer}>
                <TouchableOpacity style={[styles.mainBtn, { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#1E88E5' }]} onPress={() => Alert.alert("Info", "QR Code sudah tersimpan!")}>
                    <Text style={[styles.mainBtnText, { color: '#1E88E5' }]}>Unduh Qris</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.mainBtn, { marginTop: 10 }, isProcessing && { backgroundColor: '#CCC' }]}
                    disabled={isProcessing}
                    onPress={handleQrisVerify}
                >
                    <Text style={styles.mainBtnText}>{isProcessing ? 'Memverifikasi...' : 'Cek Status Pembayaran'}</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
    headerTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },

    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 15 },
    card: { backgroundColor: '#FFF', borderRadius: 15, padding: 15, marginBottom: 15, elevation: 2, borderWidth: 1, borderColor: '#F0F0F0' },

    infoRow: { marginBottom: 12 },
    labelGrey: { fontSize: 12, color: '#999', marginBottom: 2 },
    valueText: { fontSize: 14, fontWeight: '500', color: '#333' },

    ticketSection: { paddingTop: 15, borderTopWidth: 1, borderTopColor: '#F0F0F0', marginTop: 10 },
    ticketCatTitle: { fontSize: 15, fontWeight: 'bold', color: '#333', marginBottom: 4 },
    ticketPrice: { fontSize: 11, color: '#666', marginBottom: 10 },

    benefitRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 5 },
    benefitText: { fontSize: 11, color: '#666', flex: 1 },

    counterBtn: { backgroundColor: '#1E88E5', width: 30, height: 30, borderRadius: 6, justifyContent: 'center', alignItems: 'center' },
    counterText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },

    timerCard: { marginBottom: 15 },
    timerText: { fontSize: 22, fontWeight: 'bold', color: '#E53935', marginTop: 5 },

    eventBanner: { backgroundColor: '#1E88E5', padding: 15, borderRadius: 12 },

    methodCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 12, padding: 15, marginTop: 15, elevation: 1, borderWidth: 1, borderColor: '#F0F0F0' },

    methodGroupCard: { backgroundColor: '#FFF', borderRadius: 12, padding: 15, marginBottom: 15, elevation: 1, borderWidth: 1, borderColor: '#F0F0F0' },
    methodGroupTitle: { fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 10 },
    methodItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
    methodItemText: { flex: 1, marginLeft: 12, fontSize: 14, color: '#333' },
    ewalletIcon: { fontSize: 12, fontWeight: 'bold', color: '#6B21A8', backgroundColor: '#F3E8FF', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, overflow: 'hidden' },
    dividerThin: { height: 1, backgroundColor: '#F5F5F5' },

    qrisBox: { backgroundColor: '#FFF', padding: 25, borderRadius: 20, elevation: 5, marginTop: 10 },

    footer: { backgroundColor: '#FFF', padding: 20, borderTopWidth: 1, borderTopColor: '#EEE' },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    sumLabel: { fontSize: 13, color: '#666' },
    sumValue: { fontSize: 13, color: '#333', fontWeight: '500' },

    mainBtn: { backgroundColor: '#1E88E5', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 10 },
    mainBtnText: { color: '#FFF', fontSize: 15, fontWeight: 'bold' },
});