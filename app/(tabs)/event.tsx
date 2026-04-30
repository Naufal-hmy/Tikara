import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { eventService } from '../../services/eventService';
import { orderService } from '../../services/orderService';

const { width } = Dimensions.get('window');
const CELL_SIZE = (width - 40 - 30) / 7;

// Warna per kategori event
const CATEGORY_COLORS: Record<string, string> = {
    'Musik': '#1E88E5',
    'Festival': '#E53935',
    'Teater': '#FF6F00',
    'Seni': '#8E24AA',
    'Seminar': '#43A047',
};

const getCategoryColor = (category: string) => {
    return CATEGORY_COLORS[category] || '#1E88E5';
};

export default function EventScreen() {
    const dayLabels = ['MIN', 'SEN', 'SEL', 'RAB', 'KAM', 'JUM', 'SAB'];
    const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

    const today = new Date();
    const [currentMonth, setCurrentMonth] = useState(today.getMonth());
    const [currentYear, setCurrentYear] = useState(today.getFullYear());
    const [ticketDates, setTicketDates] = useState<number[]>([]);

    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

    const [selectedDate, setSelectedDate] = useState<number | null>(null);
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    React.useEffect(() => {
        loadEvents();
        orderService.getMyTickets().then(tickets => {
            const daysArr = tickets.map(t => {
                if (t.events?.date) {
                    const matchesMonth = t.events.date.includes(monthNames[currentMonth]);
                    if (!matchesMonth) return -1;
                    const parts = t.events.date.split(' ');
                    return parseInt(parts[0]);
                }
                return -1;
            }).filter(d => d > 0);
            setTicketDates(daysArr);
        });
    }, [currentMonth, currentYear]);

    const prevMonth = () => {
        if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(currentYear - 1); }
        else { setCurrentMonth(currentMonth - 1); }
        setSelectedDate(null);
    };
    const nextMonth = () => {
        if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(currentYear + 1); }
        else { setCurrentMonth(currentMonth + 1); }
        setSelectedDate(null);
    };

    const loadEvents = async () => {
        try {
            setLoading(true);
            const data = await eventService.getAllEvents();
            setEvents(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const parseEventDate = (dateStr: string) => {
        if (!dateStr) return null;
        const parts = dateStr.split(' ');
        if (parts.length < 3) return null;
        const day = parseInt(parts[0]);
        const monthStr = parts[1];
        let monthIdx = monthNames.findIndex(m => m.toLowerCase().startsWith(monthStr.toLowerCase().substring(0, 3)));
        if (monthIdx === -1) return null;
        const year = parseInt(parts[2]);
        return { day, month: monthIdx, year };
    };

    const filteredEvents = selectedDate !== null
      ? events.filter(e => {
          const parsed = parseEventDate(e.date);
          if (!parsed) return false;
          return parsed.day === selectedDate && parsed.month === currentMonth && parsed.year === currentYear;
        })
      : events.filter(e => {
          const parsed = parseEventDate(e.date);
          if (!parsed) return false;
          return parsed.month === currentMonth && parsed.year === currentYear;
        });

    // Map tanggal → kategori event (untuk warna angka tanggal)
    const dateEventMap: Record<number, string[]> = {};
    events.forEach(e => {
        const parsed = parseEventDate(e.date);
        if (parsed && parsed.month === currentMonth && parsed.year === currentYear) {
            if (!dateEventMap[parsed.day]) dateEventMap[parsed.day] = [];
            if (!dateEventMap[parsed.day].includes(e.category)) {
                dateEventMap[parsed.day].push(e.category);
            }
        }
    });

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Event</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                {/* Card Kalender */}
                <View style={styles.calendarCard}>
                    <View style={styles.calendarHeader}>
                        <TouchableOpacity onPress={prevMonth}><MaterialCommunityIcons name="chevron-left" size={24} color="#A0A0A0" /></TouchableOpacity>
                        <Text style={styles.monthTitle}>{monthNames[currentMonth]} {currentYear}</Text>
                        <TouchableOpacity onPress={nextMonth}><MaterialCommunityIcons name="chevron-right" size={24} color="#A0A0A0" /></TouchableOpacity>
                    </View>

                    {/* Nama Hari */}
                    <View style={styles.daysContainer}>
                        {dayLabels.map((day, index) => (
                            <Text key={index} style={[styles.dayText, { width: CELL_SIZE }]}>{day}</Text>
                        ))}
                    </View>

                    {/* Grid Tanggal */}
                    <View style={styles.datesGrid}>
                        {/* Empty cells */}
                        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                            <View key={`empty-${i}`} style={{ width: CELL_SIZE, height: CELL_SIZE }} />
                        ))}

                        {/* Tanggal */}
                        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((date) => {
                            const isSelected = selectedDate === date;
                            const isToday = date === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
                            const hasTicket = ticketDates.includes(date);
                            const eventCategories = dateEventMap[date] || [];
                            const hasEvent = eventCategories.length > 0;

                            // Warna angka: berdasarkan kategori event pertama di tanggal itu
                            const eventColor = hasEvent ? getCategoryColor(eventCategories[0]) : undefined;

                            return (
                                <View key={date} style={{ alignItems: 'center', width: CELL_SIZE }}>
                                    <TouchableOpacity
                                        activeOpacity={0.7}
                                        style={[
                                            styles.dateItem,
                                            isToday && !isSelected && styles.todayDateBg,
                                            isSelected && styles.selectedDateBg,
                                            hasEvent && !isSelected && { backgroundColor: eventColor + '18' },
                                        ]}
                                        onPress={() => setSelectedDate(selectedDate === date ? null : date)}
                                    >
                                        <Text style={[
                                            styles.dateText,
                                            isToday && !isSelected && styles.todayText,
                                            isSelected && styles.selectedText,
                                            hasEvent && !isSelected && { color: eventColor, fontWeight: 'bold' },
                                        ]}>
                                            {date}
                                        </Text>
                                    </TouchableOpacity>
                                    {/* Titik kecil multi-warna di bawah tanggal jika ada beberapa kategori */}
                                    {hasEvent && !isSelected && (
                                        <View style={{ flexDirection: 'row', gap: 2, marginTop: -2 }}>
                                            {eventCategories.slice(0, 3).map((cat, ci) => (
                                                <View key={ci} style={{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: getCategoryColor(cat) }} />
                                            ))}
                                        </View>
                                    )}
                                    {hasTicket && !hasEvent && <View style={[styles.ticketDot, { backgroundColor: '#1E88E5' }]} />}
                                </View>
                            );
                        })}
                    </View>

                    {/* Legend warna kategori */}
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 15 }}>
                        {Object.entries(CATEGORY_COLORS).map(([cat, color]) => (
                            <View key={cat} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: color }} />
                                <Text style={{ fontSize: 10, color: '#666' }}>{cat}</Text>
                            </View>
                        ))}
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <View style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: '#1E88E5', borderWidth: 1, borderColor: '#1565C0' }} />
                            <Text style={{ fontSize: 10, color: '#666' }}>Tiket Saya</Text>
                        </View>
                    </View>
                </View>

                {/* Info */}
                {selectedDate !== null && (
                    <Text style={{ paddingHorizontal: 20, marginBottom: 10, color: '#666', fontSize: 13 }}>
                        Event pada {selectedDate} {monthNames[currentMonth]} {currentYear}
                    </Text>
                )}

                {/* List Event */}
                <View style={styles.eventList}>
                    {loading ? (
                       <Text style={{ textAlign: 'center', marginTop: 20 }}>Memuat...</Text>
                    ) : filteredEvents.length === 0 ? (
                       <Text style={{ textAlign: 'center', marginTop: 20, color: '#999' }}>
                         {selectedDate !== null ? 'Tidak ada event di tanggal ini.' : 'Tidak ada event bulan ini.'}
                       </Text>
                    ) : filteredEvents.map((eventData: any) => (
                       <EventItem
                           key={eventData.id}
                           id={eventData.id}
                           image={eventData.image_url}
                           title={eventData.title}
                           category={eventData.category || 'Event'}
                           promotor="Tikara Partner"
                           location={eventData.location}
                           date={eventData.date}
                           price={`IDR ${eventData.price?.toLocaleString('id-ID')}`}
                       />
                    ))}
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

