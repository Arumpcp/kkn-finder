import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { initializeApp, getApps } from 'firebase/app';
import { getDatabase, onValue, ref, remove } from 'firebase/database';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { 
    ActivityIndicator, 
    Linking, 
    RefreshControl, 
    SectionList, 
    StyleSheet, 
    TouchableOpacity, 
    View, 
    Alert,
    TextInput
} from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ListLokasiScreen() {
    const [allLocations, setAllLocations] = useState([]);
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [savedLocations, setSavedLocations] = useState([]);

    const firebaseConfig = {
        apiKey: "AIzaSyDFEsdbwFIdIsEmah1WnreZdVOfwrYIR1k",
        authDomain: "reactnatice-2025.firebaseapp.com",
        databaseURL: "https://reactnatice-2025-default-rtdb.firebaseio.com",
        projectId: "reactnatice-2025",
        storageBucket: "reactnatice-2025.firebasestorage.app",
        messagingSenderId: "406629352921",
        appId: "1:406629352921:web:5ba228b5b92b16446305c8"
    };

    let app;
    if (getApps().length === 0) {
        app = initializeApp(firebaseConfig);
    } else {
        app = getApps()[0];
    }

    const db = getDatabase(app);
    const router = useRouter();

    // Load saved locations from AsyncStorage
    const loadSavedLocations = async () => {
        try {
            const saved = await AsyncStorage.getItem('saved_locations');
            if (saved) {
                setSavedLocations(JSON.parse(saved));
            }
        } catch (error) {
            console.error('Error loading saved:', error);
        }
    };

    // Check if location is saved
    const isSaved = (id) => {
        return savedLocations.some(item => item.id === id);
    };

    // Toggle save/unsave
    const toggleSave = async (item) => {
        try {
            const saved = await AsyncStorage.getItem('saved_locations');
            let savedList = saved ? JSON.parse(saved) : [];
            
            const index = savedList.findIndex(s => s.id === item.id);
            
            if (index >= 0) {
                // Unsave
                savedList.splice(index, 1);
                Alert.alert('✓ Dihapus', 'Lokasi dihapus dari tersimpan');
            } else {
                // Save
                const saveItem = {
                    id: item.id,
                    name: item.name,
                    coordinates: item.coordinates,
                    status: item.status || 'open',
                    kuotaTotal: item.kuotaTotal || 0,
                    kuotaTerisi: item.kuotaTerisi || 0,
                    deskripsi: item.deskripsi || '',
                    whatsapp: item.whatsapp || '',
                    instagram: item.instagram || '',
                    timestamp: new Date().toISOString(),
                };
                savedList.unshift(saveItem);
                Alert.alert('✓ Tersimpan', 'Lokasi ditambahkan ke tersimpan');
            }
            
            await AsyncStorage.setItem('saved_locations', JSON.stringify(savedList));
            setSavedLocations(savedList);
        } catch (error) {
            Alert.alert('Error', 'Gagal menyimpan lokasi');
        }
    };

    const getStatusColor = (status) => {
        switch(status) {
            case 'open': return '#10B981';
            case 'limited': return '#F59E0B';
            case 'full': return '#DC2626';
            default: return '#64748B';
        }
    };

    const getStatusLabel = (status) => {
        switch(status) {
            case 'open': return 'TERSEDIA';
            case 'limited': return 'HAMPIR PENUH';
            case 'full': return 'PENUH';
            default: return 'TERSEDIA';
        }
    };

    const getStatusIcon = (status) => {
        switch(status) {
            case 'open': return 'check-circle';
            case 'limited': return 'exclamation-circle';
            case 'full': return 'times-circle';
            default: return 'circle';
        }
    };

    const handleWhatsApp = (whatsapp, locationName) => {
        if (!whatsapp) {
            Alert.alert('Info', 'Nomor WhatsApp tidak tersedia');
            return;
        }

        Alert.alert(
            'Hubungi via WhatsApp',
            `Buka WhatsApp untuk menghubungi ${locationName}?`,
            [
                { text: 'Batal', style: 'cancel' },
                {
                    text: 'Buka WhatsApp',
                    onPress: () => {
                        const cleanNumber = whatsapp.replace(/[^0-9+]/g, '');
                        const phoneNumber = cleanNumber.startsWith('0') 
                            ? '62' + cleanNumber.substring(1) 
                            : cleanNumber;
                        
                        const url = `https://wa.me/${phoneNumber}`;
                        Linking.openURL(url).catch(() => {
                            Alert.alert('Error', 'Tidak dapat membuka WhatsApp');
                        });
                    }
                }
            ]
        );
    };

    const handleInstagram = (instagram, locationName) => {
        if (!instagram) {
            Alert.alert('Info', 'Instagram tidak tersedia');
            return;
        }

        Alert.alert(
            'Buka Instagram',
            `Lihat profil Instagram ${locationName}?`,
            [
                { text: 'Batal', style: 'cancel' },
                {
                    text: 'Buka Instagram',
                    onPress: () => {
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
                    }
                }
            ]
        );
    };

    const handleMaps = (coordinates, locationName) => {
        Alert.alert(
            'Buka Google Maps',
            `Lihat lokasi ${locationName} di peta?`,
            [
                { text: 'Batal', style: 'cancel' },
                {
                    text: 'Buka Maps',
                    onPress: () => {
                        const [latitude, longitude] = coordinates.split(',').map(coord => coord.trim());
                        const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
                        Linking.openURL(url);
                    }
                }
            ]
        );
    };

    const handleDelete = (id) => {
        Alert.alert(
            "Hapus Lokasi",
            "Apakah Anda yakin ingin menghapus lokasi ini?",
            [
                { text: "Batal", style: "cancel" },
                {
                    text: "Hapus",
                    onPress: () => {
                        const pointRef = ref(db, `points/${id}`);
                        remove(pointRef);
                    },
                    style: "destructive"
                }
            ]
        );
    };

    const handleEdit = (item) => {
        router.push({
            pathname: "/formeditlocation",
            params: {
                id: item.id,
                name: item.name,
                coordinates: item.coordinates,
                whatsapp: item.whatsapp || '',
                instagram: item.instagram || '',
                deskripsi: item.deskripsi || '',
                status: item.status || 'open',
                kuotaTotal: item.kuotaTotal || '',
                kuotaTerisi: item.kuotaTerisi || '',
                accuration: item.accuration || ''
            }
        });
    };

    const filterAndSearchLocations = useCallback((locations, filter, search) => {
        let filtered = locations;

        if (filter !== 'all') {
            filtered = filtered.filter(item => item.status === filter);
        }

        if (search.trim() !== '') {
            filtered = filtered.filter(item => 
                item.name.toLowerCase().includes(search.toLowerCase())
            );
        }

        // Sort alphabetically by name
        filtered.sort((a, b) => a.name.localeCompare(b.name));

        return filtered;
    }, []);

    useEffect(() => {
        loadSavedLocations();
    }, []);

    useEffect(() => {
        const filtered = filterAndSearchLocations(allLocations, selectedFilter, searchQuery);
        
        const formattedData = [{
            title: `${filtered.length} Lokasi Ditemukan`,
            data: filtered
        }];

        setSections(formattedData);
    }, [allLocations, selectedFilter, searchQuery]);

    useEffect(() => {
        const pointsRef = ref(db, 'points/');

        const unsubscribe = onValue(pointsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const pointsArray = Object.keys(data).map(key => ({
                    id: key,
                    name: data[key].name || '',
                    coordinates: data[key].coordinates || '',
                    whatsapp: data[key].whatsapp || '',
                    instagram: data[key].instagram || '',
                    deskripsi: data[key].deskripsi || '',
                    status: data[key].status || 'open',
                    kuotaTotal: data[key].kuotaTotal || 0,
                    kuotaTerisi: data[key].kuotaTerisi || 0,
                    accuration: data[key].accuration || ''
                }));

                setAllLocations(pointsArray);
            } else {
                setAllLocations([]);
            }
            setLoading(false);
        }, (error) => {
            console.error(error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

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
            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <View style={styles.searchBar}>
                    <FontAwesome5 name="search" size={16} color="#64748B" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Cari lokasi..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholderTextColor="#94A3B8"
                    />
                    {searchQuery !== '' && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <FontAwesome5 name="times-circle" size={16} color="#94A3B8" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Filter Buttons */}
            <View style={styles.filterContainer}>
                <TouchableOpacity
                    style={[
                        styles.filterButton,
                        selectedFilter === 'all' && styles.filterButtonActive
                    ]}
                    onPress={() => setSelectedFilter('all')}
                >
                    <FontAwesome5 name="list" size={14} color={selectedFilter === 'all' ? '#003D7A' : '#64748B'} />
                    <ThemedText style={[
                        styles.filterButtonText,
                        selectedFilter === 'all' && styles.filterButtonTextActive
                    ]}>
                        Semua
                    </ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.filterButton,
                        selectedFilter === 'open' && styles.filterButtonActive,
                        selectedFilter === 'open' && { borderColor: '#10B981', backgroundColor: '#DCFCE7' }
                    ]}
                    onPress={() => setSelectedFilter('open')}
                >
                    <FontAwesome5 name="check-circle" size={14} color={selectedFilter === 'open' ? '#10B981' : '#64748B'} />
                    <ThemedText style={[
                        styles.filterButtonText,
                        selectedFilter === 'open' && { color: '#166534', fontWeight: 'bold' }
                    ]}>
                        Tersedia
                    </ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.filterButton,
                        selectedFilter === 'limited' && styles.filterButtonActive,
                        selectedFilter === 'limited' && { borderColor: '#F59E0B', backgroundColor: '#FEF3C7' }
                    ]}
                    onPress={() => setSelectedFilter('limited')}
                >
                    <FontAwesome5 name="exclamation-circle" size={14} color={selectedFilter === 'limited' ? '#F59E0B' : '#64748B'} />
                    <ThemedText style={[
                        styles.filterButtonText,
                        selectedFilter === 'limited' && { color: '#92400E', fontWeight: 'bold' }
                    ]}>
                        Hampir Penuh
                    </ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.filterButton,
                        selectedFilter === 'full' && styles.filterButtonActive,
                        selectedFilter === 'full' && { borderColor: '#DC2626', backgroundColor: '#FEE2E2' }
                    ]}
                    onPress={() => setSelectedFilter('full')}
                >
                    <FontAwesome5 name="times-circle" size={14} color={selectedFilter === 'full' ? '#DC2626' : '#64748B'} />
                    <ThemedText style={[
                        styles.filterButtonText,
                        selectedFilter === 'full' && { color: '#991B1B', fontWeight: 'bold' }
                    ]}>
                        Penuh
                    </ThemedText>
                </TouchableOpacity>
            </View>

            {/* List */}
            {sections.length > 0 && sections[0].data.length > 0 ? (
                <SectionList
                    sections={sections}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => {
                        const statusColor = getStatusColor(item.status);
                        const statusLabel = getStatusLabel(item.status);
                        const statusIcon = getStatusIcon(item.status);
                        const sisa = (item.kuotaTotal || 0) - (item.kuotaTerisi || 0);

                        return (
                            <View style={[styles.card, { borderLeftColor: statusColor }]}>
                                <View style={styles.cardContent}>
                                    {/* Header with Status Badge & Save Button */}
                                    <View style={styles.cardHeader}>
                                        <View style={styles.titleContainer}>
                                            <FontAwesome5 name="map-marker-alt" size={20} color="#003D7A" />
                                            <ThemedText style={styles.locationName}>{item.name}</ThemedText>
                                        </View>
                                        <View style={styles.headerRight}>
                                            <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
                                                <FontAwesome5 name={statusIcon} size={10} color="#FFFFFF" />
                                                <ThemedText style={styles.statusText}>{statusLabel}</ThemedText>
                                            </View>
                                            <TouchableOpacity
                                                onPress={() => toggleSave(item)}
                                                style={styles.saveButton}
                                            >
                                                <FontAwesome5 
                                                    name="bookmark" 
                                                    size={22} 
                                                    color={isSaved(item.id) ? "#FDB81E" : "#CBD5E1"}
                                                    solid={isSaved(item.id)}
                                                />
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                    {/* Kuota Info */}
                                    {item.kuotaTotal > 0 && (
                                        <View style={styles.kuotaContainer}>
                                            <View style={styles.kuotaRow}>
                                                <FontAwesome5 name="users" size={14} color="#64748B" />
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
                                                            width: `${(item.kuotaTerisi / item.kuotaTotal) * 100}%`,
                                                            backgroundColor: statusColor 
                                                        }
                                                    ]} 
                                                />
                                            </View>
                                        </View>
                                    )}

                                    {/* Deskripsi */}
                                    {item.deskripsi && (
                                        <View style={styles.deskripsiContainer}>
                                            <ThemedText style={styles.deskripsiText} numberOfLines={3}>
                                                {item.deskripsi}
                                            </ThemedText>
                                        </View>
                                    )}

                                    {/* Contact Buttons */}
                                    <View style={styles.contactContainer}>
                                        {item.whatsapp && (
                                            <TouchableOpacity
                                                style={[styles.contactButton, styles.whatsappButton]}
                                                onPress={() => handleWhatsApp(item.whatsapp, item.name)}
                                            >
                                                <FontAwesome5 name="whatsapp" size={18} color="#FFFFFF" />
                                            </TouchableOpacity>
                                        )}

                                        {item.instagram && (
                                            <TouchableOpacity
                                                style={[styles.contactButton, styles.instagramButton]}
                                                onPress={() => handleInstagram(item.instagram, item.name)}
                                            >
                                                <FontAwesome5 name="instagram" size={18} color="#FFFFFF" />
                                            </TouchableOpacity>
                                        )}

                                        {item.coordinates && (
                                            <TouchableOpacity
                                                style={[styles.contactButton, styles.mapsButton]}
                                                onPress={() => handleMaps(item.coordinates, item.name)}
                                            >
                                                <FontAwesome5 name="map-marked-alt" size={18} color="#FFFFFF" />
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                </View>

                                {/* Action Buttons */}
                                <View style={styles.actionContainer}>
                                    <TouchableOpacity
                                        onPress={() => handleEdit(item)}
                                        style={styles.actionButton}
                                    >
                                        <FontAwesome5 name="pencil-alt" size={16} color="#FDB81E" />
                                        <ThemedText style={[styles.actionText, { color: '#FDB81E' }]}>Edit</ThemedText>
                                    </TouchableOpacity>
                                    <View style={styles.actionDivider} />
                                    <TouchableOpacity
                                        onPress={() => handleDelete(item.id)}
                                        style={styles.actionButton}
                                    >
                                        <FontAwesome5 name="trash" size={16} color="#DC2626" />
                                        <ThemedText style={[styles.actionText, { color: '#DC2626' }]}>Hapus</ThemedText>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        );
                    }}
                    renderSectionHeader={({ section: { title } }) => (
                        <View style={styles.sectionHeader}>
                            <View style={styles.sectionHeaderContent}>
                                <FontAwesome5 name="map-marked" size={16} color="#FDB81E" />
                                <ThemedText style={styles.sectionTitle}>{title}</ThemedText>
                            </View>
                        </View>
                    )}
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
                    <FontAwesome5 name="search" size={64} color="#CBD5E1" />
                    <ThemedText style={styles.emptyTitle}>Tidak Ada Hasil</ThemedText>
                    <ThemedText style={styles.emptyText}>
                        {searchQuery ? `Tidak ditemukan lokasi "${searchQuery}"` : 'Belum ada lokasi dengan filter ini'}
                    </ThemedText>
                </View>
            )}
        </View>
    );
}

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
    searchContainer: {
        padding: 16,
        paddingBottom: 8,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 48,
        gap: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        color: '#1E293B',
    },
    filterContainer: {
        flexDirection: 'row',
        gap: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        backgroundColor: '#FFFFFF',
    },
    filterButtonActive: {
        borderColor: '#003D7A',
        backgroundColor: '#E0F2FE',
    },
    filterButtonText: {
        fontSize: 13,
        color: '#64748B',
        fontWeight: '500',
    },
    filterButtonTextActive: {
        color: '#003D7A',
        fontWeight: 'bold',
    },
    listContent: {
        paddingVertical: 8,
    },
    sectionHeader: {
        backgroundColor: '#003D7A',
        paddingVertical: 10,
        paddingHorizontal: 16,
        marginTop: 8,
        marginHorizontal: 16,
        borderRadius: 8,
    },
    sectionHeaderContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#FFFFFF',
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
        padding: 16,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
        gap: 8,
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        flex: 1,
    },
    locationName: {
        fontSize: 17,
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
    saveButton: {
        padding: 4,
    },
    kuotaContainer: {
        backgroundColor: '#F8FAFC',
        padding: 12,
        borderRadius: 8,
        marginBottom: 12,
        gap: 6,
    },
    kuotaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    kuotaText: {
        fontSize: 14,
        color: '#64748B',
    },
    kuotaBold: {
        fontWeight: 'bold',
        color: '#1E293B',
    },
    sisaText: {
        fontSize: 12,
        fontWeight: '600',
    },
    progressBar: {
        height: 6,
        backgroundColor: '#E2E8F0',
        borderRadius: 3,
        overflow: 'hidden',
        marginTop: 4,
    },
    progressFill: {
        height: '100%',
        borderRadius: 3,
    },
    deskripsiContainer: {
        backgroundColor: '#F8FAFC',
        padding: 12,
        borderRadius: 8,
        marginBottom: 12,
        borderLeftWidth: 3,
        borderLeftColor: '#FDB81E',
    },
    deskripsiText: {
        fontSize: 13,
        color: '#475569',
        lineHeight: 18,
    },
    contactContainer: {
        flexDirection: 'row',
        gap: 8,
    },
    contactButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
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
    actionContainer: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
        backgroundColor: '#F8FAFC',
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        gap: 6,
    },
    actionDivider: {
        width: 1,
        backgroundColor: '#E2E8F0',
    },
    actionText: {
        fontSize: 13,
        fontWeight: '600',
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
    },
});