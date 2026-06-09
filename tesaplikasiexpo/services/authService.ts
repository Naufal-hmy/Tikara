import { supabase } from '../lib/supabase';

export const authService = {
    // Fungsi Daftar (Register)
    async signUp(email: string, password: string, fullName: string) {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { full_name: fullName } // Ini bakal ditangkap sama trigger SQL tadi
            }
        });
        return { data, error };
    },

    // Tambahkan ini di dalam export const authService = { ... }

    async getCurrentProfile() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();

        if (error) {
            console.error("Error ambil profil:", error.message);
            return null;
        }
        return data;
    },

    // Fungsi Masuk (Login)
    async signIn(email: string, password: string) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        return { data, error };
    },

    // Fungsi Keluar (Logout)
    async signOut() {
        await supabase.auth.signOut();
    }
};