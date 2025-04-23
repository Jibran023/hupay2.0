






import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, Animated } from 'react-native';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRoute } from '@react-navigation/native';

function PayBills({ navigation }) {
  const route = useRoute();
  const user = route.params?.user;

  // Mock financial aid and fee challans data
  const financialAid = user?.financialAid || { amount: 15000, description: "Scholarship for Fall 2025" };
  const feeChallans = [
    { id: 'CH001', amount: 5000, dueDate: '2025-05-01', description: 'Tuition Fee - Semester 1' },
    { id: 'CH002', amount: 3000, dueDate: '2025-05-15', description: 'Library Fee' },
  ];

  const [voucherID, setVoucherID] = useState('');
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePayChallan = (challanId) => {
    if (!voucherID) {
      alert('Please enter a Voucher ID to proceed with payment.');
      return;
    }
    alert(`Paying challan ${challanId} with Voucher ID: ${voucherID}`);
    setVoucherID('');
  };

  const renderChallanItem = ({ item }) => (
    <Animated.View style={[styles.challanItem, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <View style={styles.challanDetails}>
        <Text style={styles.challanDescription}>{item.description}</Text>
        <Text style={styles.challanAmount}>Rs. {item.amount.toLocaleString()}</Text>
        <Text style={styles.challanDueDate}>Due: {item.dueDate}</Text>
      </View>
      <TouchableOpacity style={styles.payButton} onPress={() => handlePayChallan(item.id)}>
        <LinearGradient colors={['#3B82F6', '#60A5FA']} style={styles.payButtonGradient}>
          <Text style={styles.payButtonText}>Pay Now</Text>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <LinearGradient colors={['#0A1F44', '#1E3A8A']} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pay Bills</Text>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>Logo</Text>
        </View>
      </View>

      {/* Financial Aid Section */}
      <Animated.View style={[styles.sectionCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <LinearGradient colors={['#1E3A8A', '#3B82F6']} style={styles.cardGradient}>
          <Text style={styles.sectionTitle}>Financial Aid</Text>
          {financialAid ? (
            <View>
              <Text style={styles.financialAidAmount}>Rs. {financialAid.amount.toLocaleString()}</Text>
              <Text style={styles.financialAidDescription}>{financialAid.description}</Text>
            </View>
          ) : (
            <Text style={styles.noDataText}>No financial aid available.</Text>
          )}
        </LinearGradient>
      </Animated.View>

      {/* Fee Challans Section */}
      <Animated.View style={[styles.sectionCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <LinearGradient colors={['#1E3A8A', '#3B82F6']} style={styles.cardGradient}>
          <Text style={styles.sectionTitle}>Fee Challans Due</Text>
          {feeChallans.length > 0 ? (
            <FlatList
              data={feeChallans}
              renderItem={renderChallanItem}
              keyExtractor={(item) => item.id}
              style={styles.challanList}
            />
          ) : (
            <Text style={styles.noDataText}>No fee challans due.</Text>
          )}
        </LinearGradient>
      </Animated.View>

      {/* Voucher ID Input and Pay Button */}
      <Animated.View style={[styles.voucherSection, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <TextInput
          style={styles.voucherInput}
          placeholder="Enter Voucher ID"
          placeholderTextColor="#93C5FD"
          value={voucherID}
          onChangeText={setVoucherID}
        />
        <TouchableOpacity onPress={() => handlePayChallan('all')}>
          <LinearGradient colors={['#3B82F6', '#60A5FA']} style={styles.submitButton}>
            <Text style={styles.submitButtonText}>Submit Payment</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
  logoContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1E3A8A', // Adjusted to match the blue theme
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  sectionCard: {
    marginBottom: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  cardGradient: {
    padding: 20,
    borderRadius: 10,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  financialAidAmount: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  financialAidDescription: {
    color: '#93C5FD',
    fontSize: 14,
  },
  noDataText: {
    color: '#93C5FD',
    fontSize: 14,
    textAlign: 'center',
  },
  challanList: {
    maxHeight: 200,
  },
  challanItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  challanDetails: {
    flex: 1,
  },
  challanDescription: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  challanAmount: {
    color: '#FF4040', // Keeping the red color for amounts to stand out
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
  },
  challanDueDate: {
    color: '#93C5FD',
    fontSize: 12,
    marginTop: 2,
  },
  payButton: {
    borderRadius: 20,
  },
  payButtonGradient: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  payButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  voucherSection: {
    marginTop: 20,
  },
  voucherInput: {
    backgroundColor: '#1E3A8A',
    color: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginBottom: 10,
    fontSize: 16,
  },
  submitButton: {
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PayBills;