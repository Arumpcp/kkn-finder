import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';

const { width, height } = Dimensions.get('window');

export default function SplashScreen({ onFinish }) {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.3)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const dotAnim1 = useRef(new Animated.Value(0)).current;
    const dotAnim2 = useRef(new Animated.Value(0)).current;
    const dotAnim3 = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Main animation sequence
        Animated.sequence([
            // Icon animation
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    tension: 50,
                    friction: 7,
                    useNativeDriver: true,
                }),
            ]),
            // Text animation
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 600,
                useNativeDriver: true,
            }),
        ]).start();

        // Loading dots animation
        const createDotAnimation = (animValue) => {
            return Animated.loop(
                Animated.sequence([
                    Animated.timing(animValue, {
                        toValue: 1,
                        duration: 400,
                        useNativeDriver: true,
                    }),
                    Animated.timing(animValue, {
                        toValue: 0,
                        duration: 400,
                        useNativeDriver: true,
                    }),
                ])
            );
        };

        // Start dot animations with delay
        setTimeout(() => createDotAnimation(dotAnim1).start(), 0);
        setTimeout(() => createDotAnimation(dotAnim2).start(), 200);
        setTimeout(() => createDotAnimation(dotAnim3).start(), 400);

        // Auto dismiss after 2.5 seconds
        const timer = setTimeout(() => {
            if (onFinish) {
                onFinish();
            }
        }, 5000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <View style={styles.container}>
            {/* Background gradient effect */}
            <View style={styles.circle1} />
            <View style={styles.circle2} />

            {/* Main content */}
            <View style={styles.content}>
                {/* Icon */}
                <Animated.View
                    style={[
                        styles.iconContainer,
                        {
                            opacity: fadeAnim,
                            transform: [{ scale: scaleAnim }],
                        },
                    ]}
                >
                    <FontAwesome5 name="map-marked-alt" size={80} color="#FFFFFF" />
                </Animated.View>

                {/* App Name */}
                <Animated.View
                    style={{
                        opacity: fadeAnim,
                        transform: [{ translateY: slideAnim }],
                    }}
                >
                    <Text style={styles.appName}>KKN Finder</Text>
                    <Text style={styles.tagline}>create by: Arum Pradana Cahyani putri</Text>
                </Animated.View>

                {/* Loading indicator */}
                <Animated.View
                    style={[
                        styles.loadingContainer,
                        { opacity: fadeAnim },
                    ]}
                >
                    <View style={styles.loadingDots}>
                        <Animated.View
                            style={[
                                styles.dot,
                                {
                                    opacity: dotAnim1,
                                    transform: [
                                        {
                                            scale: dotAnim1.interpolate({
                                                inputRange: [0, 1],
                                                outputRange: [1, 1.3],
                                            }),
                                        },
                                    ],
                                },
                            ]}
                        />
                        <Animated.View
                            style={[
                                styles.dot,
                                {
                                    opacity: dotAnim2,
                                    transform: [
                                        {
                                            scale: dotAnim2.interpolate({
                                                inputRange: [0, 1],
                                                outputRange: [1, 1.3],
                                            }),
                                        },
                                    ],
                                },
                            ]}
                        />
                        <Animated.View
                            style={[
                                styles.dot,
                                {
                                    opacity: dotAnim3,
                                    transform: [
                                        {
                                            scale: dotAnim3.interpolate({
                                                inputRange: [0, 1],
                                                outputRange: [1, 1.3],
                                            }),
                                        },
                                    ],
                                },
                            ]}
                        />
                    </View>
                </Animated.View>
            </View>

            {/* Footer */}
            <Animated.View
                style={[
                    styles.footer,
                    { opacity: fadeAnim },
                ]}
            >
                <Text style={styles.footerText}>Powered by Firebase</Text>
                <Text style={styles.version}>v1.0.0</Text>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#003D7A',
        justifyContent: 'center',
        alignItems: 'center',
    },
    circle1: {
        position: 'absolute',
        width: width * 1.5,
        height: width * 1.5,
        borderRadius: width * 0.75,
        backgroundColor: 'rgba(253, 184, 30, 0.1)',
        top: -width * 0.5,
        right: -width * 0.3,
    },
    circle2: {
        position: 'absolute',
        width: width * 1.2,
        height: width * 1.2,
        borderRadius: width * 0.6,
        backgroundColor: 'rgba(253, 184, 30, 0.15)',
        bottom: -width * 0.4,
        left: -width * 0.3,
    },
    content: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconContainer: {
        width: 160,
        height: 160,
        borderRadius: 80,
        backgroundColor: 'rgba(253, 184, 30, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 30,
        borderWidth: 3,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    appName: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: 8,
        letterSpacing: 1,
    },
    tagline: {
        fontSize: 16,
        color: '#FDB81E',
        textAlign: 'center',
        marginBottom: 40,
        fontWeight: '500',
    },
    loadingContainer: {
        marginTop: 20,
    },
    loadingDots: {
        flexDirection: 'row',
        gap: 12,
    },
    dot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#FDB81E',
    },
    footer: {
        position: 'absolute',
        bottom: 40,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.7)',
        marginBottom: 4,
    },
    version: {
        fontSize: 10,
        color: 'rgba(255, 255, 255, 0.5)',
    },
});