import * as Location from 'expo-location';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { initializeApp } from "firebase/app";
import { getDatabase, ref, update } from "firebase/database";
import React, { useState } from 'react';
import { Alert, Button, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

const App = () => {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { id, name: initialName, coordinates: initialCoordinates, accuration: initialAccuration } = params;
    const [name, setName] = useState(initialName);
    const [location, setLocation] = useState(initialCoordinates);
    const [accuration, setAccuration] = useState(initialAccuration);


    // Get current location
    const getCoordinates = async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission to access location was denied');
            return;
        }

        let location = await Location.getCurrentPositionAsync({});
        const coords = location.coords.latitude + ',' + location.coords.longitude;
        setLocation(coords);

        const accuracy = location.coords.accuracy;
        setAccuration(accuracy + ' m');
    };

    // Firebase harus di luar komponen
    const firebaseConfig = {
        apiKey: "AIzaSyDFEsdbwFIdIsEmah1WnreZdVOfwrYIR1k",
        authDomain: "reactnatice-2025.firebaseapp.com",
        databaseURL: "https://reactnatice-2025-default-rtdb.firebaseio.com",
        projectId: "reactnatice-2025",
        storageBucket: "reactnatice-2025.firebasestorage.app",
        messagingSenderId: "406629352921",
        appId: "1:406629352921:web:5ba228b5b92b16446305c8"
    };

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getDatabase(app);

    // Alert success update
const createOneButtonAlert = (callback) =>
  Alert.alert('Success', 'Berhasil memperbarui data', [
    { text: 'OK', onPress: callback },
  ]);


// Handle update
const handleUpdate = () => {
  if (!id) {
    Alert.alert("Error", "ID lokasi tidak ditemukan.");
    return;
  }
  const pointRef = ref(db, `points/${id}`);
  update(pointRef, {
    name: name,
    coordinates: location,
    accuration: accuration,
  }).then(() => {
    createOneButtonAlert(() => {
      router.back();
    });
  }).catch((e) => {
    console.error("Error updating document: ", e);
    Alert.alert("Error", "Gagal memperbarui data");
  });
};

    return (
        <SafeAreaProvider style={{ backgroundColor: 'white' }}>
            <SafeAreaView>
                <Stack.Screen options={{ title: 'Form Edit Location' }} />
                <Text style={styles.inputTitle}>Nama</Text>
                <TextInput
                    style={styles.input}
                    placeholder='Isikan nama objek'
                    value={name}
                    onChangeText={setName}
                />
                <Text style={styles.inputTitle}>Koordinat</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Isikan koordinat (contoh: -6.200000,106.816666)"
                    value={location}
                    onChangeText={setLocation}
                />
                <Text style={styles.inputTitle}>Akurasi</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Isikan accuration (contoh: 5 meter)"
                    value={accuration}
                    onChangeText={setAccuration}
                />
                <View style={styles.button}>
                    <Button
                        title="Get Current Location"
                        onPress={getCoordinates}
                        color="#570a0aff"
                    />
                </View>
                <View style={styles.button}>
                    <Button
                        title="Save"
                         onPress={handleUpdate}
                        color="#570a0aff"
                    />
                </View>
            </SafeAreaView>
        </SafeAreaProvider>
    );
};


const styles = StyleSheet.create({
    input: {
        height: 40,
        margin: 12,
        borderWidth: 1,
        padding: 10,
        borderRadius: 15,
    },
    inputTitle: {
        marginLeft: 12,
        marginTop: 12,
        fontSize: 16,
        fontWeight: '600',
    },
    button: {
        margin: 12,
        borderRadius: 15
    }
});


export default App;