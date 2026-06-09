import { supabase } from '../lib/supabase';
import { decode } from 'base64-arraybuffer';

export interface EventModel {
  id: number;
  title: string;
  category: string;
  date: string;
  time: string;
  location: string;
  address_detail: string;
  price: number;
  image_url: string;
  description: string;
  status: string;
  remaining_quota: number;
  total_quota: number;
}

export const eventService = {
  async getAllEvents(): Promise<EventModel[]> {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('status', 'published')
      .order('id', { ascending: true });

    if (error) throw error;
    return (data as EventModel[]) || [];
  },

  async getEventById(id: number | string): Promise<EventModel | null> {
    const numId = Number(id);
    if (isNaN(numId)) return null;
    
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', numId)
      .single();
    if (error) {
      console.error('getEventById error:', error.message);
      return null;
    }
    return data as EventModel;
  },

  async getMyBookmarks() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    
    const { data, error } = await supabase
      .from('bookmarks')
      .select('id, event_id, events(*)')
      .eq('user_id', user.id);
      
    if (error) {
       console.log('Error fetch bookmarks', error);
       return [];
    }
    return data || [];
  },

  /**
   * Mendapatkan set ID event yang sudah di-bookmark oleh user saat ini
   */
  async getBookmarkedEventIds(): Promise<Set<number>> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return new Set();

    const { data, error } = await supabase
      .from('bookmarks')
      .select('event_id')
      .eq('user_id', user.id);

    if (error || !data) return new Set();
    return new Set(data.map((b: any) => b.event_id));
  },

  async toggleBookmark(eventId: number) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    
    // Check if exists
    const { data: existing } = await supabase
      .from('bookmarks')
      .select('id')
      .eq('user_id', user.id)
      .eq('event_id', eventId)
      .single();
      
    if (existing) {
       await supabase.from('bookmarks').delete().eq('id', existing.id);
       return false; // Unliked
    } else {
       await supabase.from('bookmarks').insert([{ user_id: user.id, event_id: eventId }]);
       return true; // Liked
    }
  },

  async createEvent(eventData: Partial<EventModel>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: { message: "Harus login untuk membuat event" } };

    const { data, error } = await supabase
      .from('events')
      .insert([{ ...eventData, organizer_id: user.id }])
      .select();
    return { data, error };
  },

  async updateEvent(id: number, eventData: Partial<EventModel>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: { message: "Harus login untuk mengedit event" } };

    const { data, error } = await supabase
      .from('events')
      .update(eventData)
      .eq('id', id)
      .eq('organizer_id', user.id) // Pastikan hanya EO pembuat yang bisa edit
      .select();
    return { data, error };
  },

  async getMyOrganizedEvents() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('organizer_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.log('Error fetch organized events', error);
      return [];
    }
    return data || [];
  },

  async uploadImage(base64Image: string, fileExt: string = 'jpeg') {
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `posters/${fileName}`;

    const { data, error } = await supabase.storage
      .from('events')
      .upload(filePath, decode(base64Image), {
        contentType: `image/${fileExt}`
      });

    if (error) {
      console.error('Upload Error:', error);
      throw error;
    }

    const { data: publicUrlData } = supabase.storage.from('events').getPublicUrl(filePath);
    return publicUrlData.publicUrl;
  }
};