// --- Komponen Item Event ---
const EventItem = ({ image, title, category, promotor, location, date, price, id }: { image: string, title: string, category: string, promotor: string, location: string, date: string, price: string, id: number }) => {
    const [isBookmarked, setIsBookmarked] = useState(false);
    const categoryColor = getCategoryColor(category);

    return (
        <TouchableOpacity style={styles.eventCard} activeOpacity={0.8}
            onPress={() => router.push({ pathname: '/event-detail', params: { id } })}>
            <View style={styles.imageWrapper}>
                <Image source={{ uri: image }} style={styles.eventImage} />
                <TouchableOpacity style={styles.heartBtn} onPress={async () => {
                    const result = await eventService.toggleBookmark(id);
                    setIsBookmarked(result);
                }}>
                    <MaterialCommunityIcons name={isBookmarked ? "bookmark" : "bookmark-outline"} size={20} color="#1E88E5" />
                </TouchableOpacity>
            </View>

            <View style={styles.eventInfo}>
                <Text style={styles.eventTitle}>{title}</Text>

                <View style={[styles.tagBadge, { backgroundColor: categoryColor + '15' }]}>
                    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: categoryColor }} />
                    <Text style={[styles.tagText, { color: categoryColor }]}>{category}</Text>
                </View>

                <View style={styles.detailRow}>
                    <MaterialCommunityIcons name="account" size={14} color="#666" />
                    <Text style={styles.detailText}>Diselenggarakan <Text style={{ color: '#52A3DB' }}>{promotor}</Text></Text>
                </View>

                <View style={styles.detailRow}>
                    <MaterialCommunityIcons name="map-marker-outline" size={14} color="#666" />
                    <Text style={styles.detailText}>{location}</Text>
                </View>

                <View style={styles.detailRow}>
                    <MaterialCommunityIcons name="calendar-month-outline" size={14} color="#666" />
                    <Text style={styles.detailText}>{date}</Text>
                </View>

                <Text style={styles.priceText}>{price}</Text>
            </View>
        </TouchableOpacity>
    );
}

