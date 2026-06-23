const { Client } = require('pg');

const client = new Client({
  host: 'aws-1-ap-southeast-1.pooler.supabase.com',
  port: 6543,
  database: 'postgres',
  user: 'postgres.jknlvnvdlzxsxllrtpze',
  password: 'TikaraUndira',
  ssl: { rejectUnauthorized: false }
});

async function seed() {
  await client.connect();
  console.log('Connected to DB');

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

  for (const e of events) {
    const res = await client.query(`
      INSERT INTO events (title, category, date, time, location, address_detail, price, total_quota, remaining_quota, image_url, description, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING id, title
    `, [e.title, e.category, e.date, e.time, e.location, e.address_detail, e.price, e.total_quota, e.remaining_quota, e.image_url, e.description, e.status]);
    
    console.log('Inserted:', res.rows[0].title);
  }

  await client.end();
}

seed().catch(err => console.error(err));
