import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, Modal, TextInput, Alert, TouchableOpacity, Animated } from 'react-native';
import LottieView from 'lottie-react-native';
import {StatusBar} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons'; // Importing refresh icon

const App = () => {
    const [temperature, setTemperature] = useState<number | null>(null);
    const [isLightOn, setIsLightOn] = useState<boolean>(false);
    const [brightness, setBrightness] = useState<number>(0);
    const [serverIp, setServerIp] = useState<string>('192.168.5.9');
    const [inputIp, setInputIp] = useState<string>('');
    const [modalVisible, setModalVisible] = useState<boolean>(false);

    const [shakeAnim] = useState(new Animated.Value(0)); // Shake animation state

    useEffect(() => {
        StatusBar.setBarStyle('dark-content');
        StatusBar.setBackgroundColor('#e0f7fa');
    });

    // Fetch data from the server
    const fetchData = async () => {
        try {
            const response = await fetch(`http://${serverIp}:5500/data/get`);
            const data = await response.json();
            console.log(data);
            setTemperature(data.temperature);
            setIsLightOn(data.isGrowLightOn);
            setBrightness(data.brightness);
            triggerShake(); // Trigger shake animation on data update
        } catch (error) {
            console.error('Failed to fetch data:', error);
        }
    };

    // Trigger shake animation
    const triggerShake = () => {
        Animated.sequence([
            Animated.timing(shakeAnim, {
                toValue: 10,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(shakeAnim, {
                toValue: -10,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(shakeAnim, {
                toValue: 0,
                duration: 100,
                useNativeDriver: true,
            }),
        ]).start();
    };

    // Manual refresh
    const handleRefresh = () => {
        fetchData();
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 5000); // Fetch data every 5 seconds
        return () => clearInterval(interval);
    }, [serverIp]);

    // Update server IP
    const updateServerIp = () => {
        if (inputIp) {
            setTemperature(null);
            setBrightness(0);
            setIsLightOn(false);
            setServerIp(inputIp);
            setInputIp('');
            setModalVisible(false);
        } else {
            Alert.alert('Error', 'Please enter a valid IP address.');
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" translucent={true} />

            {/* Full-screen Water Wave Animation */}
            <LottieView
                source={require('../assets/algae_animation.json')} // Replace with your Lottie water wave animation
                autoPlay
                loop
                style={styles.waterWaveAnimation}
                resizeMode="cover"
            />

            <TouchableOpacity style={styles.changeIpButton} onPress={() => setModalVisible(true)}>
                <Text style={styles.buttonText}>Change IP</Text>
            </TouchableOpacity>

            {/* Modal-Like Appearance for Main Text */}
            <Animated.View
                style={[
                    styles.modalContainer,
                    { transform: [{ translateX: shakeAnim }] }, // Apply shake animation
                ]}
            >
                <Text style={styles.header}>Liquid Three Monitor</Text>
                <Text style={styles.label}>Server IP: {serverIp}</Text>
                <Text style={styles.label}>Temperature: {temperature ?? 'Loading...'}°C</Text>
                <Text style={styles.label}>Grow Light Status: {isLightOn ? 'On' : 'Off'}</Text>
                {isLightOn && <Text style={styles.label}>Brightness: {brightness}</Text>}

                {/* Refresh Button in Top Right Corner */}
                <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
                    <Icon name="refresh" size={30} color="#fff" />
                </TouchableOpacity>
            </Animated.View>

            {/* Modal for IP Input */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Enter Server IP</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g., 192.168.1.1"
                            value={inputIp}
                            onChangeText={setInputIp}
                            keyboardType="numeric"
                        />
                        <Button title="Set IP" onPress={updateServerIp} />
                        <View style={styles.buttonSpacing} />
                        <Button title="Cancel" color="red" onPress={() => setModalVisible(false)} />
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#e0f7fa',
        position: 'relative', // To overlay elements over the animation
    },
    waterWaveAnimation: {
        position: 'absolute',
        top: 5,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
        zIndex: 1, // Make sure the wave animation stays behind the content
    },
    changeIpButton: {
        position: 'absolute',
        top: 40,
        left: 20,
        padding: 10,
        backgroundColor: '#007bff',
        borderRadius: 5,
        zIndex: 2,
        color: '#fff',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
    },
    modalContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.8)', // Semi-transparent background for modal-like appearance
        padding: 50, // Increased padding for better spacing
        borderRadius: 15,
        alignItems: 'center',
        zIndex: 2, // Make sure text is on top of the wave animation
        shadowColor: '#000',
        shadowOpacity: 0.5,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 2 },
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 30, // Increased margin-bottom to create space between title and refresh button
    },
    label: {
        fontSize: 18,
        marginBottom: 10,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 3,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        paddingHorizontal: 10,
        marginBottom: 10,
        width: '100%',
    },
    buttonSpacing: {
        marginBottom: 15,
    },
    refreshButton: {
        position: 'absolute',
        top: 10, // Positioned with more space from the top
        right: 10, // Positioned with more space from the right
        backgroundColor: '#007bff',
        borderRadius: 50,
        padding: 10,
        zIndex: 3,
    },
});

export default App;
