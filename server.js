// server/server.js
import express from 'express';  // Importing express with ES module syntax
import { MongoClient } from 'mongodb'; // Import MongoDB native driver
import cors from 'cors';  // Import cors
import dotenv from 'dotenv';  // Import dotenv to use environment variables

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());  // Parse JSON requests

// Connect to MongoDB Atlas (native driver)
let db;
MongoClient.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((client) => {
    console.log('✅ Connected to MongoDB Atlas');
    db = client.db('hu_pay'); // Access the 'hu_pay' database
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
  });

// Error handling for uncaught exceptions and unhandled rejections
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
});

// POST route for login
app.post('/login', async (req, res) => {
  const { huid, password } = req.body;  // Destructure the huid and password from the request body

  if (!huid || !password) {
    return res.status(400).json({ message: 'Missing credentials' });
  }

  try {
    // Search for the user by huid
    const user = await db.collection('users').findOne({ huid });

    if (!user) {
      console.log(`❌ Login failed: user not found for huid ${huid}`);
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.password !== password) {
      console.log(`❌ Login failed: incorrect password for huid ${huid}`);
      return res.status(401).json({ message: 'Incorrect password' });
    }

    console.log('✅ Login successful for user:', user);

    res.status(200).json({
      message: 'Login successful',
      user: {
        huid,
        full_name: user.full_name,
        account_number: user.account_number,
        balance: user.balance,
        beneficiaries: user.beneficiaries || [],
      },
    });
  } catch (error) {
    console.error('❌ Error during login:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET route to fetch beneficiaries
app.get('/beneficiaries', async (req, res) => {
  const { huid } = req.query;

  if (!huid) {
    return res.status(400).json({ message: 'Missing user ID (huid)' });
  }

  try {
    // Query MongoDB to find the user by huid
    const user = await db.collection('users').findOne({ huid });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ beneficiaries: user.beneficiaries || [] });
  } catch (error) {
    console.error('❌ Error fetching beneficiaries:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST route for adding a beneficiary
app.post('/add-beneficiary', async (req, res) => {
  const { huid, beneficiaryName, accountNumber, bank } = req.body;

  if (!huid || !beneficiaryName || !accountNumber || !bank) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    // Query MongoDB to find the user by huid
    const user = await db.collection('users').findOne({ huid });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Initialize beneficiaries array if it doesn't exist
    if (!user.beneficiaries) {
      user.beneficiaries = [];
    }

    // Add new beneficiary
    const newBeneficiary = {
      id: user.beneficiaries.length > 0 ? Math.max(...user.beneficiaries.map(b => b.id)) + 1 : 1,
      name: beneficiaryName,
      accountNumber,
      bank,
    };

    user.beneficiaries.push(newBeneficiary);

    // Save the updated user document
    await db.collection('users').updateOne({ huid }, { $set: { beneficiaries: user.beneficiaries } });

    res.status(200).json({
      message: 'Beneficiary added successfully',
      user: { ...user, beneficiaries: user.beneficiaries }
    });
  } catch (error) {
    console.error('❌ Error adding beneficiary:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET route to fetch balance
app.get('/get-balance', async (req, res) => {
  const { huid } = req.query;

  if (!huid) {
    return res.status(400).json({ message: 'Missing user ID' });
  }

  try {
    // Query MongoDB to find the user by huid
    const user = await db.collection('users').findOne({ huid });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ balance: user.balance });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST route for transferring money
app.post('/transfer', async (req, res) => {
  const { senderHuid, receiverAccountNumber, amount } = req.body;

  if (!senderHuid || !receiverAccountNumber || !amount) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    // Query MongoDB for both sender and receiver
    const sender = await db.collection('users').findOne({ huid: senderHuid });
    const receiver = await db.collection('users').findOne({ account_number: receiverAccountNumber });

    if (!sender) {
      return res.status(404).json({ message: 'Sender not found' });
    }
    if (!receiver) {
      return res.status(404).json({ message: 'Receiver not found' });
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ message: 'Amount must be a positive number' });
    }
    if (parsedAmount > sender.balance) {
      return res.status(400).json({ message: 'Insufficient funds' });
    }

    // Update balances
    sender.balance -= parsedAmount;
    receiver.balance += parsedAmount;

    // Create transaction
    const transaction = {
      timestamp: new Date().toISOString(),
      amount: parsedAmount,
      sender: sender.full_name,
      receiver: receiver.full_name,
    };

    // Initialize transactions arrays if they don't exist
    if (!sender.transactions) sender.transactions = [];
    if (!receiver.transactions) receiver.transactions = [];

    sender.transactions.push({ ...transaction, type: 'sent' });
    receiver.transactions.push({ ...transaction, type: 'received' });

    // Save the updated user documents
    await db.collection('users').updateOne({ huid: senderHuid }, { $set: { balance: sender.balance, transactions: sender.transactions } });
    await db.collection('users').updateOne({ account_number: receiverAccountNumber }, { $set: { balance: receiver.balance, transactions: receiver.transactions } });

    res.status(200).json({
      message: 'Transaction successful',
      user: {
        huid: sender.huid,
        full_name: sender.full_name,
        account_number: sender.account_number,
        balance: sender.balance,
        beneficiaries: sender.beneficiaries || [],
        transactions: sender.transactions || [],
      },
    });
  } catch (error) {
    console.error('❌ Error processing transaction:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET route to retrieve a user by huid and password (for testing only)
app.get('/get-user', async (req, res) => {
  const { huid, password } = req.query;

  if (!huid || !password) {
    return res.status(400).json({ message: 'Missing huid or password' });
  }

  try {
    const user = await db.collection('users').findOne({ huid, password });

    if (!user) {
      return res.status(404).json({ message: 'User not found or password incorrect' });
    }

    res.status(200).json({
      message: 'User found',
      user: {
        huid: user.huid,
        full_name: user.full_name,
        account_number: user.account_number,
        balance: user.balance,
        beneficiaries: user.beneficiaries || [],
        transactions: user.transactions || [],
      },
    });
  } catch (error) {
    console.error('❌ Error fetching user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});