// --- Styles ---
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    header: { paddingHorizontal: 20, paddingVertical: 15 },
    headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#000' },
    scrollContent: { paddingBottom: 30 },

    calendarCard: {
        backgroundColor: '#FFFFFF',
        marginHorizontal: 20,
        borderRadius: 15,
        padding: 15,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        marginBottom: 25
    },
    calendarHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    monthTitle: { fontSize: 16, fontWeight: 'bold', color: '#1E3A5F' },
    daysContainer: { flexDirection: 'row', justifyContent: 'flex-start', marginBottom: 10 },
    dayText: { textAlign: 'center', fontSize: 12, color: '#A0A0A0', fontWeight: 'bold' },
    datesGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start' },

    dateItem: {
        width: CELL_SIZE - 6,
        height: CELL_SIZE - 6,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 4,
        borderRadius: (CELL_SIZE - 6) / 2,
    },
    dateText: { fontSize: 14, color: '#1E3A5F' },

    todayDateBg: { backgroundColor: '#E3F2FD' },
    todayText: { color: '#1E88E5', fontWeight: 'bold' },
    selectedDateBg: { backgroundColor: '#1E88E5' },
    selectedText: { color: '#FFFFFF', fontWeight: 'bold' },
    ticketDot: { width: 5, height: 5, backgroundColor: '#1E88E5', borderRadius: 2.5, marginTop: -2 },

    eventList: { paddingHorizontal: 20, gap: 15 },
    eventCard: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderRadius: 15,
        padding: 12,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        borderWidth: 1,
        borderColor: '#F5F5F5'
    },
    imageWrapper: { position: 'relative' },
    eventImage: { width: 100, height: 125, borderRadius: 12, backgroundColor: '#EEE' },
    heartBtn: { position: 'absolute', top: 5, left: 5, backgroundColor: '#FFF', padding: 5, borderRadius: 15, elevation: 2 },
    eventInfo: { flex: 1, marginLeft: 15, justifyContent: 'space-between' },
    eventTitle: { fontSize: 15, fontWeight: 'bold', color: '#1E3A5F', marginBottom: 4 },
    tagBadge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, gap: 4, marginBottom: 4 },
    tagText: { fontSize: 10, fontWeight: 'bold' },
    detailRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
    detailText: { fontSize: 11, color: '#666' },
    priceText: { fontSize: 14, fontWeight: 'bold', color: '#E53935', textAlign: 'right', marginTop: 5 }
});