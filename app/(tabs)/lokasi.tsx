import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import { router } from 'expo-router';
import { initializeApp, getApps } from 'firebase/app';
import { getDatabase, onValue, ref } from 'firebase/database';
import React, { useEffect, useState, useRef } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View, Dimensions } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { WebView } from 'react-native-webview';

const { width, height } = Dimensions.get('window');

// Firebase configuration
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

interface MarkerData {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    status?: 'open' | 'limited' | 'full';
}

export default function MapScreen() {
    const [markers, setMarkers] = useState<MarkerData[]>([]);
    const [loading, setLoading] = useState(true);
    const [useWebView, setUseWebView] = useState(false);
    const [selectedMarker, setSelectedMarker] = useState<MarkerData | null>(null);
    const mapRef = useRef<MapView>(null);

    // Indonesia center coordinates
    const indonesiaRegion = {
        latitude: -2.5489,
        longitude: 118.0149,
        latitudeDelta: 35,
        longitudeDelta: 35,
    };

    useEffect(() => {
        const pointsRef = ref(db, 'points/');

        const unsubscribe = onValue(pointsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const parsedMarkers = Object.keys(data)
                    .map(key => {
                        const point = data[key];
                        
                        if (typeof point.coordinates !== 'string' || point.coordinates.trim() === '') {
                            return null;
                        }
                        
                        const [latitude, longitude] = point.coordinates.split(',').map(Number);

                        if (isNaN(latitude) || isNaN(longitude)) {
                            console.warn(`Invalid coordinates for point ${key}: ${point.coordinates}`);
                            return null;
                        }

                        return {
                            id: key,
                            name: point.name,
                            latitude,
                            longitude,
                            status: point.status || 'open',
                        };
                    })
                    .filter((marker): marker is MarkerData => marker !== null);

                setMarkers(parsedMarkers);
            } else {
                setMarkers([]);
            }
            setLoading(false);
        }, (error) => {
            console.error(error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const getMarkerColor = (status?: string) => {
        switch(status) {
            case 'open': return '#10B981';
            case 'limited': return '#F59E0B';
            case 'full': return '#DC2626';
            default: return '#003D7A';
        }
    };

    const getStatusText = (status?: string) => {
        switch(status) {
            case 'open': return '🟢 Buka';
            case 'limited': return '🟡 Terbatas';
            case 'full': return '🔴 Penuh';
            default: return '';
        }
    };

    const handleZoomIn = () => {
        if (mapRef.current) {
            mapRef.current.getCamera().then(camera => {
                if (camera.zoom) {
                    mapRef.current?.animateCamera({
                        zoom: camera.zoom + 1
                    }, { duration: 300 });
                }
            });
        }
    };

    const handleZoomOut = () => {
        if (mapRef.current) {
            mapRef.current.getCamera().then(camera => {
                if (camera.zoom) {
                    mapRef.current?.animateCamera({
                        zoom: camera.zoom - 1
                    }, { duration: 300 });
                }
            });
        }
    };

    const handleSetView = () => {
        if (mapRef.current) {
            mapRef.current.animateToRegion(indonesiaRegion, 1000);
        }
    };

    const handleMarkerPress = (marker: MarkerData) => {
        setSelectedMarker(marker);
        if (mapRef.current) {
            mapRef.current.animateCamera({
                center: {
                    latitude: marker.latitude,
                    longitude: marker.longitude,
                },
                zoom: 15,
            }, { duration: 500 });
        }
    };

    const handleViewDetail = () => {
        if (selectedMarker) {
            router.push('/(tabs)/listlokasi');
        }
    };

    // Generate HTML for WebView map
    const generateMapHTML = () => {
        const markersJS = markers.map(m => ({
            lat: m.latitude,
            lng: m.longitude,
            name: m.name,
            status: m.status,
        }));

        return `
<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <style>
        body { margin: 0; padding: 0; }
        #map { height: 100vh; width: 100vw; }
    </style>
</head>
<body>
    <div id="map"></div>
    <script>
        const map = L.map('map').setView([-2.5489, 118.0149], 5);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        const markers = ${JSON.stringify(markersJS)};
        
        markers.forEach(marker => {
            const color = marker.status === 'open' ? 'green' : 
                         marker.status === 'limited' ? 'orange' : 'red';
            const icon = L.divIcon({
                className: 'custom-marker',
                html: '<div style="background-color:' + color + '; width: 25px; height: 25px; border-radius: 50%; border: 3px solid white;"></div>',
                iconSize: [25, 25]
            });
            
            L.marker([marker.lat, marker.lng], {icon: icon})
                .bindPopup('<b>' + marker.name + '</b><br>' + (marker.status || ''))
                .addTo(map);
        });
    </script>
</body>
</html>`;
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#003D7A" />
                <Text style={styles.loadingText}>Memuat peta...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Map View */}
            {!useWebView ? (
                <MapView
                    ref={mapRef}
                    style={styles.map}
                    provider={PROVIDER_GOOGLE}
                    initialRegion={indonesiaRegion}
                    zoomControlEnabled={false}
                    showsUserLocation={true}
                    showsMyLocationButton={false}
                >
                    {markers.map(marker => (
                        <Marker
                            key={marker.id}
                            coordinate={{ 
                                latitude: marker.latitude, 
                                longitude: marker.longitude 
                            }}
                            pinColor={getMarkerColor(marker.status)}
                            onPress={() => handleMarkerPress(marker)}
                        >
                            <View style={styles.markerContainer}>
                                <View style={[styles.markerDot, { backgroundColor: getMarkerColor(marker.status) }]} />
                            </View>
                        </Marker>
                    ))}
                </MapView>
            ) : (
                <WebView
                    style={styles.map}
                    originWhitelist={['*']}
                    source={{ html: generateMapHTML() }}
                    javaScriptEnabled={true}
                />
            )}

            {/* Selected Marker Info Card */}
            {selectedMarker && !useWebView && (
                <View style={styles.infoCard}>
                    <View style={styles.infoCardHeader}>
                        <View style={styles.infoCardTitle}>
                            <FontAwesome5 name="map-marker-alt" size={18} color="#003D7A" />
                            <Text style={styles.infoCardName}>{selectedMarker.name}</Text>
                        </View>
                        <TouchableOpacity onPress={() => setSelectedMarker(null)}>
                            <FontAwesome name="times-circle" size={24} color="#64748B" />
                        </TouchableOpacity>
                    </View>
                    
                    <Text style={styles.infoCardStatus}>{getStatusText(selectedMarker.status)}</Text>
                    
                    <TouchableOpacity 
                        style={styles.detailButton}
                        onPress={handleViewDetail}
                    >
                        <Text style={styles.detailButtonText}>Lihat Detail</Text>
                        <FontAwesome name="arrow-right" size={14} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>
            )}

            {/* Control Buttons - Right Side */}
            <View style={styles.controlsRight}>
                {/* Layer Toggle */}
                <TouchableOpacity 
                    style={[
                        styles.controlButton,
                        useWebView && styles.controlButtonActive
                    ]}
                    onPress={() => setUseWebView(!useWebView)}
                >
                    <FontAwesome5 
                        name="layer-group" 
                        size={20} 
                        color={useWebView ? "#FFFFFF" : "#003D7A"} 
                    />
                    <Text style={[
                        styles.controlButtonLabel,
                        useWebView && styles.controlButtonLabelActive
                    ]}>
                        {useWebView ? "Web" : "Native"}
                    </Text>
                </TouchableOpacity>

                {/* Add Location - GOLD */}
                <TouchableOpacity 
                    style={[styles.controlButton, styles.addButton]}
                    onPress={() => router.push('/forminputlocation')}
                >
                    <FontAwesome name="plus" size={22} color="#1E293B" />
                    <Text style={styles.addButtonLabel}>Tambah</Text>
                </TouchableOpacity>

                {/* Zoom Controls - Navy */}
                {!useWebView && (
                    <>
                        <TouchableOpacity 
                            style={[styles.controlButton, styles.zoomButton]}
                            onPress={handleZoomIn}
                        >
                            <FontAwesome name="plus" size={22} color="#FFFFFF" />
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={[styles.controlButton, styles.zoomButton]}
                            onPress={handleZoomOut}
                        >
                            <FontAwesome name="minus" size={22} color="#FFFFFF" />
                        </TouchableOpacity>
                    </>
                )}

                {/* Set View Indonesia - Navy */}
                <TouchableOpacity 
                    style={[styles.controlButton, styles.resetButton]}
                    onPress={handleSetView}
                >
                    <FontAwesome5 name="globe-asia" size={18} color="#FFFFFF" />
                    <Text style={styles.resetButtonLabel}>Reset</Text>
                </TouchableOpacity>
            </View>

            {/* Legend */}
            <View style={styles.legend}>
                <View style={styles.legendHeader}>
                    <FontAwesome5 name="info-circle" size={14} color="#FDB81E" />
                    <Text style={styles.legendTitle}>Status Tim</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
                    <Text style={styles.legendText}>Tersedia</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
                    <Text style={styles.legendText}>Hampir Penuh</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#DC2626' }]} />
                    <Text style={styles.legendText}>Penuh</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: '#64748B',
    },
    map: {
        width: '100%',
        height: '100%',
    },
    // Marker Custom
    markerContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    markerDot: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 3,
        borderColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 5,
    },
    // Info Card
    infoCard: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#FDB81E',
    },
    infoCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    infoCardTitle: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flex: 1,
    },
    infoCardName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1E293B',
        flex: 1,
    },
    infoCardStatus: {
        fontSize: 14,
        color: '#64748B',
        marginBottom: 12,
    },
    detailButton: {
        backgroundColor: '#003D7A',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 12,
        borderRadius: 10,
        shadowColor: '#003D7A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
    },
    detailButtonText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: 'bold',
    },
    // Controls
    controlsRight: {
        position: 'absolute',
        right: 16,
        top: 60,
        gap: 10,
    },
    controlButton: {
        backgroundColor: '#FFFFFF',
        width: 58,
        height: 58,
        borderRadius: 29,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 4,
        borderWidth: 2,
        borderColor: '#E2E8F0',
    },
    controlButtonActive: {
        backgroundColor: '#003D7A',
        borderColor: '#003D7A',
    },
    // Add Button - GOLD
    addButton: {
        backgroundColor: '#FDB81E',
        borderColor: '#FDB81E',
        height: 68,
        shadowColor: '#FDB81E',
        shadowOpacity: 0.3,
    },
    addButtonLabel: {
        fontSize: 11,
        color: '#1E293B',
        fontWeight: 'bold',
        marginTop: 2,
    },
    // Zoom Buttons - NAVY
    zoomButton: {
        backgroundColor: '#003D7A',
        borderColor: '#003D7A',
    },
    // Reset Button - NAVY
    resetButton: {
        backgroundColor: '#003D7A',
        borderColor: '#003D7A',
    },
    resetButtonLabel: {
        fontSize: 10,
        color: '#FFFFFF',
        fontWeight: 'bold',
        marginTop: 2,
    },
    controlButtonLabel: {
        fontSize: 10,
        color: '#003D7A',
        fontWeight: 'bold',
        marginTop: 2,
    },
    controlButtonLabelActive: {
        color: '#FFFFFF',
    },
    // Legend
    legend: {
        position: 'absolute',
        top: 60,
        left: 16,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 14,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 4,
        borderWidth: 2,
        borderColor: '#003D7A',
    },
    legendHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 10,
    },
    legendTitle: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#003D7A',
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 6,
    },
    legendDot: {
        width: 14,
        height: 14,
        borderRadius: 7,
        borderWidth: 2,
        borderColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
    },
    legendText: {
        fontSize: 12,
        color: '#475569',
        fontWeight: '500',
    },
});