import { supabase } from '../lib/supabase';

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
    const { data, error } = await supabase
      .from('events')
      .insert([eventData])
      .select();
    return { data, error };
  }
};