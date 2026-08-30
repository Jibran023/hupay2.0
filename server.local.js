// Local, database-free backend for testing the app without MongoDB set up yet.
// Reads/writes users.json directly instead of MongoDB. Mirrors the endpoints
// in server.js so the app behaves the same either way.
// Switch back to the real backend anytime with `npm run start:backend`.
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const USERS_FILE = path.join(__dirname, 'users.json');

const app = express();
app.use(cors());
app.use(express.json());

function loadUsers() {
  return JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
}

function saveUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

app.post('/login', (req, res) => {
  // NOTE: password check disabled for local testing. Any password logs in as
  // this huid. Re-add the `user.password !== password` check before this is
  // ever used for anything beyond your own local dev.
  const { huid } = req.body;

  if (!huid) {
    return res.status(400).json({ message: 'Missing credentials' });
  }

  const users = loadUsers();
  const user = users.find((u) => u.huid === huid);

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.status(200).json({
    message: 'Login successful',
    user: {
      huid: user.huid,
      full_name: user.full_name,
      account_number: user.account_number,
      balance: user.balance,
      beneficiaries: user.beneficiaries || [],
    },
  });
});

// Used for fingerprint login: the device's biometric check replaces the password,
// so this looks the user up by huid alone.
app.get('/user/:huid', (req, res) => {
  const { huid } = req.params;
  const users = loadUsers();
  const user = users.find((u) => u.huid === huid);

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.status(200).json({
    user: {
      huid: user.huid,
      full_name: user.full_name,
      account_number: user.account_number,
      balance: user.balance,
      beneficiaries: user.beneficiaries || [],
    },
  });
});

app.get('/beneficiaries', (req, res) => {
  const { huid } = req.query;
  if (!huid) {
    return res.status(400).json({ message: 'Missing user ID (huid)' });
  }

  const users = loadUsers();
  const user = users.find((u) => u.huid === huid);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.status(200).json({ beneficiaries: user.beneficiaries || [] });
});

app.post('/add-beneficiary', (req, res) => {
  const { huid, beneficiaryName, accountNumber, bank } = req.body;
  if (!huid || !beneficiaryName || !accountNumber || !bank) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const users = loadUsers();
  const user = users.find((u) => u.huid === huid);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  if (!user.beneficiaries) user.beneficiaries = [];
  const newBeneficiary = {
    id: user.beneficiaries.length > 0 ? Math.max(...user.beneficiaries.map((b) => b.id)) + 1 : 1,
    name: beneficiaryName,
    accountNumber,
    bank,
  };
  user.beneficiaries.push(newBeneficiary);
  saveUsers(users);

  res.status(200).json({ message: 'Beneficiary added successfully', user });
});

app.post('/transfer', (req, res) => {
  const { senderHuid, receiverAccountNumber, amount } = req.body;
  if (!senderHuid || !receiverAccountNumber || !amount) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const users = loadUsers();
  const sender = users.find((u) => u.huid === senderHuid);
  const receiver = users.find((u) => u.account_number === receiverAccountNumber);

  if (!sender) return res.status(404).json({ message: 'Sender not found' });
  if (!receiver) return res.status(404).json({ message: 'Receiver not found' });

  const parsedAmount = parseFloat(amount);
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    return res.status(400).json({ message: 'Amount must be a positive number' });
  }
  if (parsedAmount > sender.balance) {
    return res.status(400).json({ message: 'Insufficient funds' });
  }

  sender.balance -= parsedAmount;
  receiver.balance += parsedAmount;

  const timestamp = new Date().toISOString();
  if (!sender.transactions) sender.transactions = [];
  if (!receiver.transactions) receiver.transactions = [];
  sender.transactions.push({ timestamp, amount: parsedAmount, sender: sender.full_name, receiver: receiver.full_name, type: 'sent' });
  receiver.transactions.push({ timestamp, amount: parsedAmount, sender: sender.full_name, receiver: receiver.full_name, type: 'received' });

  saveUsers(users);

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
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Local (database-free) server running on http://localhost:${PORT}`);
  console.log(`   Reading/writing ${USERS_FILE}`);
});
