import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// Masukkan data yang kamu salin di Langkah 1 tadi
const supabaseUrl = 'https://jknlvnvdlzxsxllrtpze.supabase.co';
const supabaseAnonKey = 'sb_publishable_IP8L4cs26G6slnMJkj9gew_RfAm19ZR';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: AsyncStorage, // Ini yang bikin login jadi awet
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});