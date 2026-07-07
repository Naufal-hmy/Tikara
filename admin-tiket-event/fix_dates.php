<?php

$events = \App\Models\Event::all();
$months = [
    'Jan' => '01',
    'Feb' => '02',
    'Mar' => '03',
    'Apr' => '04',
    'Mei' => '05',
    'Jun' => '06',
    'Jul' => '07',
    'Ags' => '08',
    'Agustus' => '08',
    'Sep' => '09',
    'Okt' => '10',
    'Nov' => '11',
    'Des' => '12',
    'Desember' => '12',
];

foreach ($events as $event) {
    $dateStr = trim($event->date);
    if (preg_match('/^(\d+)\s+([a-zA-Z]+)\s+(\d{4})$/', $dateStr, $matches)) {
        $day = str_pad($matches[1], 2, '0', STR_PAD_LEFT);
        $monthStr = ucfirst(strtolower($matches[2]));
        $year = $matches[3];
        
        if (isset($months[$monthStr])) {
            $month = $months[$monthStr];
            $newDate = "$year-$month-$day";
            \Illuminate\Support\Facades\DB::table('events')
                ->where('id', $event->id)
                ->update(['date' => $newDate]);
            echo "Updated $dateStr to $newDate\n";
        }
    }
}
echo "Done\n";
