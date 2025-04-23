









import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { useRoute } from '@react-navigation/native';

function CardScreen({ navigation }) {
  const route = useRoute();
  const user = route.params?.user;

  const [cardEnabled, setCardEnabled] = useState(true);
  const cardOpacity = useState(new Animated.Value(1))[0];
  const glowAnim = useState(new Animated.Value(0))[0]; // For pulsating glow effect

  // Toggle card enabled/disabled with animation
  const toggleCard = () => {
    const newValue = !cardEnabled;
    setCardEnabled(newValue);
    Animated.timing(cardOpacity, {
      toValue: newValue ? 1 : 0.3,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  // Pulsating glow animation for the card
  React.useEffect(() => {
    const pulsate = () => {
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.3,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start(() => pulsate()); // Loop the animation
    };
    pulsate();
  }, [glowAnim]);

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error: User data not available</Text>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={['#0A1F44', '#1E3A8A']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      {/* Card */}
      <View style={styles.cardContainer}>
        <Animated.View
          style={[
            styles.card,
            {
              opacity: cardOpacity,
              shadowOpacity: glowAnim,
            },
          ]}
        >
          <LinearGradient
            colors={['#1E3A8A', '#3B82F6', '#60A5FA']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cardInner}
          >
            {/* Glassy overlay for glossy effect */}
            <LinearGradient
              colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.05)']}
              style={styles.glassOverlay}
            />

            {/* Top Left: "Debit card" */}
            <Text style={styles.topLeftText}>Debit Card</Text>

            {/* Top Right: "HUPAY" */}
            <Text style={styles.topRightText}>HUPAY</Text>

            {/* Chip */}
            <View style={styles.chip}>
              <LinearGradient
                colors={['#93C5FD', '#60A5FA']}
                style={styles.chipInner}
              />
            </View>

            {/* Card Number */}
            <Text style={styles.cardNumber}>{user.card_number}</Text>

            {/* Bottom Left: Cardholder Name */}
            <Text style={styles.cardName}>{user.full_name.toUpperCase()}</Text>

            {/* Bottom Right: Expiration Date */}
            <Text style={styles.cardDate}>VALID THRU {user.expiry_date}</Text>

            {/* Hologram */}
            <View style={styles.hologram}>
              <LinearGradient
                colors={['#93C5FD', '#FFFFFF', '#93C5FD']}
                style={styles.hologramInner}
              />
            </View>
          </LinearGradient>
        </Animated.View>
      </View>

      {/* Toggle */}
      <View style={styles.toggleContainer}>
        <Text style={styles.toggleLabel}>
          {cardEnabled ? 'Card is Active' : 'Card is Disabled'}
        </Text>
        <Switch
          value={cardEnabled}
          onValueChange={toggleCard}
          thumbColor={cardEnabled ? '#60A5FA' : '#888'}
          trackColor={{ false: '#555', true: '#3B82F6'}}
        />
      </View>

      {/* Headline */}
      <View style={styles.greetingContainer}>
        <Text style={styles.greetingText}>Card Details</Text>
        <Text style={styles.subText}>Manage your digital debit card securely</Text>
      </View>

      {/* Bottom Navigation */}
      <LinearGradient
        colors={['#1E3A8A', '#3B82F6']}
        style={styles.bottomNav}
      >
        <TouchableOpacity onPress={() => navigation.navigate('Dashboard', { user })}>
          <MaterialIcons name="home" size={24} color="#FFFFFF" />
          <Text style={styles.navLabel}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <MaterialIcons name="credit-card" size={24} color="#FFFFFF" />
          <Text style={styles.navLabel}>Card</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Feather name="users" size={24} color="#FFFFFF" />
          <Text style={styles.navLabel}>Users</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('SettingsScreen', { user })}>
          <Feather name="settings" size={24} color="#FFFFFF" />
          <Text style={styles.navLabel}>Settings</Text>
        </TouchableOpacity>
      </LinearGradient>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  errorText: {
    color: '#FFFFFF',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
  },
  cardContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  card: {
    width: '100%',
    borderRadius: 20,
    shadowColor: '#60A5FA',
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 20,
    elevation: 15,
  },
  cardInner: {
    padding: 25,
    borderRadius: 20,
    position: 'relative',
    height: 220,
  },
  glassOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  topLeftText: {
    position: 'absolute',
    top: 15,
    left: 15,
    color: '#93C5FD',
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'sans-serif',
  },
  topRightText: {
    position: 'absolute',
    top: 15,
    right: 15,
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'sans-serif',
    textShadowColor: 'rgba(96, 165, 250, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
  },
  chip: {
    position: 'absolute',
    top: 60,
    left: 15,
    width: 50,
    height: 35,
    borderRadius: 8,
    overflow: 'hidden',
  },
  chipInner: {
    flex: 1,
  },
  cardNumber: {
    color: '#FFFFFF',
    fontSize: 24,
    letterSpacing: 3,
    fontWeight: 'bold',
    fontFamily: 'sans-serif',
    marginTop: 100,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  },
  cardName: {
    position: 'absolute',
    bottom: 15,
    left: 15,
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'sans-serif',
    textTransform: 'uppercase',
    opacity: 0.9,
  },
  cardDate: {
    position: 'absolute',
    bottom: 15,
    right: 15,
    color: '#93C5FD',
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'sans-serif',
    opacity: 0.9,
  },
  hologram: {
    position: 'absolute',
    bottom: 15,
    right: 50,
    width: 40,
    height: 25,
    borderRadius: 5,
    overflow: 'hidden',
  },
  hologramInner: {
    flex: 1,
  },
  toggleContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  toggleLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 10,
    textShadowColor: 'rgba(96, 165, 250, 0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
  },
  greetingContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  greetingText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 6,
    textShadowColor: 'rgba(96, 165, 250, 0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  subText: {
    fontSize: 14,
    color: '#93C5FD',
    textAlign: 'center',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 15,
    position: 'absolute',
    bottom: 0,
    width: '100%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#60A5FA',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
  navLabel: {
    color: '#FFFFFF',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 2,
  },
});

export default CardScreen;