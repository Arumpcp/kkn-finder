import * as Location from 'expo-location';
import { Stack } from 'expo-router';
import { initializeApp, getApps } from "firebase/app";
import { getDatabase, push, ref } from "firebase/database";
import React, { useState } from 'react';
import { 
    Alert, 
    Button, 
    ScrollView, 
    StyleSheet, 
    Text, 
    TextInput, 
    View, 
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    Keyboard,
    TouchableWithoutFeedback
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';

const App = () => {
    const [name, setName] = useState('');
    const [location, setLocation] = useState('');
    const [instagram, setInstagram] = useState('');
    const [whatsapp, setWhatsapp] = useState('');
    const [deskripsi, setDeskripsi] = useState('');
    const [accuracy, setAccuracy] = useState('');
    const [status, setStatus] = useState('open');
    const [kuotaTotal, setKuotaTotal] = useState('');
    const [kuotaTerisi, setKuotaTerisi] = useState('');

    // Get current location
    const getCoordinates = async () => {
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            
            if (status !== 'granted') {
                Alert.alert(
                    'Izin Lokasi Diperlukan', 
                    'Aplikasi memerlukan izin lokasi untuk mengambil koordinat GPS. Silakan aktifkan di pengaturan.',
                    [{ text: 'OK' }]
                );
                return;
            }

            Alert.alert('Mohon Tunggu', 'Sedang mengambil lokasi GPS...');

            let location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Lowest,
                maximumAge: 10000,
                timeout: 20000,
            });

            const coords = location.coords.latitude + ',' + location.coords.longitude;
            setLocation(coords);

            const accuracy = location.coords.accuracy;
            setAccuracy(accuracy.toFixed(2) + ' m');

            Alert.alert('Berhasil!', `Lokasi berhasil diambil!\n\nKoordinat: ${coords}\nAkurasi: ${accuracy.toFixed(2)}m`);
            
        } catch (error) {
            console.error('Error getting location:', error);
            
            try {
                let lastLocation = await Location.getLastKnownPositionAsync({
                    maxAge: 60000,
                    requiredAccuracy: 1000,
                });
                
                if (lastLocation) {
                    const coords = lastLocation.coords.latitude + ',' + lastLocation.coords.longitude;
                    setLocation(coords);
                    setAccuracy(lastLocation.coords.accuracy.toFixed(2) + ' m');
                    
                    Alert.alert(
                        'Lokasi Terakhir Digunakan', 
                        `Menggunakan lokasi terakhir yang diketahui:\n\n${coords}\n\nAkurasi: ${lastLocation.coords.accuracy.toFixed(2)}m`
                    );
                    return;
                }
            } catch (lastError) {
                console.error('Error getting last location:', lastError);
            }
            
            Alert.alert(
                'Tidak Dapat Mengambil Lokasi',
                'Pastikan:\n\n' +
                '1. GPS aktif di perangkat\n' +
                '2. Izin lokasi sudah diberikan\n' +
                '3. (Emulator) Set lokasi di Extended Controls\n\n' +
                'Atau isi koordinat secara manual.',
                [{ text: 'OK' }]
            );
        }
    };

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

    const handleSave = () => {
        if (!name.trim()) {
            Alert.alert('Error', 'Nama lokasi harus diisi!');
            return;
        }
        if (!location.trim()) {
            Alert.alert('Error', 'Koordinat harus diisi!');
            return;
        }
        if (!kuotaTotal.trim()) {
            Alert.alert('Error', 'Kuota total harus diisi!');
            return;
        }
        if (!kuotaTerisi.trim()) {
            Alert.alert('Error', 'Kuota terisi harus diisi!');
            return;
        }

        const total = parseInt(kuotaTotal);
        const terisi = parseInt(kuotaTerisi);

        if (isNaN(total) || total <= 0) {
            Alert.alert('Error', 'Kuota total harus berupa angka positif!');
            return;
        }
        if (isNaN(terisi) || terisi < 0) {
            Alert.alert('Error', 'Kuota terisi harus berupa angka (0 atau lebih)!');
            return;
        }
        if (terisi > total) {
            Alert.alert('Error', 'Kuota terisi tidak boleh lebih dari kuota total!');
            return;
        }

        const locationsRef = ref(db, 'points/');
        push(locationsRef, {
            name: name,
            coordinates: location,
            instagram: instagram,
            whatsapp: whatsapp,
            deskripsi: deskripsi,
            accuration: accuracy,
            status: status,
            kuotaTotal: parseInt(kuotaTotal),
            kuotaTerisi: parseInt(kuotaTerisi),
            timestamp: Date.now(),
        }).then(() => {
            Alert.alert('Berhasil!', 'Data lokasi berhasil disimpan', [
                {
                    text: 'OK',
                    onPress: () => {
                        setName('');
                        setLocation('');
                        setInstagram('');
                        setWhatsapp('');
                        setDeskripsi('');
                        setAccuracy('');
                        setStatus('open');
                        setKuotaTotal('');
                        setKuotaTerisi('');
                    }
                }
            ]);
        }).catch((e) => {
            console.error("Error adding document: ", e);
            Alert.alert("Error", "Gagal menyimpan data");
        });
    };

    const getStatusIcon = (statusValue) => {
        switch(statusValue) {
            case 'open': return 'check-circle';
            case 'limited': return 'exclamation-circle';
            case 'full': return 'times-circle';
            default: return 'circle';
        }
    };

    const updateStatusFromKuota = (total, terisi) => {
        const totalNum = parseInt(total) || 0;
        const terisiNum = parseInt(terisi) || 0;
        
        if (totalNum === 0) return;
        
        const sisaPercentage = ((totalNum - terisiNum) / totalNum) * 100;
        
        if (sisaPercentage <= 0) {
            setStatus('full');
        } else if (sisaPercentage <= 30) {
            setStatus('limited');
        } else {
            setStatus('open');
        }
    };

    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.container} edges={['top']}>
                <Stack.Screen
                    options={{
                        title: 'Form Input Lokasi',
                        headerStyle: {
                            backgroundColor: '#003D7A',
                        },
                        headerTintColor: '#fff',
                    }}
                />
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.keyboardAvoid}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
                >
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <ScrollView 
                            style={styles.scrollView}
                            contentContainerStyle={styles.scrollContent}
                            keyboardShouldPersistTaps="handled"
                            showsVerticalScrollIndicator={false}
                        >
                            <View style={styles.formContainer}>
                                {/* Nama Lokasi */}
                                <Text style={styles.inputTitle}>Nama Lokasi <Text style={styles.required}>*</Text></Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder='Contoh: Pantai Parangtritis'
                                    value={name}
                                    onChangeText={setName}
                                    placeholderTextColor="#94A3B8"
                                />

                                {/* Koordinat */}
                                <Text style={styles.inputTitle}>Koordinat <Text style={styles.required}>*</Text></Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Contoh: -8.0245,110.3294"
                                    value={location}
                                    onChangeText={setLocation}
                                    placeholderTextColor="#94A3B8"
                                    keyboardType="numbers-and-punctuation"
                                />

                                {/* Button Get Location */}
                                <View style={styles.buttonLocation}>
                                    <Button
                                        title="📍 Ambil Lokasi Saat Ini"
                                        onPress={getCoordinates}
                                        color="#003D7A"
                                    />
                                </View>

                                {/* Accuracy Info */}
                                {accuracy !== '' && (
                                    <View style={styles.accuracyInfo}>
                                        <Text style={styles.accuracyText}>✓ Akurasi GPS: {accuracy}</Text>
                                    </View>
                                )}

                                {/* Kuota Section */}
                                <View style={styles.kuotaSection}>
                                    <Text style={styles.sectionTitle}>
                                        <FontAwesome5 name="users" size={16} color="#003D7A" /> Kuota Pendaftaran
                                    </Text>
                                    
                                    <View style={styles.kuotaRow}>
                                        <View style={styles.kuotaInputContainer}>
                                            <Text style={styles.inputTitle}>Kuota Total <Text style={styles.required}>*</Text></Text>
                                            <TextInput
                                                style={styles.input}
                                                placeholder='Contoh: 20'
                                                value={kuotaTotal}
                                                onChangeText={(text) => {
                                                    setKuotaTotal(text);
                                                    updateStatusFromKuota(text, kuotaTerisi);
                                                }}
                                                placeholderTextColor="#94A3B8"
                                                keyboardType="number-pad"
                                            />
                                        </View>

                                        <View style={styles.kuotaInputContainer}>
                                            <Text style={styles.inputTitle}>Terisi <Text style={styles.required}>*</Text></Text>
                                            <TextInput
                                                style={styles.input}
                                                placeholder='Contoh: 5'
                                                value={kuotaTerisi}
                                                onChangeText={(text) => {
                                                    setKuotaTerisi(text);
                                                    updateStatusFromKuota(kuotaTotal, text);
                                                }}
                                                placeholderTextColor="#94A3B8"
                                                keyboardType="number-pad"
                                            />
                                        </View>
                                    </View>

                                    {/* Kuota Info Display */}
                                    {kuotaTotal !== '' && kuotaTerisi !== '' && (
                                        <View style={styles.kuotaInfo}>
                                            <View style={styles.kuotaInfoRow}>
                                                <FontAwesome5 name="users" size={14} color="#64748B" />
                                                <Text style={styles.kuotaInfoText}>
                                                    Sisa Kuota: <Text style={styles.kuotaInfoBold}>
                                                        {parseInt(kuotaTotal) - parseInt(kuotaTerisi)} orang
                                                    </Text>
                                                </Text>
                                            </View>
                                            <View style={styles.progressBar}>
                                                <View 
                                                    style={[
                                                        styles.progressFill, 
                                                        { 
                                                            width: `${(parseInt(kuotaTerisi) / parseInt(kuotaTotal)) * 100}%`,
                                                            backgroundColor: 
                                                                status === 'full' ? '#DC2626' : 
                                                                status === 'limited' ? '#F59E0B' : 
                                                                '#10B981'
                                                        }
                                                    ]} 
                                                />
                                            </View>
                                        </View>
                                    )}
                                </View>

                                {/* Status/Kategori */}
                                <Text style={styles.inputTitle}>Status Pendaftaran <Text style={styles.required}>*</Text></Text>
                                <View style={styles.statusContainer}>
                                    <TouchableOpacity
                                        style={[
                                            styles.statusButton,
                                            status === 'open' && styles.statusButtonActive,
                                            status === 'open' && { borderColor: '#10B981', backgroundColor: '#DCFCE7' }
                                        ]}
                                        onPress={() => setStatus('open')}
                                    >
                                        <FontAwesome5 
                                            name={getStatusIcon('open')} 
                                            size={20} 
                                            color={status === 'open' ? '#10B981' : '#94A3B8'} 
                                        />
                                        <Text style={[
                                            styles.statusButtonText,
                                            status === 'open' && { color: '#166534', fontWeight: 'bold' }
                                        ]}>
                                            Tersedia
                                        </Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[
                                            styles.statusButton,
                                            status === 'limited' && styles.statusButtonActive,
                                            status === 'limited' && { borderColor: '#F59E0B', backgroundColor: '#FEF3C7' }
                                        ]}
                                        onPress={() => setStatus('limited')}
                                    >
                                        <FontAwesome5 
                                            name={getStatusIcon('limited')} 
                                            size={20} 
                                            color={status === 'limited' ? '#F59E0B' : '#94A3B8'} 
                                        />
                                        <Text style={[
                                            styles.statusButtonText,
                                            status === 'limited' && { color: '#92400E', fontWeight: 'bold' }
                                        ]}>
                                            Hampir Penuh
                                        </Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[
                                            styles.statusButton,
                                            status === 'full' && styles.statusButtonActive,
                                            status === 'full' && { borderColor: '#DC2626', backgroundColor: '#FEE2E2' }
                                        ]}
                                        onPress={() => setStatus('full')}
                                    >
                                        <FontAwesome5 
                                            name={getStatusIcon('full')} 
                                            size={20} 
                                            color={status === 'full' ? '#DC2626' : '#94A3B8'} 
                                        />
                                        <Text style={[
                                            styles.statusButtonText,
                                            status === 'full' && { color: '#991B1B', fontWeight: 'bold' }
                                        ]}>
                                            Penuh
                                        </Text>
                                    </TouchableOpacity>
                                </View>

                                {/* WhatsApp */}
                                <Text style={styles.inputTitle}>WhatsApp Narahubung</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder='Contoh: 081234567890 atau +6281234567890'
                                    value={whatsapp}
                                    onChangeText={setWhatsapp}
                                    placeholderTextColor="#94A3B8"
                                    keyboardType="phone-pad"
                                />

                                {/* Instagram */}
                                <Text style={styles.inputTitle}>Instagram</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder='Contoh: @kknugm atau https://instagram.com/kknugm'
                                    value={instagram}
                                    onChangeText={setInstagram}
                                    placeholderTextColor="#94A3B8"
                                    autoCapitalize="none"
                                />

                                {/* Deskripsi */}
                                <Text style={styles.inputTitle}>Deskripsi</Text>
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    placeholder='Contoh: Lokasi KKN di pantai selatan, tema pemberdayaan masyarakat pesisir...'
                                    value={deskripsi}
                                    onChangeText={setDeskripsi}
                                    placeholderTextColor="#94A3B8"
                                    multiline
                                    numberOfLines={4}
                                    textAlignVertical="top"
                                />

                                {/* Save Button */}
                                <View style={styles.buttonSave}>
                                    <Button
                                        title="💾 Simpan Lokasi"
                                        onPress={handleSave}
                                        color="#10B981"
                                    />
                                </View>
                            </View>
                        </ScrollView>
                    </TouchableWithoutFeedback>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </SafeAreaProvider>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F1F5F9',
    },
    keyboardAvoid: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: 40, // Extra padding biar button ga ketutup
    },
    formContainer: {
        padding: 16,
    },
    inputTitle: {
        marginLeft: 4,
        marginTop: 12,
        marginBottom: 8,
        fontSize: 15,
        fontWeight: '600',
        color: '#1E293B',
    },
    required: {
        color: '#DC2626',
    },
    input: {
        backgroundColor: '#FFFFFF',
        height: 48,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 15,
        color: '#1E293B',
    },
    textArea: {
        height: 120,
        paddingTop: 12,
        paddingBottom: 12,
    },
    buttonLocation: {
        marginTop: 8,
        marginBottom: 8,
        borderRadius: 12,
        overflow: 'hidden',
    },
    buttonSave: {
        marginTop: 24,
        marginBottom: 32,
        borderRadius: 12,
        overflow: 'hidden',
    },
    accuracyInfo: {
        backgroundColor: '#DCFCE7',
        padding: 12,
        borderRadius: 8,
        marginTop: 8,
        marginBottom: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#10B981',
    },
    accuracyText: {
        color: '#166534',
        fontSize: 14,
        fontWeight: '500',
    },
    kuotaSection: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginTop: 16,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#003D7A',
        marginBottom: 12,
    },
    kuotaRow: {
        flexDirection: 'row',
        gap: 12,
    },
    kuotaInputContainer: {
        flex: 1,
    },
    kuotaInfo: {
        marginTop: 16,
        padding: 12,
        backgroundColor: '#F8FAFC',
        borderRadius: 8,
        gap: 8,
    },
    kuotaInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    kuotaInfoText: {
        fontSize: 14,
        color: '#64748B',
    },
    kuotaInfoBold: {
        fontWeight: 'bold',
        color: '#1E293B',
    },
    progressBar: {
        height: 8,
        backgroundColor: '#E2E8F0',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 4,
    },
    statusContainer: {
        gap: 10,
    },
    statusButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: '#FFFFFF',
        borderWidth: 2,
        borderColor: '#E2E8F0',
        borderRadius: 12,
        padding: 16,
    },
    statusButtonActive: {
        borderWidth: 2,
    },
    statusButtonText: {
        fontSize: 15,
        color: '#64748B',
    },
});

export default App;