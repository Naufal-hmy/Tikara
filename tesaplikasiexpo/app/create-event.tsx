import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { eventService } from '../services/eventService';

export default function CreateEventScreen() {
    const [form, setForm] = useState({
        title: '',
        category: 'Musik',
        date: '',
        location: '',
        price: '',
        description: ''
    });

    const [imageUri, setImageUri] = useState<string | null>(null);
    const [imageBase64, setImageBase64] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.5,
            base64: true,
        });

        if (!result.canceled) {
            setImageUri(result.assets[0].uri);
            setImageBase64(result.assets[0].base64 || null);
        }
    };

    const handleSave = async () => {
        if (!form.title || !form.price || !form.date || !form.location || !imageBase64) {
            return Alert.alert("Eits!", "Mohon isi semua field termasuk Poster Event.");
        }

        const priceValue = parseInt(form.price);
        if (isNaN(priceValue)) {
            return Alert.alert("Error", "Harga harus berupa angka.");
        }

        try {
            setLoading(true);

            // 1. Upload Gambar
            const uploadedUrl = await eventService.uploadImage(imageBase64, 'jpeg');

            // 2. Simpan Event
            const { error } = await eventService.createEvent({
                ...form,
                price: priceValue,
                image_url: uploadedUrl,
                status: 'pending',
                remaining_quota: 100,
                total_quota: 100
            });

            if (error) throw error;

            Alert.alert("Sukses! 🎉", "Event berhasil diajukan. Tunggu verifikasi admin.", [
                { text: "Mantap", onPress: () => router.replace('/(tabs)') }
            ]);

        } catch (error: any) {
            Alert.alert("Gagal Terbit", error.message || "Terjadi kesalahan saat menyimpan event.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.headerNav}>
                <TouchableOpacity onPress={() => router.back()}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Panel Organizer</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={styles.sectionTitle}>Buat Event Baru</Text>
                <Text style={styles.subtitle}>Event yang kamu buat akan ditinjau oleh tim admin.</Text>

                <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                    {imageUri ? (
                        <Image source={{ uri: imageUri }} style={styles.previewImage} />
                    ) : (
                        <View style={styles.imagePlaceholder}>
                            <MaterialCommunityIcons name="camera-plus" size={40} color="#9CA3AF" />
                            <Text style={styles.imagePlaceholderText}>Pilih Poster Event</Text>
                        </View>
                    )}
                </TouchableOpacity>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Nama Event *</Text>
                    <TextInput style={styles.input} placeholder="Contoh: Konser Tulus 2026" onChangeText={(t) => setForm({ ...form, title: t })} />
                </View>

                <View style={styles.row}>
                    <View style={[styles.formGroup, { flex: 1 }]}>
                        <Text style={styles.label}>Kategori</Text>
                        <TextInput style={styles.input} placeholder="Pop/Festival" onChangeText={(t) => setForm({ ...form, category: t })} />
                    </View>
                    <View style={[styles.formGroup, { flex: 1, marginLeft: 15 }]}>
                        <Text style={styles.label}>Harga Tiket *</Text>
                        <TextInput style={styles.input} placeholder="500000" keyboardType="numeric" onChangeText={(t) => setForm({ ...form, price: t })} />
                    </View>
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Tanggal Pelaksanaan *</Text>
                    <TextInput style={styles.input} placeholder="Contoh: 15 Mei 2026" onChangeText={(t) => setForm({ ...form, date: t })} />
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Lokasi / Venue *</Text>
                    <TextInput style={styles.input} placeholder="Contoh: Istora Senayan, Jakarta" onChangeText={(t) => setForm({ ...form, location: t })} />
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Deskripsi Event</Text>
                    <TextInput style={[styles.input, styles.textArea]} placeholder="Detail acara..." multiline onChangeText={(t) => setForm({ ...form, description: t })} />
                </View>

                <TouchableOpacity
                    style={[styles.btn, loading && { backgroundColor: '#A0A0A0' }]}
                    onPress={handleSave}
                    disabled={loading}
                >
                    {loading ? <ActivityIndicator color="#FFF" /> : (
                        <>
                            <MaterialCommunityIcons name="rocket-launch" size={20} color="#FFF" />
                            <Text style={styles.btnText}>Ajukan Verifikasi</Text>
                        </>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFF' },
    headerNav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
    headerTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    content: { padding: 20, paddingBottom: 40 },
    sectionTitle: { fontSize: 22, fontWeight: 'bold', color: '#1E88E5', marginBottom: 5 },
    subtitle: { fontSize: 13, color: '#666', marginBottom: 25 },
    formGroup: { marginBottom: 15 },
    row: { flexDirection: 'row' },
    label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 8 },
    input: { borderWidth: 1, borderColor: '#EEE', padding: 12, borderRadius: 10, backgroundColor: '#FAFAFA' },
    textArea: { height: 80, textAlignVertical: 'top' },
    btn: { backgroundColor: '#1E88E5', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 20, flexDirection: 'row', justifyContent: 'center', gap: 10 },
    btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
    imagePicker: { width: '100%', height: 200, backgroundColor: '#F3F4F6', borderRadius: 12, overflow: 'hidden', marginBottom: 20, borderWidth: 1, borderColor: '#E5E7EB', borderStyle: 'dashed' },
    previewImage: { width: '100%', height: '100%', resizeMode: 'cover' },
    imagePlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    imagePlaceholderText: { color: '#9CA3AF', marginTop: 10, fontWeight: '500' }
});