import { MaterialCommunityIcons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../lib/supabase';

export default function ScannerScreen() {
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);
    const [loading, setLoading] = useState(false);

    // 1. Cek Izin Kamera
    if (!permission) return <View />;
    if (!permission.granted) {
        return (
            <View style={styles.container}>
                <Text style={styles.infoText}>Tikara butuh izin kamera untuk scan tiket.</Text>
                <TouchableOpacity style={styles.btnPermission} onPress={requestPermission}>
                    <Text style={styles.btnText}>Beri Izin Kamera</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // 2. Fungsi Utama Scan
    const handleBarCodeScanned = async ({ data }: any) => {
        setScanned(true); // Stop scan sementara biar gak narik data berkali-kali
        setLoading(true);

        try {
            // A. Validasi: Siapa yang scan? (Hanya Organizer yang boleh)
            const { data: { user } } = await supabase.auth.getUser();
            const { data: myProfile } = await supabase.from('profiles').select('role').eq('id', user?.id).single();

            if (myProfile?.role !== 'organizer') {
                Alert.alert("Akses Ditolak!", "Cuma akun Organizer yang bisa scan tiket.");
                return;
            }

            // B. Cari data tiket berdasarkan ID dari QR (Link Universal)
            // Kita ambil ID-nya saja dari link: https://tikara.id/verify/[ORDER_ID]
            const orderId = data.split('/').pop();

            const { data: order, error } = await supabase
                .from('orders')
                .select('*, events(title), profiles:user_id(full_name)')
                .eq('id', orderId)
                .single();

            if (error || !order) {
                Alert.alert("Tiket Palsu! ❌", "QR Code ini tidak terdaftar di sistem Tikara.");
            } else if (order.is_checked_in) {
                Alert.alert("Sudah Dipakai! ⚠️", `Tiket atas nama ${order.profiles.full_name} sudah di-scan sebelumnya.`);
            } else {
                // C. BERHASIL! Update status jadi terpakai
                await supabase.from('orders').update({
                    is_checked_in: true,
                    checked_in_at: new Date().toISOString()
                }).eq('id', order.id);

                Alert.alert("VALID! ✅", `Silakan masuk!\n\nNama: ${order.profiles.full_name}\nEvent: ${order.events.title}`);
            }
        } catch (err) {
            Alert.alert("Error", "Terjadi kesalahan saat verifikasi.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <CameraView
                style={StyleSheet.absoluteFillObject}
                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
            >
                {/* Overlay Scanner UI */}
                <View style={styles.overlay}>
                    <View style={styles.unfocusedContainer} />
                    <View style={styles.focusedContainer}>
                        <View style={styles.cornerTopLeft} />
                        <View style={styles.cornerTopRight} />
                        <View style={styles.cornerBottomLeft} />
                        <View style={styles.cornerBottomRight} />
                        {loading && <ActivityIndicator size="large" color="#FFF" />}
                    </View>
                    <View style={styles.unfocusedContainer}>
                        <Text style={styles.instruction}>Arahkan Kamera ke QR Tiket</Text>
                        {scanned && (
                            <TouchableOpacity style={styles.btnRescan} onPress={() => setScanned(false)}>
                                <Text style={styles.btnText}>Scan Tiket Lain</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </CameraView>

            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                <MaterialCommunityIcons name="close" size={30} color="#FFF" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000', justifyContent: 'center' },
    infoText: { color: '#FFF', textAlign: 'center', marginBottom: 20 },
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center' },
    unfocusedContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    focusedContainer: { width: 250, height: 250, alignSelf: 'center', justifyContent: 'center' },
    instruction: { color: '#FFF', fontSize: 16, fontWeight: 'bold', marginTop: 20 },
    btnPermission: { backgroundColor: '#1E88E5', padding: 15, borderRadius: 10, alignSelf: 'center' },
    btnRescan: { backgroundColor: '#FFF', padding: 15, borderRadius: 10, marginTop: 20 },
    btnText: { fontWeight: 'bold', color: '#1E88E5' },
    backBtn: { position: 'absolute', top: 50, right: 20, backgroundColor: 'rgba(0,0,0,0.5)', padding: 10, borderRadius: 30 },
    // Siku-siku kotak scan
    cornerTopLeft: { position: 'absolute', top: 0, left: 0, width: 40, height: 40, borderTopWidth: 5, borderLeftWidth: 5, borderColor: '#1E88E5' },
    cornerTopRight: { position: 'absolute', top: 0, right: 0, width: 40, height: 40, borderTopWidth: 5, borderRightWidth: 5, borderColor: '#1E88E5' },
    cornerBottomLeft: { position: 'absolute', bottom: 0, left: 0, width: 40, height: 40, borderBottomWidth: 5, borderLeftWidth: 5, borderColor: '#1E88E5' },
    cornerBottomRight: { position: 'absolute', bottom: 0, right: 0, width: 40, height: 40, borderBottomWidth: 5, borderRightWidth: 5, borderColor: '#1E88E5' },
});