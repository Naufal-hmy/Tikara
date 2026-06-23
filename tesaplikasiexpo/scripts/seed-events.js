const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://jknlvnvdlzxsxllrtpze.supabase.co';
const supabaseAnonKey = 'sb_publishable_IP8L4cs26G6slnMJkj9gew_RfAm19ZR';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function seed() {
  const events = [
    {
      title: 'Konser Kemerdekaan 2026',
      category: 'Konser',
      date: '17 Agustus 2026',
      time: '19:00 WIB',
      location: 'Jakarta',
      address_detail: 'Gelora Bung Karno',
      price: 500000,
      total_quota: 1000,
      remaining_quota: 1000,
      image_url: 'https://picsum.photos/600/400?random=20',
      description: 'Konser musik merayakan kemerdekaan Indonesia dengan artis papan atas.',
      status: 'published'
    },
    {
      title: 'Tech Expo Indonesia 2026',
      category: 'Pameran',
      date: '10 Juli 2026',
      time: '09:00 WIB',
      location: 'Jakarta',
      address_detail: 'JCC Senayan',
      price: 150000,
      total_quota: 500,
      remaining_quota: 500,
      image_url: 'https://picsum.photos/600/400?random=21',
      description: 'Pameran teknologi terbesar di Indonesia tahun 2026.',
      status: 'published'
    },
    {
      title: 'Stand Up Comedy Fest',
      category: 'Hiburan',
      date: '28 Juli 2026',
      time: '20:00 WIB',
      location: 'Bandung',
      address_detail: 'Sabuga ITB',
      price: 250000,
      total_quota: 800,
      remaining_quota: 800,
      image_url: 'https://picsum.photos/600/400?random=22',
      description: 'Festival Stand Up Comedy terbesar dengan komika ternama dari seluruh Indonesia.',
      status: 'published'
    }
  ];

  console.log('Seeding events...');
  const { data, error } = await supabase.from('events').insert(events).select();
  
  if (error) {
    console.error('Error seeding events:', error);
  } else {
    console.log('Successfully seeded events:', data.map(e => e.title));
  }
}

seed();
