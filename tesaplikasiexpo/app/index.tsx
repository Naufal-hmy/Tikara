import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { ClipPath, Defs, G, Line, Path, Rect } from 'react-native-svg';

export default function SplashScreen() {
    useEffect(() => {
        const timer = setTimeout(() => {
            router.replace('/login');
        }, 2500);
        return () => clearTimeout(timer);
    }, []);

    return (
        <View style={styles.container}>
            <View style={styles.logoWrapper}>
                <Svg width={260} height={160} viewBox="0 0 260 160">
                    <Defs>
                        <ClipPath id="ticketClip">
                            <Path d={`
                                M 18 0
                                L 242 0
                                Q 260 0, 260 18
                                L 260 60
                                A 14 14 0 0 1 260 88
                                L 260 142
                                Q 260 160, 242 160
                                L 18 160
                                Q 0 160, 0 142
                                L 0 88
                                A 14 14 0 0 1 0 60
                                L 0 18
                                Q 0 0, 18 0
                                Z
                            `} />
                        </ClipPath>
                    </Defs>

                    <G clipPath="url(#ticketClip)">
                        <Rect x="0" y="0" width="185" height="160" fill="#FFFFFF" />
                        <Rect x="185" y="0" width="75" height="160" fill="#E3F2FD" />
                        <Rect x="185" y="0" width="4" height="160" fill="#BBDEFB" />
                    </G>

                    <Line x1="185" y1="12" x2="185" y2="148" stroke="#BBDEFB" strokeWidth="1.5" strokeDasharray="5,4" />

                    <Rect x="200" y="35" width="3" height="30" rx="1" fill="#90CAF9" />
                    <Rect x="207" y="30" width="3" height="40" rx="1" fill="#64B5F6" />
                    <Rect x="214" y="35" width="3" height="30" rx="1" fill="#90CAF9" />
                    <Rect x="221" y="28" width="3" height="44" rx="1" fill="#42A5F5" />
                    <Rect x="228" y="33" width="3" height="34" rx="1" fill="#90CAF9" />
                    <Rect x="235" y="38" width="3" height="24" rx="1" fill="#64B5F6" />

                    <Rect x="208" y="95" width="25" height="3" rx="1" fill="#BBDEFB" />
                    <Rect x="208" y="103" width="18" height="3" rx="1" fill="#BBDEFB" />
                    <Rect x="208" y="111" width="30" height="3" rx="1" fill="#BBDEFB" />
                </Svg>

                <View style={styles.textOverlay}>
                    <Text style={styles.logoText}>Tikara</Text>
                    <Text style={styles.tagline}>EVENT TICKETS PLATFORM</Text>
                </View>
            </View>

            <Text style={styles.versionText}>Version 1.0</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1E3A5F',
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoWrapper: {
        position: 'relative',
        width: 260,
        height: 160,
    },
    textOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: 185,
        height: 160,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoText: {
        fontSize: 38,
        fontWeight: '900',
        color: '#1E3A5F',
        letterSpacing: 2,
    },
    tagline: {
        fontSize: 8,
        color: '#90CAF9',
        marginTop: 4,
        letterSpacing: 3,
        fontWeight: '600',
    },
    versionText: {
        position: 'absolute',
        bottom: 50,
        color: 'rgba(255,255,255,0.35)',
        fontSize: 14,
    },
});