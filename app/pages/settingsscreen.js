import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, Feather } from '@expo/vector-icons';

function SettingsScreen({ navigation }) {
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [darkTheme, setDarkTheme] = React.useState(true);

  const handleLogout = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  return (
    <LinearGradient
      colors={['#0A1F44', '#1E3A8A']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      {/* Header Card */}
      <View style={styles.cardContainer}>
        <LinearGradient
          colors={['#1E3A8A', '#3B82F6', '#60A5FA']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          <LinearGradient
            colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.05)']}
            style={styles.glassOverlay}
          />
          <Text style={styles.cardText}>Settings</Text>
        </LinearGradient>
      </View>

      {/* Greeting */}
      <View style={styles.greetingContainer}>
        <Text style={styles.greetingText}>Configure Your Preferences</Text>
        <Text style={styles.subText}>Personalize your HUPAY experience</Text>
      </View>

      {/* Settings Options */}
      <View style={styles.optionsContainer}>
        {/* Profile Section */}
        <TouchableOpacity style={styles.optionWrapper}>
          <LinearGradient
            colors={['#1E3A8A', '#3B82F6']}
            style={styles.optionButton}
          >
            <MaterialIcons name="person" size={24} color="#FFFFFF" />
            <Text style={styles.optionText}>Edit Profile</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Notifications Section */}
        <View style={styles.optionWrapper}>
          <LinearGradient
            colors={['#1E3A8A', '#3B82F6']}
            style={styles.optionButton}
          >
            <MaterialIcons name="notifications" size={24} color="#FFFFFF" />
            <Text style={styles.optionText}>Notifications</Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              thumbColor={notificationsEnabled ? '#60A5FA' : '#888'}
              trackColor={{ false: '#555', true: '#3B82F6' }}
              style={styles.optionSwitch}
            />
          </LinearGradient>
        </View>

        {/* Security Section */}
        <TouchableOpacity style={styles.optionWrapper}>
          <LinearGradient
            colors={['#1E3A8A', '#3B82F6']}
            style={styles.optionButton}
          >
            <MaterialIcons name="lock" size={24} color="#FFFFFF" />
            <Text style={styles.optionText}>Security & Privacy</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Theme Section */}
        <View style={styles.optionWrapper}>
          <LinearGradient
            colors={['#1E3A8A', '#3B82F6']}
            style={styles.optionButton}
          >
            <MaterialIcons name="color-lens" size={24} color="#FFFFFF" />
            <Text style={styles.optionText}>Dark Theme</Text>
            <Switch
              value={darkTheme}
              onValueChange={setDarkTheme}
              thumbColor={darkTheme ? '#60A5FA' : '#888'}
              trackColor={{ false: '#555', true: '#3B82F6' }}
              style={styles.optionSwitch}
            />
          </LinearGradient>
        </View>

        {/* Language Section */}
        <TouchableOpacity style={styles.optionWrapper}>
          <LinearGradient
            colors={['#1E3A8A', '#3B82F6']}
            style={styles.optionButton}
          >
            <MaterialIcons name="language" size={24} color="#FFFFFF" />
            <Text style={styles.optionText}>Language</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Logout Section */}
        <TouchableOpacity style={styles.optionWrapper} onPress={handleLogout}>
          <LinearGradient
            colors={['#1E3A8A', '#3B82F6']}
            style={styles.optionButton}
          >
            <MaterialIcons name="logout" size={24} color="#FFFFFF" />
            <Text style={styles.optionText}>Logout</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  cardContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  card: {
    width: '100%',
    padding: 20,
    borderRadius: 20,
    shadowColor: '#60A5FA',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 15,
  },
  glassOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  cardText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: 'rgba(96, 165, 250, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
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
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingVertical: 20,
  },
  optionWrapper: {
    width: '48%',
    marginBottom: 15,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 15,
    shadowColor: '#60A5FA',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  optionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 10,
    flex: 1,
  },
  optionSwitch: {
    marginLeft: 'auto',
  },
});

export default SettingsScreen;