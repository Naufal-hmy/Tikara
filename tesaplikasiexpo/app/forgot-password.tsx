import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';

export default function ForgotPasswordScreen() {
    const [step, setStep] = useState(1); // 1: email, 2: OTP, 3: new password
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Step 1: Kirim OTP ke email via Supabase
    const handleSendOTP = async () => {
        if (!email.trim()) {
            Alert.alert('Error', 'Masukkan email Anda');
            return;
        }
        setLoading(true);
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
                redirectTo: undefined, // Untuk mobile, kita pakai OTP flow
            });

            if (error) {
                Alert.alert('Gagal', error.message);
            } else {
                Alert.alert('Berhasil', 'Kode OTP telah dikirim ke email Anda. Cek kotak masuk (termasuk folder Spam).');
                setStep(2);
            }
        } catch (err: any) {
            Alert.alert('Error', err.message);
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Verifikasi OTP
    const handleVerifyOTP = async () => {
        if (!otp.trim() || otp.length < 6) {
            Alert.alert('Error', 'Masukkan kode OTP 6 digit');
            return;
        }
        setLoading(true);
        try {
            const { data, error } = await supabase.auth.verifyOtp({
                email: email.trim(),
                token: otp.trim(),
                type: 'recovery',
            });

            if (error) {
                Alert.alert('Gagal', 'Kode OTP tidak valid atau sudah kadaluarsa.\n' + error.message);
            } else {
                Alert.alert('Berhasil', 'OTP terverifikasi! Silahkan buat password baru.');
                setStep(3);
            }
        } catch (err: any) {
            Alert.alert('Error', err.message);
        } finally {
            setLoading(false);
        }
    };

    // Step 3: Ganti password
    const handleResetPassword = async () => {
        if (newPassword.length < 6) {
            Alert.alert('Error', 'Password harus minimal 6 karakter');
            return;
        }
        if (newPassword !== confirmPassword) {
            Alert.alert('Error', 'Password dan konfirmasi password tidak cocok');
            return;
        }
        setLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({
                password: newPassword,
            });

            if (error) {
                Alert.alert('Gagal', error.message);
            } else {
                Alert.alert('Sukses! 🎉', 'Password berhasil diubah. Silahkan masuk dengan password baru.', [
                    { text: 'OK', onPress: () => router.replace('/login') }
                ]);
            }
        } catch (err: any) {
            Alert.alert('Error', err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.innerContainer}>
                {/* Back Button */}
                <TouchableOpacity style={styles.backButton} onPress={() => {
                    if (step > 1) setStep(step - 1);
                    else router.back();
                }}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#000" />
                </TouchableOpacity>

                {/* Step Indicator */}
                <View style={styles.stepsRow}>
                    <View style={[styles.stepDot, step >= 1 && styles.stepDotActive]} />
                    <View style={[styles.stepLine, step >= 2 && styles.stepLineActive]} />
                    <View style={[styles.stepDot, step >= 2 && styles.stepDotActive]} />
                    <View style={[styles.stepLine, step >= 3 && styles.stepLineActive]} />
                    <View style={[styles.stepDot, step >= 3 && styles.stepDotActive]} />
                </View>

                {/* === STEP 1: Email === */}
                {step === 1 && (
                    <View>
                        <View style={styles.headerContainer}>
                            <Text style={styles.title}>Lupa Password</Text>
                            <Text style={styles.subtitle}>Masukkan email Anda untuk menerima kode OTP</Text>
                        </View>

                        <View style={styles.inputWrapper}>
                            <MaterialCommunityIcons name="email-outline" size={20} color="#1E88E5" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Masukkan email Anda"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>

                        <TouchableOpacity
                            style={[styles.btn, loading && { backgroundColor: '#CCC' }]}
                            disabled={loading}
                            onPress={handleSendOTP}
                        >
                            {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.btnText}>Kirim Kode OTP</Text>}
                        </TouchableOpacity>
                    </View>
                )}

                {/* === STEP 2: OTP Verification === */}
                {step === 2 && (
                    <View>
                        <View style={styles.headerContainer}>
                            <Text style={styles.title}>Verifikasi OTP</Text>
                            <Text style={styles.subtitle}>Masukkan kode 6 digit yang dikirim ke {email}</Text>
                        </View>

                        <View style={styles.inputWrapper}>
                            <MaterialCommunityIcons name="shield-key-outline" size={20} color="#1E88E5" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Masukkan kode OTP"
                                value={otp}
                                onChangeText={setOtp}
                                keyboardType="number-pad"
                                maxLength={6}
                            />
                        </View>

                        <TouchableOpacity
                            style={[styles.btn, loading && { backgroundColor: '#CCC' }]}
                            disabled={loading}
                            onPress={handleVerifyOTP}
                        >
                            {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.btnText}>Verifikasi</Text>}
                        </TouchableOpacity>

                        <TouchableOpacity style={{ marginTop: 20, alignItems: 'center' }} onPress={handleSendOTP}>
                            <Text style={{ color: '#1E88E5', fontSize: 13 }}>Kirim ulang kode OTP</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* === STEP 3: New Password === */}
                {step === 3 && (
                    <View>
                        <View style={styles.headerContainer}>
                            <Text style={styles.title}>Password Baru</Text>
                            <Text style={styles.subtitle}>Buat password baru Anda (minimal 6 karakter)</Text>
                        </View>

                        <View style={styles.inputWrapper}>
                            <MaterialCommunityIcons name="lock-outline" size={20} color="#1E88E5" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Password baru"
                                value={newPassword}
                                onChangeText={setNewPassword}
                                secureTextEntry={!showPassword}
                            />
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                <MaterialCommunityIcons name={showPassword ? "eye-outline" : "eye-off-outline"} size={20} color="#A0A0A0" />
                            </TouchableOpacity>
                        </View>

                        <View style={[styles.inputWrapper, { marginTop: 16 }]}>
                            <MaterialCommunityIcons name="lock-check-outline" size={20} color="#1E88E5" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Konfirmasi password baru"
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                secureTextEntry={!showPassword}
                            />
                        </View>

                        {newPassword.length > 0 && newPassword.length < 6 && (
                            <Text style={{ color: '#E53935', fontSize: 12, marginTop: 8, marginLeft: 5 }}>Password harus minimal 6 karakter</Text>
                        )}

                        <TouchableOpacity
                            style={[styles.btn, { marginTop: 24 }, loading && { backgroundColor: '#CCC' }]}
                            disabled={loading}
                            onPress={handleResetPassword}
                        >
                            {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.btnText}>Ubah Password</Text>}
                        </TouchableOpacity>
                    </View>
                )}
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    innerContainer: { flex: 1, paddingHorizontal: 24, paddingTop: 20 },
    backButton: { marginBottom: 20 },

    stepsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 30 },
    stepDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#E0E0E0' },
    stepDotActive: { backgroundColor: '#1E88E5' },
    stepLine: { width: 50, height: 2, backgroundColor: '#E0E0E0', marginHorizontal: 5 },
    stepLineActive: { backgroundColor: '#1E88E5' },

    headerContainer: { marginBottom: 30 },
    title: { fontSize: 24, fontWeight: 'bold', color: '#000000', marginBottom: 8 },
    subtitle: { fontSize: 14, color: '#666', lineHeight: 22 },

    inputWrapper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 10, paddingHorizontal: 12, height: 50, backgroundColor: '#FAFAFA' },
    inputIcon: { marginRight: 10 },
    input: { flex: 1, fontSize: 14, color: '#333' },

    btn: { backgroundColor: '#1E88E5', borderRadius: 10, height: 50, justifyContent: 'center', alignItems: 'center', marginTop: 20 },
    btnText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});