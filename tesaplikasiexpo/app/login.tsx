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
import { authService } from '../services/authService';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Email dan Password harus diisi!');
            return;
        }

        setLoading(true);
        const { data, error } = await authService.signIn(email, password);
        setLoading(false);

        if (error) {
            Alert.alert('Gagal Masuk', error.message);
        } else {
            router.replace('/(tabs)');
        }
    }; // <--- TUTUP handleLogin DI SINI

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.innerContainer}>
                <View style={styles.headerContainer}>
                    <Text style={styles.title}>Masuk Akun</Text>
                    <Text style={styles.subtitle}>Sign In to get started</Text>
                </View>

                <View style={styles.formContainer}>
                    <View style={styles.inputWrapper}>
                        <MaterialCommunityIcons name="email-outline" size={20} color="#1E88E5" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your email"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>

                    <View style={styles.inputWrapper}>
                        <MaterialCommunityIcons name="lock-outline" size={20} color="#1E88E5" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your Password"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                        />
                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                            <MaterialCommunityIcons name={showPassword ? "eye-outline" : "eye-off-outline"} size={20} color="#A0A0A0" />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={styles.forgotPasswordContainer} onPress={() => router.push('/forgot-password')}>
                        <Text style={styles.forgotPasswordText}>Lupa Password</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.loginButton, loading && { backgroundColor: '#A0A0A0' }]}
                        onPress={handleLogin}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <Text style={styles.loginButtonText}>Masuk</Text>
                        )}
                    </TouchableOpacity>
                </View>

                <View style={styles.dividerContainer}>
                    <View style={styles.dividerLine} /><Text style={styles.dividerText}>Anda dapat terhubung dengan</Text><View style={styles.dividerLine} />
                </View>

                <TouchableOpacity style={styles.googleButton}>
                    <MaterialCommunityIcons name="google" size={20} color="#DB4437" style={styles.googleIcon} />
                    <Text style={styles.googleButtonText}>Masuk dengan akun google</Text>
                </TouchableOpacity>

                <View style={styles.footerContainer}>
                    <Text style={styles.footerText}>Apakah anda belum punya akun? </Text>
                    <TouchableOpacity onPress={() => router.push('/register')}>
                        <Text style={[styles.footerText, styles.registerText]}>klik Daftar</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

// PINDAHKAN STYLES KE LUAR FUNCTION (Sangat Penting!)
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    innerContainer: { flex: 1, paddingHorizontal: 24, justifyContent: 'center' },
    headerContainer: { marginTop: 60, marginBottom: 40 },
    title: { fontSize: 24, fontWeight: 'bold', color: '#000000', marginBottom: 8 },
    subtitle: { fontSize: 14, color: '#1E88E5', fontWeight: '500' },
    formContainer: { marginBottom: 30 },
    inputWrapper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8, paddingHorizontal: 12, marginBottom: 16, height: 50, backgroundColor: '#FAFAFA' },
    inputIcon: { marginRight: 10 },
    input: { flex: 1, fontSize: 14, color: '#333' },
    forgotPasswordContainer: { alignItems: 'flex-end', marginBottom: 24 },
    forgotPasswordText: { color: '#E53935', fontSize: 12, fontWeight: '600' },
    loginButton: { backgroundColor: '#1E88E5', borderRadius: 8, height: 50, justifyContent: 'center', alignItems: 'center' },
    loginButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
    dividerContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 30 },
    dividerLine: { flex: 1, height: 1, backgroundColor: '#E0E0E0' },
    dividerText: { marginHorizontal: 10, fontSize: 12, color: '#666666' },
    googleButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#1E88E5', borderRadius: 8, height: 50, marginBottom: 40 },
    googleIcon: { marginRight: 10 },
    googleButtonText: { color: '#1E88E5', fontSize: 14, fontWeight: '600' },
    footerContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 20 },
    footerText: { fontSize: 13, color: '#1E88E5' },
    registerText: { fontWeight: 'bold' },
});