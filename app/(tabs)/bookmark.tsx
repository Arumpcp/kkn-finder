import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useRouter, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { 
    ActivityIndicator, 
    Linking, 
    RefreshControl, 
    FlatList, 
    StyleSheet, 
    TouchableOpacity, 
    View, 
    Alert
} from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import AsyncStorage from '@react-native-async-storage/async-storage';

/* =======================
   TYPE
======================= */
interface SavedLocation {
    id: string;
    name: string;
    status: 'open' | 'limited' | 'full' | string;
    kuotaTotal?: number;
    kuotaTerisi?: number;
    deskripsi?: string;
    whatsapp?: string;
    instagram?: string;
    coordinates?: string;
    timestamp: string;
}

export default function SavedLocationsScreen() {
    const [savedLocations, setSavedLocations] = useState<SavedLocation[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const router = useRouter();

    // Load saved locations from AsyncStorage
    const loadSavedLocations = async (): Promise<void> => {
        try {
            const saved = await AsyncStorage.getItem('saved_locations');
            if (saved) {
                setSavedLocations(JSON.parse(saved));
            } else {
                setSavedLocations([]);
            }
        } catch (error) {
            console.error('Error loading saved:', error);
            setSavedLocations([]);
        } finally {
            setLoading(false);
        }
    };

    // Remove from saved
    const handleUnsave = async (id: string): Promise<void> => {
        Alert.alert(
            'Hapus dari Tersimpan',
            'Hapus lokasi ini dari daftar tersimpan?',
            [
                { text: 'Batal', style: 'cancel' },
                {
                    text: 'Hapus',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const updated = savedLocations.filter(item => item.id !== id);
                            await AsyncStorage.setItem('saved_locations', JSON.stringify(updated));
                            setSavedLocations(updated);
                            Alert.alert('✓ Berhasil', 'Lokasi dihapus dari tersimpan');
                        } catch (error) {
                            Alert.alert('Error', 'Gagal menghapus');
                        }
                    }
                }
            ]
        );
    };

    // Clear all saved locations
    const handleClearAll = (): void => {
        if (savedLocations.length === 0) {
            Alert.alert('Info', 'Tidak ada lokasi tersimpan');
            return;
        }

        Alert.alert(
            'Hapus Semua',
            'Hapus semua lokasi yang tersimpan?',
            [
                { text: 'Batal', style: 'cancel' },
                {
                    text: 'Hapus Semua',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await AsyncStorage.removeItem('saved_locations');
                            setSavedLocations([]);
                            Alert.alert('✓ Berhasil', 'Semua lokasi tersimpan telah dihapus');
                        } catch (error) {
                            Alert.alert('Error', 'Gagal menghapus');
                        }
                    }
                }
            ]
        );
    };

    // Status helpers
    const getStatusColor = (status: string): string => {
        switch(status) {
            case 'open': return '#10B981';
            case 'limited': return '#F59E0B';
            case 'full': return '#DC2626';
            default: return '#64748B';
        }
    };

    const getStatusLabel = (status: string): string => {
        switch(status) {
            case 'open': return 'TERSEDIA';
            case 'limited': return 'HAMPIR PENUH';
            case 'full': return 'PENUH';
            default: return 'TERSEDIA';
        }
    };

    const getStatusIcon = (status: string) => {
        switch(status) {
            case 'open': return 'check-circle';
            case 'limited': return 'exclamation-circle';
            case 'full': return 'times-circle';
            default: return 'circle';
        }
    };

    // Contact handlers
    const handleWhatsApp = (whatsapp: string, locationName: string): void => {
        if (!whatsapp) {
            Alert.alert('Info', 'Nomor WhatsApp tidak tersedia');
            return;
        }

        const cleanNumber = whatsapp.replace(/[^0-9+]/g, '');
        const phoneNumber = cleanNumber.startsWith('0') 
            ? '62' + cleanNumber.substring(1) 
            : cleanNumber;
        
        const url = `https://wa.me/${phoneNumber}`;
        Linking.openURL(url).catch(() => {
            Alert.alert('Error', 'Tidak dapat membuka WhatsApp');
        });
    };

    const handleInstagram = (instagram: string, locationName: string): void => {
        if (!instagram) {
            Alert.alert('Info', 'Instagram tidak tersedia');
            return;
        }

        let url = instagram;
        if (instagram.includes('instagram.com')) {
            url = instagram;
        } else if (instagram.startsWith('@')) {
            url = `https://instagram.com/${instagram.substring(1)}`;
        } else {
            url = `https://instagram.com/${instagram}`;
        }

        Linking.openURL(url).catch(() => {
            Alert.alert('Error', 'Tidak dapat membuka Instagram');
        });
    };

    const handleMaps = (coordinates: string, locationName: string): void => {
        const [latitude, longitude] = coordinates.split(',').map(coord => coord.trim());
        const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
        Linking.openURL(url);
    };

    // Format saved date
    const formatSavedDate = (isoString: string): string => {
        const date = new Date(isoString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(hours / 24);

        if (hours < 1) return 'Baru saja';
        if (hours < 24) return `${hours} jam yang lalu`;
        if (days === 1) return 'Kemarin';
        if (days < 7) return `${days} hari yang lalu`;
        
        return date.toLocaleDateString('id-ID', { 
            day: 'numeric', 
            month: 'short', 
            year: 'numeric' 
        });
    };

    // Reload on screen focus
    useFocusEffect(
        useCallback(() => {
            loadSavedLocations();
        }, [])
    );

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadSavedLocations();
        setTimeout(() => {
            setRefreshing(false);
        }, 1000);
    }, []);

    if (loading) {
        return (
            <ThemedView style={styles.container}>
                <ActivityIndicator size="large" color="#003D7A" />
                <ThemedText style={styles.loadingText}>Memuat data...</ThemedText>
            </ThemedView>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <FontAwesome5 name="bookmark" size={20} color="#003D7A" solid />
                    <ThemedText style={styles.headerTitle}>
                        {savedLocations.length} Lokasi Tersimpan
                    </ThemedText>
                </View>
                {savedLocations.length > 0 && (
                    <TouchableOpacity onPress={handleClearAll} style={styles.clearButton}>
                        <ThemedText style={styles.clearButtonText}>Hapus Semua</ThemedText>
                    </TouchableOpacity>
                )}
            </View>

            {savedLocations.length > 0 ? (
                <FlatList
                    data={savedLocations}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => {
                        const statusColor = getStatusColor(item.status);
                        const statusLabel = getStatusLabel(item.status);
                        const statusIcon = getStatusIcon(item.status);
                        const sisa = (item.kuotaTotal || 0) - (item.kuotaTerisi || 0);

                        return (
                            <View style={[styles.card, { borderLeftColor: statusColor }]}>
                                <View style={styles.cardContent}>
                                    <View style={styles.cardHeader}>
                                        <View style={styles.titleContainer}>
                                            <FontAwesome5 name="map-marker-alt" size={18} color="#003D7A" />
                                            <ThemedText style={styles.locationName}>{item.name}</ThemedText>
                                        </View>
                                        <View style={styles.headerRight}>
                                            <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
                                                <FontAwesome5 name={statusIcon as any} size={10} color="#FFFFFF" />
                                                <ThemedText style={styles.statusText}>{statusLabel}</ThemedText>
                                            </View>
                                            <TouchableOpacity
                                                onPress={() => handleUnsave(item.id)}
                                                style={styles.unsaveButton}
                                            >
                                                <FontAwesome5 name="bookmark" size={20} color="#FDB81E" solid />
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                    <View style={styles.savedDateContainer}>
                                        <FontAwesome5 name="clock" size={12} color="#94A3B8" />
                                        <ThemedText style={styles.savedDateText}>
                                            Disimpan {formatSavedDate(item.timestamp)}
                                        </ThemedText>
                                    </View>

                                    {item.kuotaTotal && item.kuotaTotal > 0 && (
                                        <View style={styles.kuotaContainer}>
                                            <View style={styles.kuotaRow}>
                                                <FontAwesome5 name="users" size={12} color="#64748B" />
                                                <ThemedText style={styles.kuotaText}>
                                                    <ThemedText style={styles.kuotaBold}>{item.kuotaTerisi}</ThemedText> / {item.kuotaTotal} mahasiswa
                                                </ThemedText>
                                            </View>
                                            <ThemedText style={[styles.sisaText, { color: statusColor }]}>
                                                {sisa > 0 ? `${sisa} slot tersisa` : 'Penuh'}
                                            </ThemedText>
                                            <View style={styles.progressBar}>
                                                <View 
                                                    style={[
                                                        styles.progressFill, 
                                                        { 
                                                            width: `${((item.kuotaTerisi || 0) / item.kuotaTotal) * 100}%`,
                                                            backgroundColor: statusColor 
                                                        }
                                                    ]} 
                                                />
                                            </View>
                                        </View>
                                    )}

                                    {item.deskripsi && (
                                        <View style={styles.deskripsiContainer}>
                                            <ThemedText style={styles.deskripsiText} numberOfLines={2}>
                                                {item.deskripsi}
                                            </ThemedText>
                                        </View>
                                    )}

                                    <View style={styles.contactContainer}>
                                        {item.whatsapp && (
                                            <TouchableOpacity
                                                style={[styles.contactButton, styles.whatsappButton]}
                                                onPress={() => handleWhatsApp(item.whatsapp!, item.name)}
                                            >
                                                <FontAwesome5 name="whatsapp" size={16} color="#FFFFFF" />
                                            </TouchableOpacity>
                                        )}

                                        {item.instagram && (
                                            <TouchableOpacity
                                                style={[styles.contactButton, styles.instagramButton]}
                                                onPress={() => handleInstagram(item.instagram!, item.name)}
                                            >
                                                <FontAwesome5 name="instagram" size={16} color="#FFFFFF" />
                                            </TouchableOpacity>
                                        )}

                                        {item.coordinates && (
                                            <TouchableOpacity
                                                style={[styles.contactButton, styles.mapsButton]}
                                                onPress={() => handleMaps(item.coordinates!, item.name)}
                                            >
                                                <FontAwesome5 name="map-marked-alt" size={16} color="#FFFFFF" />
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                </View>
                            </View>
                        );
                    }}
                    refreshControl={
                        <RefreshControl 
                            refreshing={refreshing} 
                            onRefresh={onRefresh}
                            colors={['#003D7A']}
                            tintColor="#003D7A"
                        />
                    }
                    contentContainerStyle={styles.listContent}
                />
            ) : (
                <View style={styles.emptyContainer}>
                    <FontAwesome5 name="bookmark" size={64} color="#CBD5E1" />
                    <ThemedText style={styles.emptyTitle}>Belum Ada Lokasi Tersimpan</ThemedText>
                    <ThemedText style={styles.emptyText}>
                        Simpan lokasi favorit Anda dengan menekan icon bookmark di daftar lokasi
                    </ThemedText>
                    <TouchableOpacity 
                        style={styles.exploreButton}
                        onPress={() => router.push('/(tabs)/lokasi')}
                    >
                        <ThemedText style={styles.exploreButtonText}>Jelajahi Lokasi</ThemedText>
                        <FontAwesome5 name="arrow-right" size={14} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

/* STYLES — TIDAK DIUBAH */
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F1F5F9',
    },
    loadingText: {
        marginTop: 12,
        color: '#64748B',
        fontSize: 14,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#003D7A',
    },
    clearButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
        backgroundColor: '#FEE2E2',
    },
    clearButtonText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#DC2626',
    },
    listContent: {
        paddingVertical: 8,
    },
    card: {
        backgroundColor: '#FFFFFF',
        marginHorizontal: 16,
        marginVertical: 6,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderLeftWidth: 4,
    },
    cardContent: {
        padding: 14,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
        gap: 8,
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flex: 1,
    },
    locationName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#003D7A',
        flex: 1,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: 'bold',
    },
    unsaveButton: {
        padding: 4,
    },
    savedDateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 10,
    },
    savedDateText: {
        fontSize: 12,
        color: '#94A3B8',
    },
    kuotaContainer: {
        backgroundColor: '#F8FAFC',
        padding: 10,
        borderRadius: 8,
        marginBottom: 10,
        gap: 4,
    },
    kuotaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    kuotaText: {
        fontSize: 13,
        color: '#64748B',
    },
    kuotaBold: {
        fontWeight: 'bold',
        color: '#1E293B',
    },
    sisaText: {
        fontSize: 11,
        fontWeight: '600',
    },
    progressBar: {
        height: 5,
        backgroundColor: '#E2E8F0',
        borderRadius: 3,
        overflow: 'hidden',
        marginTop: 2,
    },
    progressFill: {
        height: '100%',
        borderRadius: 3,
    },
    deskripsiContainer: {
        backgroundColor: '#F8FAFC',
        padding: 10,
        borderRadius: 8,
        marginBottom: 10,
        borderLeftWidth: 3,
        borderLeftColor: '#FDB81E',
    },
    deskripsiText: {
        fontSize: 12,
        color: '#475569',
        lineHeight: 16,
    },
    contactContainer: {
        flexDirection: 'row',
        gap: 6,
    },
    contactButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        borderRadius: 8,
    },
    whatsappButton: {
        backgroundColor: '#25D366',
    },
    instagramButton: {
        backgroundColor: '#E4405F',
    },
    mapsButton: {
        backgroundColor: '#003D7A',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#334155',
        marginTop: 16,
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 14,
        color: '#64748B',
        textAlign: 'center',
        marginBottom: 24,
    },
    exploreButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#003D7A',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },
    exploreButtonText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: 'bold',
    },
});
