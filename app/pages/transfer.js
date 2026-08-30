import React, { useState, useEffect } from 'react';
import { API_URL } from '../../constants';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Modal, FlatList, Animated, Easing, Alert, Vibration } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, Feather } from '@expo/vector-icons';

const TransferMoney = ({ navigation, route }) => {
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isTransferModalVisible, setIsTransferModalVisible] = useState(false);
  const [selectedBank, setSelectedBank] = useState(null);
  const [accountNumber, setAccountNumber] = useState('');
  const [beneficiaryName, setBeneficiaryName] = useState('');
  const [amount, setAmount] = useState('');
  const [searchText, setSearchText] = useState('');
  const [selectedBeneficiary, setSelectedBeneficiary] = useState(null);
  const [isBankDropdownVisible, setIsBankDropdownVisible] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);

  const banks = [
    { id: 1, name: 'Bank A' },
    { id: 2, name: 'Bank B' },
    { id: 3, name: 'Bank C' },
    { id: 4, name: 'Bank D' },
    { id: 5, name: 'Bank E' },
    { id: 6, name: 'Bank F' },
  ];

  const user = route.params?.user;

  const modalAnim = useState(new Animated.Value(0))[0];
  const transferModalAnim = useState(new Animated.Value(0))[0];
  const buttonScale = useState(new Animated.Value(1))[0];

  useEffect(() => {
    console.log('User object in TransferMoney:', user);
    const loadBeneficiaries = async () => {
      if (!user || !user.huid) {
        Alert.alert('Error', 'User not found. Please log in again.');
        navigation.navigate('Login');
        return;
      }

      try {
        const response = await fetch(API_URL + `/beneficiaries?huid=${user.huid}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();
        if (response.ok && data.beneficiaries) {
          setBeneficiaries(data.beneficiaries);
        } else {
          console.error('Failed to load beneficiaries:', data.message);
          setBeneficiaries(user.beneficiaries || []);
          Alert.alert('Error', 'Failed to load beneficiaries from server. Showing cached data.');
        }
      } catch (error) {
        console.error('Error loading beneficiaries:', error);
        setBeneficiaries(user.beneficiaries || []);
        Alert.alert('Error', 'Unable to load beneficiaries from server. Showing cached data.');
      }
    };
    loadBeneficiaries();
  }, [user, navigation]);

  const addBeneficiary = async () => {
    if (!beneficiaryName || !accountNumber || !selectedBank) {
      Alert.alert('Error', 'Please fill in all fields to add a beneficiary');
      return;
    }

    if (!user || !user.huid) {
      Alert.alert('Error', 'User session expired. Please log in again.');
      navigation.navigate('Login');
      return;
    }

    try {
      const response = await fetch(API_URL + '/add-beneficiary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          huid: user.huid,
          beneficiaryName,
          accountNumber,
          bank: selectedBank.name,
        }),
      });

      const data = await response.json();

      if (response.ok && data.user && data.user.beneficiaries) {
        setBeneficiaries(data.user.beneficiaries);
        setBeneficiaryName('');
        setAccountNumber('');
        setSelectedBank(null);
        setSearchText('');
        toggleModal();
      } else {
        console.error('Invalid response structure:', data);
        Alert.alert('Error', data.message || 'Failed to add beneficiary');
      }
    } catch (error) {
      console.error('Error adding beneficiary:', error);
      Alert.alert('Error', 'Unable to add beneficiary');
    }
  };

  const toggleModal = () => {
    if (isModalVisible) {
      Animated.timing(modalAnim, {
        toValue: 0,
        duration: 300,
        easing: Easing.ease,
        useNativeDriver: true,
      }).start(() => setIsModalVisible(false));
    } else {
      setIsModalVisible(true);
      Animated.timing(modalAnim, {
        toValue: 1,
        duration: 300,
        easing: Easing.ease,
        useNativeDriver: true,
      }).start();
    }
  };

  const toggleTransferModal = () => {
    if (isTransferModalVisible) {
      Animated.timing(transferModalAnim, {
        toValue: 0,
        duration: 300,
        easing: Easing.ease,
        useNativeDriver: true,
      }).start(() => setIsTransferModalVisible(false));
    } else {
      setIsTransferModalVisible(true);
      Animated.timing(transferModalAnim, {
        toValue: 1,
        duration: 300,
        easing: Easing.ease,
        useNativeDriver: true,
      }).start();
    }
  };

  const handleButtonPressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handleButtonPressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const handleTransfer = async () => {
    if (!amount || !selectedBeneficiary) {
      Alert.alert('Error', 'Please select a beneficiary and enter an amount');
      return;
    }

    if (!user || !user.huid) {
      Alert.alert('Error', 'User session expired. Please log in again.');
      navigation.navigate('Login');
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Error', 'Amount must be a positive number');
      return;
    }
    if (parsedAmount > user.balance) {
      Alert.alert('Error', 'Insufficient funds');
      return;
    }

    setIsTransferring(true);
    Vibration.vibrate(50);

    try {
      const response = await fetch(API_URL + '/transfer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          senderHuid: user.huid,
          receiverAccountNumber: selectedBeneficiary.accountNumber,
          amount: parsedAmount,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Transaction Successful', `Sent Rs. ${amount} to ${selectedBeneficiary.name}`);
        setIsTransferModalVisible(false);
        setAmount('');
        setSelectedBeneficiary(null);
        navigation.navigate('Dashboard', { user: data.user });
      } else {
        Alert.alert('Error', data.message || 'Failed to process transaction');
      }
    } catch (error) {
      console.error('Error processing transaction:', error);
      Alert.alert('Error', 'Unable to process transaction');
    } finally {
      setIsTransferring(false);
    }
  };

  const renderBeneficiaryItem = ({ item }) => (
    <LinearGradient
      colors={['#1E3A8A', '#3B82F6']}
      style={styles.beneficiaryCard}
    >
      <View style={styles.beneficiaryDetails}>
        <Text style={styles.beneficiaryName}>{item.name}</Text>
        <Text style={styles.beneficiaryInfo}>{item.bank} - {item.accountNumber}</Text>
      </View>
      <TouchableOpacity
        style={styles.transferButton}
        onPress={() => {
          setSelectedBeneficiary(item);
          toggleTransferModal();
        }}
      >
        <LinearGradient
          colors={['#3B82F6', '#60A5FA']}
          style={styles.transferButtonGradient}
        >
          <Feather name="arrow-right" size={20} color="#FFFFFF" />
          <Text style={styles.transferButtonText}>Send</Text>
        </LinearGradient>
      </TouchableOpacity>
    </LinearGradient>
  );

  return (
    <LinearGradient
      colors={['#0A1F44', '#1E3A8A']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.headerContainer}>
        <LinearGradient
          colors={['#1E3A8A', '#3B82F6', '#60A5FA']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerCard}
        >
          <LinearGradient
            colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.05)']}
            style={styles.glassOverlay}
          />
          <Text style={styles.headerText}>Send Money</Text>
        </LinearGradient>
      </View>

      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={24} color="#93C5FD" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search Beneficiaries"
          value={searchText}
          onChangeText={setSearchText}
          placeholderTextColor="#93C5FD"
        />
      </View>

      <TouchableOpacity onPress={toggleModal} style={styles.addButton}>
        <LinearGradient
          colors={['#3B82F6', '#60A5FA']}
          style={styles.addButtonGradient}
        >
          <MaterialIcons name="person-add" size={24} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Add New Beneficiary</Text>
        </LinearGradient>
      </TouchableOpacity>

      <FlatList
        data={beneficiaries.filter(beneficiary =>
          beneficiary.name.toLowerCase().includes(searchText.toLowerCase())
        )}
        renderItem={renderBeneficiaryItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.beneficiaryList}
        ListEmptyComponent={<Text style={styles.emptyText}>No beneficiaries found.</Text>}
      />

      <Modal visible={isModalVisible} animationType="none" transparent={true}>
        <View style={styles.modalOverlay}>
          <Animated.View
            style={[styles.modalContainer, { transform: [{ scale: modalAnim.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] }) }], opacity: modalAnim }]}
          >
            <LinearGradient
              colors={['#0A1F44', '#1E3A8A', '#3B82F6']}
              style={styles.modalContent}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add New Beneficiary</Text>
                <TouchableOpacity onPress={toggleModal} style={styles.closeButton}>
                  <MaterialIcons name="close" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <TextInput
                  style={styles.enhancedInput}
                  placeholder="Beneficiary Name"
                  value={beneficiaryName}
                  onChangeText={setBeneficiaryName}
                  placeholderTextColor="#93C5FD"
                  autoCapitalize="words"
                />
                {(!beneficiaryName && isModalVisible) && <Text style={styles.errorText}>Name is required</Text>}
                <TextInput
                  style={styles.enhancedInput}
                  placeholder="Account Number"
                  value={accountNumber}
                  onChangeText={setAccountNumber}
                  keyboardType="numeric"
                  placeholderTextColor="#93C5FD"
                />
                {(!accountNumber && isModalVisible) && <Text style={styles.errorText}>Account number is required</Text>}
              </View>

              <View style={styles.dropdownContainer}>
                <TouchableOpacity
                  style={styles.dropdownButton}
                  onPress={() => setIsBankDropdownVisible(!isBankDropdownVisible)}
                >
                  <Text style={styles.dropdownButtonText}>
                    {selectedBank ? selectedBank.name : 'Select Bank'}
                  </Text>
                  <MaterialIcons name={isBankDropdownVisible ? 'expand-less' : 'expand-more'} size={24} color="#FFFFFF" />
                </TouchableOpacity>
                {isBankDropdownVisible && (
                  <FlatList
                    data={banks}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={styles.bankOption}
                        onPress={() => {
                          setSelectedBank(item);
                          setIsBankDropdownVisible(false);
                        }}
                      >
                        <Text style={styles.bankOptionText}>{item.name}</Text>
                      </TouchableOpacity>
                    )}
                    style={styles.bankOptionsList}
                  />
                )}
                {(!selectedBank && isModalVisible) && <Text style={styles.errorText}>Bank is required</Text>}
              </View>

              <View style={styles.buttonGroup}>
                <TouchableOpacity onPress={addBeneficiary} style={styles.actionButton}>
                  <LinearGradient
                    colors={['#3B82F6', '#60A5FA']}
                    style={styles.actionButtonGradient}
                  >
                    <Text style={styles.actionButtonText}>Add Beneficiary</Text>
                  </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity onPress={toggleModal} style={styles.cancelButton}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </Animated.View>
        </View>
      </Modal>

      <Modal visible={isTransferModalVisible} animationType="none" transparent={true}>
        <View style={styles.modalOverlay}>
          <Animated.View
            style={[
              styles.transferModalContainer,
              {
                transform: [{ scale: transferModalAnim.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] }) }],
                opacity: transferModalAnim,
              },
            ]}
          >
            <LinearGradient
              colors={['#0A1F44', '#1E3A8A', '#3B82F6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.transferModalContent}
            >
              <LinearGradient
                colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
                style={styles.transferModalGlassOverlay}
              />
              <View style={styles.transferModalHeader}>
                <Text style={styles.transferModalTitle}>Confirm Transfer</Text>
                <TouchableOpacity onPress={toggleTransferModal} style={styles.transferCloseButton}>
                  <MaterialIcons name="close" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              <View style={styles.transferDetails}>
                <View style={styles.iconWrapper}>
                  <Feather name="user" size={40} color="#60A5FA" />
                </View>
                <Text style={styles.recipientName}>{selectedBeneficiary?.name}</Text>
                <Text style={styles.recipientInfo}>
                  {selectedBeneficiary?.bank} - {selectedBeneficiary?.accountNumber}
                </Text>
              </View>

              <View style={styles.amountContainer}>
                <Text style={styles.amountLabel}>Amount to Send</Text>
                <LinearGradient
                  colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.2)']}
                  style={styles.amountInputWrapper}
                >
                  <Text style={styles.currencyIcon}>₨</Text>
                  <TextInput
                    style={styles.amountInput}
                    placeholder="Enter Amount"
                    value={amount}
                    onChangeText={setAmount}
                    keyboardType="numeric"
                    placeholderTextColor="#93C5FD"
                  />
                </LinearGradient>
                <Text style={styles.debitLimit}>
                  Available Balance: Rs. {user?.balance?.toLocaleString() || '0'}.00
                </Text>
              </View>

              <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                <TouchableOpacity
                  onPress={handleTransfer}
                  onPressIn={handleButtonPressIn}
                  onPressOut={handleButtonPressOut}
                  style={styles.transferActionButton}
                  disabled={isTransferring}
                >
                  <LinearGradient
                    colors={['#3B82F6', '#60A5FA']}
                    style={styles.transferActionButtonGradient}
                  >
                    {isTransferring ? (
                      <Text style={styles.transferActionButtonText}>Processing...</Text>
                    ) : (
                      <>
                        <Feather name="send" size={20} color="#FFFFFF" style={styles.sendIcon} />
                        <Text style={styles.transferActionButtonText}>
                          Send Rs. {amount || '0'}
                        </Text>
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>

              <TouchableOpacity
                onPress={toggleTransferModal}
                style={styles.transferCancelButton}
                onPressIn={handleButtonPressIn}
                onPressOut={handleButtonPressOut}
              >
                <Text style={styles.transferCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </LinearGradient>
          </Animated.View>
        </View>
      </Modal>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  headerCard: {
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
  headerText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: 'rgba(96, 165, 250, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 15,
    paddingHorizontal: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    paddingVertical: 10,
  },
  addButton: {
    marginBottom: 20,
  },
  addButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 25,
    shadowColor: '#60A5FA',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  beneficiaryList: {
    paddingBottom: 100,
  },
  beneficiaryCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
    shadowColor: '#60A5FA',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  beneficiaryDetails: {
    flex: 1,
  },
  beneficiaryName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
  },
  beneficiaryInfo: {
    color: '#93C5FD',
    fontSize: 14,
  },
  transferButton: {
    marginLeft: 10,
  },
  transferButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 25,
    shadowColor: '#60A5FA',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  transferButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 5,
  },
  emptyText: {
    color: '#93C5FD',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  modalContainer: {
    width: '90%',
    borderRadius: 20,
    overflow: 'hidden',
  },
  modalContent: {
    padding: 20,
    borderRadius: 20,
    shadowColor: '#60A5FA',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 15,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(96, 165, 250, 0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  closeButton: {
    padding: 5,
  },
  inputGroup: {
    marginBottom: 20,
  },
  enhancedInput: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    padding: 15,
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    shadowColor: '#60A5FA',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  errorText: {
    color: '#FF4040',
    fontSize: 12,
    marginBottom: 10,
    textAlign: 'center',
  },
  dropdownContainer: {
    marginBottom: 20,
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    shadowColor: '#60A5FA',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  dropdownButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  bankOptionsList: {
    maxHeight: 150,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginTop: 5,
    shadowColor: '#60A5FA',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  bankOption: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  bankOptionText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  actionButton: {
    flex: 1,
    marginRight: 10,
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 25,
    shadowColor: '#60A5FA',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    flex: 1,
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  transferModalContainer: {
    width: '90%',
    borderRadius: 25,
    overflow: 'hidden',
  },
  transferModalContent: {
    padding: 25,
    borderRadius: 25,
    shadowColor: '#60A5FA',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 15,
  },
  transferModalGlassOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  transferModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  transferModalTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(96, 165, 250, 0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  transferCloseButton: {
    padding: 5,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
  },
  transferDetails: {
    alignItems: 'center',
    marginBottom: 25,
  },
  iconWrapper: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  recipientName: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 5,
  },
  recipientInfo: {
    color: '#93C5FD',
    fontSize: 16,
  },
  amountContainer: {
    marginBottom: 25,
  },
  amountLabel: {
    color: '#93C5FD',
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
  },
  amountInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    shadowColor: '#60A5FA',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  currencyIcon: {
    marginRight: 10,
    color: '#FFFFFF',
  },
  amountInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '500',
  },
  debitLimit: {
    fontSize: 14,
    color: '#93C5FD',
    textAlign: 'center',
  },
  transferActionButton: {
    marginBottom: 15,
  },
  transferActionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 25,
    shadowColor: '#60A5FA',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  sendIcon: {
    marginRight: 10,
  },
  transferActionButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  transferCancelButton: {
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  transferCancelButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default TransferMoney;