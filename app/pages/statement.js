import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { useRoute } from '@react-navigation/native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';

function StatementScreen({ navigation }) {
  const route = useRoute();
  const user = route.params?.user;

  if (!user) {
    return <Text>Loading...</Text>;
  }

  const transactions = user.transactions
    ? user.transactions.map((transaction, index) => ({
        id: index.toString(),
        date: new Date(transaction.timestamp).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        time: new Date(transaction.timestamp).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        description: transaction.type === 'sent' ? `Sent to ${transaction.receiver}` : `Received from ${transaction.sender}`,
        amount: transaction.type === 'sent' ? -transaction.amount : transaction.amount,
        type: transaction.type === 'sent' ? 'debit' : 'credit',
        bank: user.bank,
      }))
    : [];

  const generatePDF = async () => {
    try {
      const htmlContent = `
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; margin: 40px; }
              h1 { font-size: 24px; color: #333; }
              .header { margin-bottom: 20px; }
              .header p { font-size: 14px; margin: 5px 0; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #ccc; padding: 8px; text-align: left; font-size: 12px; }
              th { background-color: #f2f2f2; font-weight: bold; }
              .credit { color: green; }
              .debit { color: red; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Bank Statement</h1>
              <p>Account Holder: ${user.full_name}</p>
              <p>Account Number: ${user.account_number}</p>
              <p>Generated on: ${new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}</p>
            </div>
            <table>
              <tr>
                <th>Date</th>
                <th>Time</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Bank</th>
              </tr>
              ${transactions
                .map(
                  (txn) => `
                    <tr>
                      <td>${txn.date}</td>
                      <td>${txn.time}</td>
                      <td>${txn.description}</td>
                      <td class="${txn.type}">${
                    txn.type === 'credit' ? '+' : '-'
                  }Rs ${Math.abs(txn.amount).toLocaleString()}</td>
                      <td>${txn.bank}</td>
                    </tr>
                  `
                )
                .join('')}
            </table>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false,
      });

      const pdfPath = `${
        FileSystem.documentDirectory
      }bank_statement_${new Date().toISOString().split('T')[0]}.pdf`;
      await FileSystem.moveAsync({
        from: uri,
        to: pdfPath,
      });

      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert('Error', 'Sharing is not available on this device.');
        return;
      }

      await Sharing.shareAsync(pdfPath, {
        mimeType: 'application/pdf',
        dialogTitle: 'Share or Save Bank Statement',
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      Alert.alert('Error', 'Failed to generate or share the PDF.');
    }
  };

  const renderTransaction = ({ item }) => (
    <LinearGradient
      colors={['#1E3A8A', '#3B82F6']}
      style={styles.transactionCard}
    >
      <View style={styles.transactionDetails}>
        <Text style={styles.transactionDate}>{item.date}</Text>
        <Text style={styles.transactionDescription}>{item.description}</Text>
      </View>
      <Text
        style={[
          styles.transactionAmount,
          { color: item.type === 'credit' ? '#00FF00' : '#FF0000' },
        ]}
      >
        {item.type === 'credit' ? '+' : '-'}Rs {Math.abs(item.amount).toLocaleString()}
      </Text>
    </LinearGradient>
  );

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
          <Text style={styles.cardText}>Statement</Text>
        </LinearGradient>
      </View>

      {/* Greeting and Download Button */}
      <View style={styles.greetingContainer}>
        <Text style={styles.greetingText}>Transaction History</Text>
        <Text style={styles.subText}>View your recent transactions</Text>
        <TouchableOpacity onPress={generatePDF} style={styles.downloadButton}>
          <LinearGradient
            colors={['#3B82F6', '#60A5FA']}
            style={styles.downloadButtonGradient}
          >
            <Feather name="download" size={20} color="#FFFFFF" />
            <Text style={styles.downloadButtonText}>Download PDF</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Transactions List */}
      <FlatList
        data={transactions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.transactionList}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No transactions found.</Text>
        }
      />
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
    marginBottom: 20,
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
    marginBottom: 10,
  },
  downloadButton: {
    marginTop: 10,
  },
  downloadButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 25,
    shadowColor: '#60A5FA',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  downloadButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  transactionList: {
    paddingBottom: 100,
  },
  transactionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
    shadowColor: '#60A5FA',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionDate: {
    color: '#93C5FD',
    fontSize: 12,
    marginBottom: 5,
  },
  transactionDescription: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyText: {
    color: '#93C5FD',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
});

export default StatementScreen;