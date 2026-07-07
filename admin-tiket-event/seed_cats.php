<?php
$cats = ['Musik', 'Olahraga', 'Workshop', 'Seminar', 'Pameran', 'Hiburan', 'Seni', 'Festival', 'Konser', 'Teater', 'Lainnya'];
foreach($cats as $cat) {
    \App\Models\Category::firstOrCreate([
        'name' => $cat,
        'slug' => \Illuminate\Support\Str::slug($cat)
    ]);
}
echo 'Categories Seeded!';
