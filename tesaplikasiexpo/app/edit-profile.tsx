import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';
import { authService } from '../services/authService';

export default function EditProfileScreen() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [dob, setDob] = useState('');
    const [gender, setGender] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) setEmail(user.email || '');

        const profile = await authService.getCurrentProfile();
        if (profile) {
            setName(profile.full_name || '');
            setPhone(profile.phone_number || '');
            setDob(profile.date_of_birth || '');
            setGender(profile.gender || '');
        }
    };

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert('Error', 'Nama tidak boleh kosong');
            return;
        }
        setSaving(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name: name.trim(),
                    phone_number: phone.trim(),
                    date_of_birth: dob.trim() || null,
                    gender: gender.trim() || null,
                })
                .eq('id', user?.id);

            if (error) {
                Alert.alert('Gagal', error.message);
            } else {
                Alert.alert('Berhasil', 'Profil berhasil diperbarui!', [
                    { text: 'OK', onPress: () => router.back() }
                ]);
            }
        } catch (err: any) {
            Alert.alert('Error', err.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <MaterialCommunityIcons name="chevron-left" size={28} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Edit Profile</Text>
                <View style={{ width: 28 }} />
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    {/* Avatar */}
                    <View style={styles.avatarSection}>
                        <View style={styles.avatarCircle}>
                            <MaterialCommunityIcons name="account" size={50} color="#999" />
                        </View>
                    </View>

                    {/* Form Fields */}
                    <View style={styles.form}>
                        {/* Nama Lengkap */}
                        <Text style={styles.label}>Nama Lengkap</Text>
                        <View style={styles.inputWrapper}>
                            <MaterialCommunityIcons name="account-outline" size={20} color="#1E88E5" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                value={name}
                                onChangeText={setName}
                                placeholder="Masukkan nama lengkap"
                            />
                        </View>

                        {/* Email */}
                        <Text style={styles.label}>Email</Text>
                        <View style={[styles.inputWrapper, { backgroundColor: '#F5F5F5' }]}>
                            <MaterialCommunityIcons name="email-outline" size={20} color="#999" style={styles.inputIcon} />
                            <TextInput
                                style={[styles.input, { color: '#999' }]}
                                value={email}
                                editable={false}
                                placeholder="Email"
                            />
                        </View>

                        {/* Phone */}
                        <Text style={styles.label}>Phone</Text>
                        <View style={styles.inputWrapper}>
                            <MaterialCommunityIcons name="phone-outline" size={20} color="#1E88E5" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                value={phone}
                                onChangeText={setPhone}
                                keyboardType="phone-pad"
                                placeholder="+62 811-0000-0000"
                            />
                        </View>

                        {/* Date of Birth */}
                        <Text style={styles.label}>Date of Birth</Text>
                        <View style={styles.inputWrapper}>
                            <MaterialCommunityIcons name="calendar-outline" size={20} color="#1E88E5" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                value={dob}
                                onChangeText={setDob}
                                placeholder="DD-MM-YYYY"
                                keyboardType="numbers-and-punctuation"
                            />
                        </View>

                        {/* Gender */}
                        <Text style={styles.label}>Gender</Text>
                        <View style={styles.inputWrapper}>
                            <MaterialCommunityIcons name="gender-male-female" size={20} color="#1E88E5" style={styles.inputIcon} />
                            <TouchableOpacity
                                style={{ flex: 1 }}
                                onPress={() => {
                                    Alert.alert('Pilih Gender', '', [
                                        { text: 'Laki-laki', onPress: () => setGender('Laki-laki') },
                                        { text: 'Perempuan', onPress: () => setGender('Perempuan') },
                                        { text: 'Batal', style: 'cancel' },
                                    ]);
                                }}
                            >
                                <Text style={[styles.input, { lineHeight: 40, color: gender ? '#333' : '#999' }]}>
                                    {gender || 'Pilih gender'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Tombol Simpan */}
                    <TouchableOpacity
                        style={[styles.saveBtn, saving && { backgroundColor: '#CCC' }]}
                        disabled={saving}
                        onPress={handleSave}
                    >
                        <Text style={styles.saveBtnText}>{saving ? 'Menyimpan...' : 'Simpan'}</Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#000' },
    scrollContent: { padding: 20, paddingBottom: 40 },

    avatarSection: { alignItems: 'center', marginVertical: 20 },
    avatarCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#E0E0E0', justifyContent: 'center', alignItems: 'center' },

    form: { marginBottom: 30 },
    label: { fontSize: 13, color: '#666', fontWeight: '500', marginBottom: 8, marginTop: 16 },
    inputWrapper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 10, paddingHorizontal: 12, height: 50, backgroundColor: '#FAFAFA' },
    inputIcon: { marginRight: 10 },
    input: { flex: 1, fontSize: 14, color: '#333' },

    saveBtn: { backgroundColor: '#1E88E5', height: 55, borderRadius: 12, justifyContent: 'center', alignItems: 'center', elevation: 2 },
    saveBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});