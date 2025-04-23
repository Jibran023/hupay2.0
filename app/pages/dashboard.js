import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRoute } from '@react-navigation/native';

function Dashboard({ navigation }) {
  const route = useRoute();
  const user = route.params?.user;

  if (!user) {
    return <Text>Loading...</Text>;
  }

  const renderTransactionItem = ({ item }) => (
    <View style={styles.transactionItem}>
      <View style={styles.transactionIconWrapper}>
        <Feather
          name={item.type === 'sent' ? 'arrow-up-right' : 'arrow-down-left'}
          size={20}
          color={item.type === 'sent' ? '#FF4040' : '#00C851'}
        />
      </View>
      <View style={styles.transactionDetails}>
        <Text style={styles.transactionText}>
          {item.type === 'sent' ? `Sent to ${item.receiver}` : `Received from ${item.sender}`}
        </Text>
        <Text style={styles.transactionDate}>
          {new Date(item.timestamp).toLocaleString()}
        </Text>
      </View>
      <Text style={[styles.transactionAmount, { color: item.type === 'sent' ? '#FF4040' : '#00C851' }]}>
        {item.type === 'sent' ? '-' : '+'} Rs. {item.amount.toLocaleString()}
      </Text>
    </View>
  );

  return (
    <LinearGradient colors={['#0A1F44', '#1E3A8A']} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity>
          <MaterialIcons name="menu" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>Logo</Text>
        </View>
        <TouchableOpacity>
          <Feather name="bell" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Balance Card with Gradient Effect */}
      <LinearGradient colors={['#1E3A8A', '#3B82F6']} style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Current balance</Text>
        <Text style={styles.balanceAmount}>Rs. {user.balance.toLocaleString()}.00</Text>
        <Text style={styles.accountHolder}>{user.full_name}</Text>
        <View style={styles.accountDetails}>
          <View>
            <Text style={styles.detailLabel}>Account type</Text>
            <Text style={styles.detailValue}>Current Account</Text>
          </View>
          <View>
            <Text style={styles.detailLabel}>Account number</Text>
            <Text style={styles.detailValue}>{user.account_number}</Text>
          </View>
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.sendMoneyButton} onPress={() => navigation.navigate('TransferMoney', { user })}>
            <Feather name="arrow-up-right" size={20} color="#FFFFFF" />
            <Text style={styles.sendMoneyText}>Send money</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.shareButton}>
            <Feather name="share-2" size={20} color="#FFFFFF" />
            <Text style={styles.shareText}>Share account</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Options Grid with Gradient Effect on each button */}
      <View style={styles.optionsContainer}>
        <TouchableOpacity style={styles.tileWrapper} onPress={() => navigation.navigate('PayBills', { user })}>
          <LinearGradient colors={['#1E3A8A', '#3B82F6']} style={styles.optionButton}>
            <MaterialIcons name="receipt" size={24} color="#FFFFFF" />
            <Text style={styles.optionText}>Pay Bills</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tileWrapper} onPress={() => navigation.navigate('CardScreen', { user })}>
          <LinearGradient colors={['#1E3A8A', '#3B82F6']} style={styles.optionButton}>
            <MaterialIcons name="credit-card" size={24} color="#FFFFFF" />
            <Text style={styles.optionText}>Debit Card</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tileWrapper} onPress={() => navigation.navigate('StatementScreen', { user })}>
          <LinearGradient colors={['#1E3A8A', '#3B82F6']} style={styles.optionButton}>
            <Feather name="file-text" size={24} color="#FFFFFF" />
            <Text style={styles.optionText}>Statement</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tileWrapper}>
          <LinearGradient colors={['#1E3A8A', '#3B82F6']} style={styles.optionButton}>
            <MaterialIcons name="favorite" size={24} color="#FFFFFF" />
            <Text style={styles.optionText}>Zakat & Sadaqt</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tileWrapper}>
          <LinearGradient colors={['#1E3A8A', '#3B82F6']} style={styles.optionButton}>
            <MaterialIcons name="smartphone" size={24} color="#FFFFFF" />
            <Text style={styles.optionText}>Mobile Recharge</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tileWrapper} onPress={() => navigation.navigate('SettingsScreen', { user })}>
          <LinearGradient colors={['#1E3A8A', '#3B82F6']} style={styles.optionButton}>
            <MaterialIcons name="settings" size={24} color="#FFFFFF" />
            <Text style={styles.optionText}>Settings</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Quick Access Tiles Below Options */}
      <View style={styles.quickAccessContainer}>
        <LinearGradient colors={['#1E3A8A', '#3B82F6']} style={styles.quickTile}>
          <Text style={styles.quickTileText}>Recent Transactions</Text>
          {user.transactions && user.transactions.length > 0 ? (
            <FlatList
              data={user.transactions.slice(0, 3)}
              renderItem={renderTransactionItem}
              keyExtractor={(item, index) => index.toString()}
              style={styles.transactionList}
            />
          ) : (
            <Text style={styles.noTransactionsText}>No transactions yet.</Text>
          )}
        </LinearGradient>

        <LinearGradient colors={['#1E3A8A', '#3B82F6']} style={styles.quickTile}>
          <Text style={styles.quickTileText}>My Goals</Text>
        </LinearGradient>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1E3A8A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  balanceCard: {
    marginTop: 20,
    padding: 20,
    borderRadius: 10,
    shadowColor: '#60A5FA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  balanceLabel: {
    color: '#93C5FD',
    fontSize: 16,
    fontWeight: '500',
  },
  balanceAmount: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  accountHolder: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  accountDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  detailLabel: {
    color: '#93C5FD',
    fontSize: 14,
  },
  detailValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 5,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sendMoneyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderRadius: 25,
  },
  sendMoneyText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E3A8A',
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#60A5FA',
  },
  shareText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingVertical: 20,
  },
  optionButton: {
    width: '100%',
    paddingVertical: 15,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 5,
  },
  quickAccessContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  quickTile: {
    marginBottom: 15,
    paddingVertical: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickTileText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 10,
  },
  tileWrapper: {
    width: '30%',
    marginVertical: 0,
  },
  transactionList: {
    width: '100%',
    maxHeight: 150,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  transactionIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  transactionDate: {
    color: '#93C5FD',
    fontSize: 12,
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: '600',
  },
  noTransactionsText: {
    color: '#93C5FD',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default Dashboard;