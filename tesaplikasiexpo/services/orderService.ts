import { supabase } from '../lib/supabase';

export const orderService = {
    /**
     * Mengambil riwayat tiket berdasarkan user yang sedang login
     */
    async getMyTickets() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        const { data, error } = await supabase
            .from('orders')
            .select(`
                *,
                events (
                    title,
                    date,
                    time,
                    location,
                    image_url,
                    category
                )
            `)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Error ambil tiket:", error.message);
            return [];
        }
        return data;
    },

    /**
     * Membeli tiket — coba RPC dulu, fallback ke direct insert jika RPC tidak ada
     */
    async purchaseTicket(eventId: number, quantity: number, totalPrice: number, paymentMethod: string = 'saldo') {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { success: false, message: 'Anda belum login' };

        // Coba RPC dulu jika menggunakan saldo
        if (paymentMethod === 'saldo') {
            try {
                const { data, error } = await supabase.rpc('purchase_ticket', {
                    p_event_id: eventId,
                    p_quantity: quantity,
                });

                if (!error && data) {
                    return data as { success: boolean; message: string; order_id?: string };
                }

                // Jika RPC error (function not found), fallback ke direct insert
                console.log("RPC tidak tersedia, pakai fallback direct insert:", error?.message);
            } catch (e) {
                console.log("RPC exception, menggunakan fallback");
            }
        }

        // ========= FALLBACK: Direct Insert =========
        try {
            // 1. Cek sisa kuota event
            const { data: eventData, error: eventErr } = await supabase
                .from('events')
                .select('remaining_quota, title')
                .eq('id', eventId)
                .single();

            if (eventErr || !eventData) {
                return { success: false, message: 'Event tidak ditemukan' };
            }

            if (eventData.remaining_quota < quantity) {
                return { success: false, message: `Kuota tidak cukup! Tersisa ${eventData.remaining_quota} tiket.` };
            }

            // 2. Insert order
            const { data: orderData, error: orderErr } = await supabase
                .from('orders')
                .insert([{
                    user_id: user.id,
                    event_id: eventId,
                    quantity: quantity,
                    total_price: totalPrice,
                    status: 'success',
                    is_checked_in: false,
                }])
                .select()
                .single();

            if (orderErr) {
                return { success: false, message: 'Gagal membuat pesanan: ' + orderErr.message };
            }

            // 3. Kurangi kuota event
            await supabase
                .from('events')
                .update({ remaining_quota: eventData.remaining_quota - quantity })
                .eq('id', eventId);

            return {
                success: true,
                message: `Berhasil membeli ${quantity} tiket ${eventData.title}!`,
                order_id: orderData.id
            };
        } catch (err: any) {
            return { success: false, message: err.message || 'Gagal memproses pesanan' };
        }
    },

    async getPopularTitles() {
        const { data, error } = await supabase.from('orders').select('events(title)');
        if (error || !data) return ['Coldplay', 'Cakra Khan', 'Festival'];

        const counts: Record<string, number> = {};
        for (let row of data) {
            const title = (row.events as any)?.title;
            if (title) {
                counts[title] = (counts[title] || 0) + 1;
            }
        }
        const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
        const topTitles = sorted.slice(0, 5).map(x => x[0]);

        return topTitles.length > 0 ? topTitles : ['Coldplay', 'Cakra Khan', 'Festival'];
    }
};