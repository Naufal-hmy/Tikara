import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, Pressable, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// --- CUSTOM DATE PICKER ---
export const CustomDatePicker = ({ 
    visible, 
    onClose, 
    onSelect, 
    currentDate 
}: { 
    visible: boolean; 
    onClose: () => void; 
    onSelect: (date: string) => void;
    currentDate?: string; 
}) => {
    // Basic calendar state (simplified for this app)
    const today = new Date();
    const [selectedYear, setSelectedYear] = useState(currentDate ? parseInt(currentDate.split('-')[0]) : today.getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(currentDate ? parseInt(currentDate.split('-')[1]) : today.getMonth() + 1);

    const getDaysInMonth = (year: number, month: number) => {
        return new Date(year, month, 0).getDate();
    };

    const generateDays = () => {
        const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
        const days = [];
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(i);
        }
        return days;
    };

    const handleSelectDay = (day: number) => {
        const m = selectedMonth < 10 ? `0${selectedMonth}` : selectedMonth;
        const d = day < 10 ? `0${day}` : day;
        onSelect(`${selectedYear}-${m}-${d}`);
        onClose();
    };

    const changeMonth = (diff: number) => {
        let newMonth = selectedMonth + diff;
        let newYear = selectedYear;
        if (newMonth > 12) {
            newMonth = 1;
            newYear++;
        } else if (newMonth < 1) {
            newMonth = 12;
            newYear--;
        }
        setSelectedMonth(newMonth);
        setSelectedYear(newYear);
    };

    const monthNames = ["", "Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

    return (
        <Modal visible={visible} transparent animationType="fade">
            <Pressable style={styles.overlay} onPress={onClose}>
                <View style={styles.modalCard}>
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => changeMonth(-1)}>
                            <MaterialCommunityIcons name="chevron-left" size={30} color="#333" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>{monthNames[selectedMonth]} {selectedYear}</Text>
                        <TouchableOpacity onPress={() => changeMonth(1)}>
                            <MaterialCommunityIcons name="chevron-right" size={30} color="#333" />
                        </TouchableOpacity>
                    </View>
                    
                    <View style={styles.daysGrid}>
                        {generateDays().map(day => (
                            <TouchableOpacity 
                                key={day} 
                                style={styles.dayBtn}
                                onPress={() => handleSelectDay(day)}
                            >
                                <Text style={styles.dayText}>{day}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                        <Text style={styles.closeBtnText}>Tutup</Text>
                    </TouchableOpacity>
                </View>
            </Pressable>
        </Modal>
    );
};


// --- CUSTOM TIME PICKER ---
export const CustomTimePicker = ({ 
    visible, 
    onClose, 
    onSelect 
}: { 
    visible: boolean; 
    onClose: () => void; 
    onSelect: (time: string) => void;
}) => {
    const hours = Array.from({length: 24}, (_, i) => i < 10 ? `0${i}` : `${i}`);
    const minutes = ["00", "15", "30", "45"];
    
    const [selectedHour, setSelectedHour] = useState("19");
    const [selectedMinute, setSelectedMinute] = useState("00");

    const handleConfirm = () => {
        onSelect(`${selectedHour}:${selectedMinute}`);
        onClose();
    };

    return (
        <Modal visible={visible} transparent animationType="fade">
            <Pressable style={styles.overlay} onPress={onClose}>
                <View style={styles.modalCard}>
                    <Text style={styles.headerTitle}>Pilih Jam Acara</Text>
                    
                    <View style={styles.timePickerContainer}>
                        <View style={styles.column}>
                            <Text style={styles.colTitle}>Jam</Text>
                            <ScrollView style={styles.scrollCol} showsVerticalScrollIndicator={false}>
                                {hours.map(h => (
                                    <TouchableOpacity 
                                        key={h} 
                                        style={[styles.timeItem, selectedHour === h && styles.timeItemActive]}
                                        onPress={() => setSelectedHour(h)}
                                    >
                                        <Text style={[styles.timeText, selectedHour === h && styles.timeTextActive]}>{h}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                        
                        <Text style={styles.colon}>:</Text>
                        
                        <View style={styles.column}>
                            <Text style={styles.colTitle}>Menit</Text>
                            <ScrollView style={styles.scrollCol} showsVerticalScrollIndicator={false}>
                                {minutes.map(m => (
                                    <TouchableOpacity 
                                        key={m} 
                                        style={[styles.timeItem, selectedMinute === m && styles.timeItemActive]}
                                        onPress={() => setSelectedMinute(m)}
                                    >
                                        <Text style={[styles.timeText, selectedMinute === m && styles.timeTextActive]}>{m}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    </View>

                    <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm}>
                        <Text style={styles.confirmBtnText}>Konfirmasi Waktu</Text>
                    </TouchableOpacity>
                </View>
            </Pressable>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    modalCard: { backgroundColor: '#FFF', borderRadius: 15, padding: 20, width: '85%', maxHeight: '70%', alignItems: 'center' },
    
    // Date specific
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: 20 },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    daysGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10, marginBottom: 20 },
    dayBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 20 },
    dayText: { fontSize: 15, color: '#333' },
    closeBtn: { marginTop: 10, padding: 10 },
    closeBtnText: { color: '#E53935', fontWeight: 'bold' },

    // Time specific
    timePickerContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 250, width: '100%', marginVertical: 20 },
    column: { width: '40%', height: '100%', alignItems: 'center' },
    colTitle: { fontSize: 14, color: '#666', marginBottom: 10, fontWeight: 'bold' },
    scrollCol: { width: '100%', paddingHorizontal: 10 },
    colon: { fontSize: 30, fontWeight: 'bold', color: '#333', marginHorizontal: 10 },
    timeItem: { paddingVertical: 12, alignItems: 'center', borderRadius: 10, marginBottom: 5 },
    timeItemActive: { backgroundColor: '#E3F2FD' },
    timeText: { fontSize: 20, color: '#666' },
    timeTextActive: { color: '#1E88E5', fontWeight: 'bold' },
    confirmBtn: { backgroundColor: '#1E88E5', padding: 15, borderRadius: 10, width: '100%', alignItems: 'center' },
    confirmBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});
