import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
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
import { eventService, EventModel } from '../services/eventService';

export default function EditEventScreen() {
    const { id } = useLocalSearchParams();
    
    const [form, setForm] = useState({
        title: '',
        category: '',
        date: '',
        location: '',
        price: '',
        description: ''
    });

    const [imageUri, setImageUri] = useState<string | null>(null);
    const [imageBase64, setImageBase64] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        const fetchEventData = async () => {
            if (!id) return;
            const events = await eventService.getMyOrganizedEvents();
            const eventData = events.find((e: any) => e.id.toString() === id.toString());
            
            if (eventData) {
                setForm({
                    title: eventData.title,
                    category: eventData.category,
                    date: eventData.date,
                    location: eventData.location,
                    price: eventData.price.toString(),
                    description: eventData.description || ''
                });
                setImageUri(eventData.image_url);
            } else {
                Alert.alert("Error", "Event tidak ditemukan atau Anda bukan pemiliknya");
                router.back();
            }
            setFetching(false);
        };
        fetchEventData();
    }, [id]);

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
        if (!form.title || !form.price || !form.date || !form.location) {
            return Alert.alert("Eits!", "Mohon isi Judul, Tanggal, Lokasi, dan Harga.");
        }

        const priceValue = parseInt(form.price);
        if (isNaN(priceValue)) {
            return Alert.alert("Error", "Harga harus berupa angka.");
        }

        try {
            setLoading(true);

            let uploadedUrl = imageUri; // Default pakai yang lama
            if (imageBase64) {
                uploadedUrl = await eventService.uploadImage(imageBase64, 'jpeg');
            }

            const { error } = await eventService.updateEvent(Number(id), {
                ...form,
                price: priceValue,
                image_url: uploadedUrl as string,
                status: 'pending', // Wajib pending lagi kalau diedit
            });

            if (error) throw error;

            Alert.alert("Sukses! 🎉", "Event berhasil diupdate dan sedang menunggu verifikasi ulang dari admin.", [
                { text: "Mantap", onPress: () => router.back() }
            ]);

        } catch (error: any) {
            Alert.alert("Gagal Update", error.message || "Terjadi kesalahan.");
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#1E88E5" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.headerNav}>
                <TouchableOpacity onPress={() => router.back()}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Edit Event</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={styles.sectionTitle}>Ubah Event Kamu</Text>
                <Text style={styles.subtitle}>Perhatian: Menyimpan perubahan akan mengembalikan status event menjadi "Pending" untuk direview ulang admin.</Text>

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
                    <TextInput style={styles.input} value={form.title} onChangeText={(t) => setForm({ ...form, title: t })} />
                </View>

                <View style={styles.row}>
                    <View style={[styles.formGroup, { flex: 1 }]}>
                        <Text style={styles.label}>Kategori</Text>
                        <TextInput style={styles.input} value={form.category} onChangeText={(t) => setForm({ ...form, category: t })} />
                    </View>
                    <View style={[styles.formGroup, { flex: 1, marginLeft: 15 }]}>
                        <Text style={styles.label}>Harga Tiket *</Text>
                        <TextInput style={styles.input} value={form.price} keyboardType="numeric" onChangeText={(t) => setForm({ ...form, price: t })} />
                    </View>
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Tanggal Pelaksanaan *</Text>
                    <TextInput style={styles.input} value={form.date} onChangeText={(t) => setForm({ ...form, date: t })} />
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Lokasi / Venue *</Text>
                    <TextInput style={styles.input} value={form.location} onChangeText={(t) => setForm({ ...form, location: t })} />
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Deskripsi Event</Text>
                    <TextInput style={[styles.input, styles.textArea]} value={form.description} multiline onChangeText={(t) => setForm({ ...form, description: t })} />
                </View>

                <TouchableOpacity
                    style={[styles.btn, loading && { backgroundColor: '#A0A0A0' }]}
                    onPress={handleSave}
                    disabled={loading}
                >
                    {loading ? <ActivityIndicator color="#FFF" /> : (
                        <>
                            <MaterialCommunityIcons name="content-save" size={20} color="#FFF" />
                            <Text style={styles.btnText}>Simpan Perubahan</Text>
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
    subtitle: { fontSize: 13, color: '#D97706', marginBottom: 25 },
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
