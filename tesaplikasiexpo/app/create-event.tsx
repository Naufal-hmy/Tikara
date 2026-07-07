import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Image,
    Modal,
    Pressable
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { eventService } from '../services/eventService';
import { CustomDatePicker, CustomTimePicker } from '../components/CustomDateTimePicker';

export default function CreateEventScreen() {
    const [form, setForm] = useState({
        title: '',
        category: 'Musik',
        date: '',
        time: '',
        location: '',
        address_detail: '',
        price: '',
        total_quota: '',
        description: ''
    });

    const [imageUri, setImageUri] = useState<string | null>(null);
    const [imageBase64, setImageBase64] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Categories state
    const [categories, setCategories] = useState<string[]>([]);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    
    // Pickers state
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);

    useEffect(() => {
        const loadCategories = async () => {
            const cats = await eventService.getCategories();
            setCategories(cats);
            if (cats.length > 0) {
                setForm(prev => ({ ...prev, category: cats[0] }));
            }
        };
        loadCategories();
    }, []);

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
        if (!form.title || !form.price || !form.date || !form.time || !form.location || !form.address_detail || !form.total_quota || !imageBase64) {
            return Alert.alert("Eits!", "Mohon isi semua field wajib termasuk Poster Event.");
        }

        const priceValue = parseInt(form.price);
        const quotaValue = parseInt(form.total_quota);
        
        if (isNaN(priceValue)) {
            return Alert.alert("Error", "Harga harus berupa angka.");
        }
        if (isNaN(quotaValue)) {
            return Alert.alert("Error", "Kuota harus berupa angka.");
        }

        try {
            setLoading(true);

            // 1. Upload Gambar
            const uploadedUrl = await eventService.uploadImage(imageBase64, 'jpeg');

            // 2. Simpan Event
            const { error } = await eventService.createEvent({
                ...form,
                price: priceValue,
                total_quota: quotaValue,
                remaining_quota: quotaValue,
                image_url: uploadedUrl,
                status: 'pending',
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
                        <Text style={styles.label}>Kategori *</Text>
                        <TouchableOpacity style={styles.dropdownInput} onPress={() => setShowCategoryModal(true)}>
                            <Text style={styles.dropdownText}>{form.category}</Text>
                            <MaterialCommunityIcons name="chevron-down" size={20} color="#666" />
                        </TouchableOpacity>
                    </View>
                    <View style={[styles.formGroup, { flex: 1, marginLeft: 15 }]}>
                        <Text style={styles.label}>Harga Tiket *</Text>
                        <TextInput style={styles.input} placeholder="500000" keyboardType="numeric" onChangeText={(t) => setForm({ ...form, price: t })} />
                    </View>
                </View>

                <View style={styles.row}>
                    <View style={[styles.formGroup, { flex: 1 }]}>
                        <Text style={styles.label}>Tanggal *</Text>
                        <TouchableOpacity style={styles.dropdownInput} onPress={() => setShowDatePicker(true)}>
                            <Text style={[styles.dropdownText, !form.date && {color: '#999'}]}>{form.date || 'YYYY-MM-DD'}</Text>
                            <MaterialCommunityIcons name="calendar" size={20} color="#666" />
                        </TouchableOpacity>
                    </View>
                    <View style={[styles.formGroup, { flex: 1, marginLeft: 15 }]}>
                        <Text style={styles.label}>Jam / Waktu *</Text>
                        <TouchableOpacity style={styles.dropdownInput} onPress={() => setShowTimePicker(true)}>
                            <Text style={[styles.dropdownText, !form.time && {color: '#999'}]}>{form.time || '19:00'}</Text>
                            <MaterialCommunityIcons name="clock-outline" size={20} color="#666" />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.row}>
                    <View style={[styles.formGroup, { flex: 1 }]}>
                        <Text style={styles.label}>Kuota Tiket *</Text>
                        <TextInput style={styles.input} placeholder="Contoh: 500" keyboardType="numeric" onChangeText={(t) => setForm({ ...form, total_quota: t })} />
                    </View>
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Nama Lokasi / Venue *</Text>
                    <TextInput style={styles.input} placeholder="Contoh: Istora Senayan" onChangeText={(t) => setForm({ ...form, location: t })} />
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Alamat Lengkap *</Text>
                    <TextInput style={[styles.input, { height: 60, textAlignVertical: 'top' }]} placeholder="Contoh: Jl. Pintu Satu Senayan..." multiline onChangeText={(t) => setForm({ ...form, address_detail: t })} />
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

            {/* Modal Kategori */}
            <Modal visible={showCategoryModal} transparent animationType="fade">
                <Pressable style={styles.modalOverlay} onPress={() => setShowCategoryModal(false)}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Pilih Kategori</Text>
                        {categories.map((cat, idx) => (
                            <TouchableOpacity
                                key={idx}
                                style={[styles.modalItem, form.category === cat && styles.modalItemActive]}
                                onPress={() => {
                                    setForm({ ...form, category: cat });
                                    setShowCategoryModal(false);
                                }}
                            >
                                <Text style={[styles.modalItemText, form.category === cat && styles.modalItemTextActive]}>{cat}</Text>
                                {form.category === cat && <MaterialCommunityIcons name="check" size={20} color="#1E88E5" />}
                            </TouchableOpacity>
                        ))}
                    </View>
                </Pressable>
            </Modal>

            {/* Modal Pickers */}
            <CustomDatePicker 
                visible={showDatePicker} 
                onClose={() => setShowDatePicker(false)}
                onSelect={(d) => setForm({...form, date: d})}
                currentDate={form.date}
            />
            
            <CustomTimePicker 
                visible={showTimePicker}
                onClose={() => setShowTimePicker(false)}
                onSelect={(t) => setForm({...form, time: t})}
            />

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
    dropdownInput: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#EEE', padding: 12, borderRadius: 10, backgroundColor: '#FAFAFA' },
    dropdownText: { color: '#333' },
    textArea: { height: 80, textAlignVertical: 'top' },
    btn: { backgroundColor: '#1E88E5', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 20, flexDirection: 'row', justifyContent: 'center', gap: 10 },
    btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
    imagePicker: { width: '100%', height: 200, backgroundColor: '#F3F4F6', borderRadius: 12, overflow: 'hidden', marginBottom: 20, borderWidth: 1, borderColor: '#E5E7EB', borderStyle: 'dashed' },
    previewImage: { width: '100%', height: '100%', resizeMode: 'cover' },
    imagePlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    imagePlaceholderText: { color: '#9CA3AF', marginTop: 10, fontWeight: '500' },
    
    // Modal styles
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { backgroundColor: '#FFF', borderRadius: 15, padding: 20, width: '80%', maxHeight: '60%' },
    modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 15 },
    modalItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 10, borderRadius: 8, marginBottom: 4 },
    modalItemActive: { backgroundColor: '#E3F2FD' },
    modalItemText: { fontSize: 15, color: '#333' },
    modalItemTextActive: { color: '#1E88E5', fontWeight: 'bold' }
});