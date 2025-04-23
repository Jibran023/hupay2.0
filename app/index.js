import React from 'react';
import { View, StyleSheet } from 'react-native';
import Login from './pages/login'; 
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Dashboard from './pages/dashboard';
import TransferMoney from './pages/transfer';
import CardScreen from './pages/cardscreen';
import FeedbackScreen from './pages/feedbackpage';
import SettingsScreen from './pages/settingsscreen';
import StatementScreen from './pages/statement';
import PayBills from './pages/paybills'; // Import the new PayBills screen

const Stack = createNativeStackNavigator();

export default function HomeScreen() {
  return (
    
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={Login} options={{headerShown: false}}/>
        <Stack.Screen name="Dashboard" component={Dashboard} options={{headerShown: false}}/>
        <Stack.Screen name="TransferMoney" component={TransferMoney} options={{headerShown: false}}/>
        <Stack.Screen name="CardScreen" component={CardScreen} options={{headerShown: false}}/>
        <Stack.Screen name="FeedbackScreen" component={FeedbackScreen} options={{headerShown: false}}/>
        <Stack.Screen name="SettingsScreen" component={SettingsScreen} options={{headerShown: false}}/>
        <Stack.Screen name="StatementScreen" component={StatementScreen} options={{headerShown: false}}/>
        <Stack.Screen name="PayBills" component={PayBills} options={{headerShown: false}}/>
      </Stack.Navigator>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
