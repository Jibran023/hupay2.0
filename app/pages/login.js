


import React, { useState, useRef, useEffect } from 'react';
import { API_URL } from '../../constants';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Switch,
  Animated,
} from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Camera } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';

function Login() {
  const navigation = useNavigation();
  const [huid, setHuid] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [hasPermission, setHasPermission] = useState(null);
  const [isCameraVisible, setIsCameraVisible] = useState(false);
  const [showLoginScreen, setShowLoginScreen] = useState(false);
  const cameraRef = useRef(null);

  // Animation setup
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const formFadeAnim = useRef(new Animated.Value(0)).current;
  const formTranslateY = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    const requestPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    };
    requestPermissions();

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setTimeout(() => {
        setShowLoginScreen(true);
        Animated.parallel([
          Animated.timing(formFadeAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(formTranslateY, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]).start();
      }, 1000);
    });
  }, [fadeAnim, scaleAnim, formFadeAnim, formTranslateY]);

  const handleLogin = async () => {
    try {
      const response = await fetch(API_URL + '/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          huid: huid,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('✅ Login Successful');
        navigation.navigate('Dashboard', { user: data.user });
      } else {
        Alert.alert('Login Failed', data.message || 'Invalid credentials');
      }
    } catch (error) {
      console.error('Login Error:', error);
      Alert.alert('Error', 'Unable to connect to server.');
    }
  };

  const handleFingerprintLogin = async () => {
    if (!huid) {
      Alert.alert('HUID required', 'Enter your HUID above, then use fingerprint to log in.');
      return;
    }

    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      if (!compatible) {
        Alert.alert('Device not compatible', 'Biometric authentication not supported.');
        return;
      }

      const biometricRecords = await LocalAuthentication.isEnrolledAsync();
      if (!biometricRecords) {
        Alert.alert('No Biometrics', 'Set up biometrics in your device settings.');
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Login with Fingerprint',
        fallbackLabel: 'Enter Password',
      });

      if (result.success) {
        const response = await fetch(API_URL + `/user/${huid}`);
        const data = await response.json();

        if (response.ok) {
          navigation.reset({
            index: 0,
            routes: [{ name: 'Dashboard', params: { user: data.user } }],
          });
        } else {
          Alert.alert('Login Failed', data.message || 'User not found');
        }
      } else {
        Alert.alert('Authentication Failed', 'Try again.');
      }
    } catch (error) {
      console.error('Fingerprint authentication error:', error);
      Alert.alert('Error', 'Unexpected error during biometric auth.');
    }
  };

  const handleFaceRecognition = () => {
    if (hasPermission) {
      setIsCameraVisible(true);
    } else {
      Alert.alert('Permission Denied', 'Camera access is required.');
    }
  };

  const renderCamera = () => (
    <View style={styles.cameraContainer}>
      <Camera style={styles.camera} type={Camera.Constants.Type.front} ref={cameraRef} />
      <TouchableOpacity style={styles.closeCameraButton} onPress={() => setIsCameraVisible(false)}>
        <Text style={styles.closeCameraText}>Close Camera</Text>
      </TouchableOpacity>
    </View>
  );

  if (isCameraVisible && hasPermission) {
    return renderCamera();
  }

  return (
    <LinearGradient
      colors={['#0A1F44', '#1E3A8A']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      {!showLoginScreen ? (
        <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
      
          <Text style={styles.logoText}>HUPAY</Text>
        </Animated.View>
      ) : (
        <Animated.View
          style={{
            opacity: formFadeAnim,
            transform: [{ translateY: formTranslateY }],
            width: '100%',
          }}
        >
          <Text style={styles.welcomeText}>Welcome Back</Text>
          <Text style={styles.subText}>Login to your Account</Text>

          <View style={styles.inputContainer}>
            <LinearGradient
              colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.3)']}
              style={styles.inputWrapper}
            >
              <MaterialIcons name="person" size={20} color="#60A5FA" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="HUID"
                placeholderTextColor="#93C5FD"
                value={huid}
                onChangeText={setHuid}
                autoCapitalize="none"
              />
            </LinearGradient>

            <LinearGradient
              colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.3)']}
              style={styles.inputWrapper}
            >
              <MaterialIcons name="lock" size={20} color="#60A5FA" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#93C5FD"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
              <TouchableOpacity>
                <MaterialIcons name="visibility" size={20} color="#60A5FA" style={styles.eyeIcon} />
              </TouchableOpacity>
            </LinearGradient>

            <View style={styles.optionsContainer}>
              <View style={styles.rememberMe}>
                <Switch
                  value={rememberMe}
                  onValueChange={setRememberMe}
                  thumbColor={rememberMe ? '#60A5FA' : '#888'}
                  trackColor={{ false: '#555', true: '#3B82F6' }}
                />
                <Text style={styles.rememberText}>Remember me</Text>
              </View>
              <TouchableOpacity>
                <Text style={styles.forgetText}>Forget password?</Text>
              </TouchableOpacity>
            </View>

            <LinearGradient
              colors={['#3B82F6', '#60A5FA']}
              style={styles.loginButton}
            >
              <TouchableOpacity onPress={handleLogin} style={styles.loginButtonContent}>
                <Text style={styles.loginButtonText}>Login</Text>
              </TouchableOpacity>
            </LinearGradient>

            <View style={styles.biometricContainer}>
              <LinearGradient
                colors={['#1E3A8A', '#3B82F6']}
                style={styles.biometricButton}
              >
                <TouchableOpacity onPress={handleFingerprintLogin}>
                  <MaterialIcons name="fingerprint" size={30} color="#FFFFFF" />
                </TouchableOpacity>
              </LinearGradient>
              <LinearGradient
                colors={['#1E3A8A', '#3B82F6']}
                style={styles.biometricButton}
              >
                <TouchableOpacity onPress={handleFaceRecognition}>
                  <MaterialIcons name="face" size={30} color="#FFFFFF" />
                </TouchableOpacity>
              </LinearGradient>
            </View>

            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>Don't have an account?</Text>
              <TouchableOpacity onPress={() => navigation.navigate('AdminLogin')}>
                <Text style={styles.signupLink}> Sign up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 60,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(96, 165, 250, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
  welcomeText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 10,
    textShadowColor: 'rgba(96, 165, 250, 0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  subText: {
    fontSize: 18,
    color: '#93C5FD',
    textAlign: 'center',
    marginBottom: 40,
    opacity: 0.8,
  },
  inputContainer: {
    width: '100%',
    alignItems: 'center',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 15,
    marginBottom: 20,
    paddingHorizontal: 15,
    width: '100%',
    height: 55,
    shadowColor: '#60A5FA',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  inputIcon: {
    marginRight: 10,
  },
  eyeIcon: {
    marginLeft: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  rememberMe: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rememberText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginLeft: 5,
  },
  forgetText: {
    color: '#60A5FA',
    fontSize: 14,
  },
  loginButton: {
    borderRadius: 25,
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#60A5FA',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  loginButtonContent: {
    paddingVertical: 15,
    width: '100%',
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  biometricContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: '50%',
    marginBottom: 20,
  },
  biometricButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#60A5FA',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  signupText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  signupLink: {
    color: '#60A5FA',
    fontSize: 14,
    fontWeight: 'bold',
  },
  cameraContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  camera: {
    width: '100%',
    height: '80%',
  },
  closeCameraButton: {
    marginTop: 20,
    backgroundColor: '#3B82F6',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    shadowColor: '#60A5FA',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  closeCameraText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Login;