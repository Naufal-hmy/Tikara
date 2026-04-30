import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import { authService } from '../../services/authService';

export default function ProfileScreen() {
    const [profile, setProfile] = useState<any>(null);
    const [email, setEmail] = useState<string>('');
    const [loading, setLoading] = useState(true);

    useFocusEffect(
        useCallback(() => {
            loadUserData();
        }, [])
    );

    const loadUserData = async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (user) setEmail(user.email || '');

            const userData = await authService.getCurrentProfile();
            setProfile(userData);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        Alert.alert('Logout', 'Apakah kamu yakin ingin keluar?', [
            { text: 'Batal', style: 'cancel' },
            {
                text: 'Keluar',
                style: 'destructive',
                onPress: async () => {
                    await authService.signOut();
                    router.replace('/login');
                }
            }
        ]);
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#1E88E5" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header Profil */}
                <View style={styles.header}>
                    <View style={styles.avatarContainer}>
                        <MaterialCommunityIcons name="account" size={60} color="#1E88E5" />
                    </View>
                    <Text style={styles.name}>{profile?.full_name || 'User'}</Text>
                    <Text style={styles.email}>{email}</Text>
                    {/* Badge untuk Admin / Penyelenggara */}
                    {(profile?.role === 'organizer' || profile?.role === 'admin') && (
                        <View style={styles.organizerBadge}>
                            <Text style={styles.organizerBadgeText}>
                                {profile?.role === 'admin' ? 'SUPER ADMIN' : 'OFFICIAL ORGANIZER'}
                            </Text>
                        </View>
                    )}
                </View>

                <View style={styles.menuContainer}>
                    <Text style={styles.menuTitle}>Akun Saya</Text>

                    <ProfileMenu icon="account-edit-outline" title="Ubah Profil" onPress={() => router.push('/edit-profile')} />
                    <ProfileMenu icon="ticket-confirmation-outline" title="Tiket Saya" onPress={() => router.push('/(tabs)/ticket')} />
                    <ProfileMenu icon="history" title="Riwayat" onPress={() => router.push('/history')} />
                    <ProfileMenu icon="bookmark-outline" title="Bookmark" onPress={() => router.push('/bookmarks')} />

                    {/* PANEL PENYELENGGARA / ADMIN */}
                    {(profile?.role === 'organizer' || profile?.role === 'admin') && (
                        <TouchableOpacity
                            style={[styles.menuItem, { backgroundColor: '#E1F5FE', borderColor: '#B3E5FC', borderWidth: 1 }]}
                            onPress={() => router.push('/admin-dashboard')}
                        >
                            <View style={styles.menuLeft}>
                                <MaterialCommunityIcons name="view-dashboard-outline" size={22} color="#1E88E5" />
                                <Text style={[styles.menuLabel, { color: '#1E88E5', fontWeight: 'bold' }]}>Dashboard Admin</Text>
                            </View>
                            <MaterialCommunityIcons name="chevron-right" size={20} color="#1E88E5" />
                        </TouchableOpacity>
                    )}

                    <View style={styles.divider} />

                    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                        <MaterialCommunityIcons name="logout" size={20} color="#E53935" />
                        <Text style={styles.logoutText}>Keluar dari Akun</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.version}>Tikara v1.0.0</Text>
            </ScrollView>
        </SafeAreaView>
    );
}

const ProfileMenu = ({ icon, title, onPress }: any) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
        <View style={styles.menuLeft}>
            <MaterialCommunityIcons name={icon} size={22} color="#333" />
            <Text style={styles.menuLabel}>{title}</Text>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={20} color="#CCC" />
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { alignItems: 'center', paddingVertical: 40, backgroundColor: '#FFF' },
    avatarContainer: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#E3F2FD', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
    name: { fontSize: 22, fontWeight: 'bold', color: '#333' },
    email: { fontSize: 14, color: '#666', marginTop: 5 },
    organizerBadge: { backgroundColor: '#1E88E5', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 4, marginTop: 10 },
    organizerBadgeText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
    menuContainer: { marginTop: 20, paddingHorizontal: 20 },
    menuTitle: { fontSize: 12, fontWeight: 'bold', color: '#999', marginBottom: 15, textTransform: 'uppercase', letterSpacing: 1 },
    menuItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFF', padding: 15, borderRadius: 12, marginBottom: 10, elevation: 1 },
    menuLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    menuLabel: { fontSize: 15, color: '#333', fontWeight: '500' },
    divider: { height: 1, backgroundColor: '#EEE', marginVertical: 15 },
    logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 15, marginBottom: 20 },
    logoutText: { color: '#E53935', fontWeight: 'bold', fontSize: 16 },
    version: { textAlign: 'center', color: '#CCC', fontSize: 12, marginBottom: 30 }
});