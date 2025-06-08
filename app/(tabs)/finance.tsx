import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ScrollView, TextInput, Button, Modal, TouchableOpacity } from 'react-native';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import ExpenseInput from '@/components/app-specific/ExpenseInput';
import IncomeInput from '@/components/app-specific/IncomeInput';
import { db } from '../../firebaseConfig';
import { collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '@/components/auth/AuthContext';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';

interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'expense' | 'income';
  date: Date;
}

const FinanceScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balance, setBalance] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDescription, setEditDescription] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);
  const colorScheme = useColorScheme();
  const router = useRouter();

  useEffect(() => {
    calculateTotals();
  }, [transactions]);

  useEffect(() => {
    if (!user) return;
    // Listen to Firestore for this user's transactions
    const q = query(
      collection(db, 'users', user.uid, 'transactions'),
      orderBy('date', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const txs: Transaction[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          description: data.description,
          amount: data.amount,
          type: data.type,
          date: data.date?.toDate ? data.date.toDate() : new Date(data.date)
        };
      });
      setTransactions(txs);
    });
    return unsubscribe;
  }, [user]);

  const calculateTotals = () => {
    let income = 0;
    let expenses = 0;

    transactions.forEach(transaction => {
      if (transaction.type === 'income') {
        income += transaction.amount;
      } else {
        expenses += transaction.amount;
      }
    });

    setTotalIncome(income);
    setTotalExpenses(expenses);
    setBalance(income - expenses);
  };

  const handleAddExpense = async (description: string, amount: string) => {
    if (!user) return;
    await addDoc(collection(db, 'users', user.uid, 'transactions'), {
      description,
      amount: parseFloat(amount) || 0,
      type: 'expense',
      date: new Date(),
    });
  };

  const handleAddIncome = async (description: string, amount: string) => {
    if (!user) return;
    await addDoc(collection(db, 'users', user.uid, 'transactions'), {
      description,
      amount: parseFloat(amount) || 0,
      type: 'income',
      date: new Date(),
    });
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!user) return;
    await deleteDoc(doc(db, 'users', user.uid, 'transactions', id));
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingId(transaction.id);
    setEditDescription(transaction.description);
    setEditAmount(transaction.amount.toString());
  };

  const handleSaveEdit = async () => {
    if (!user || !editingId) return;
    await updateDoc(doc(db, 'users', user.uid, 'transactions', editingId), {
      description: editDescription,
      amount: parseFloat(editAmount) || 0,
    });
    setEditingId(null);
    setEditDescription('');
    setEditAmount('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditDescription('');
    setEditAmount('');
  };

  const renderTransaction = ({ item }: { item: Transaction }) => (
    editingId === item.id ? (
      <View style={[styles.transactionItem, { 
        backgroundColor: Colors[colorScheme ?? 'light'].background,
        borderColor: Colors[colorScheme ?? 'light'].tabIconDefault
      }]}> 
        <TextInput
          style={[styles.transactionText, { color: Colors[colorScheme ?? 'light'].text, flex: 1 }]}
          value={editDescription}
          onChangeText={setEditDescription}
        />
        <TextInput
          style={[styles.amountText, { color: item.type === 'income' ? 'green' : 'red', width: 80 }]}
          value={editAmount}
          onChangeText={setEditAmount}
          keyboardType="numeric"
        />
        <FontAwesome name="check" size={24} color="#FF7001" onPress={handleSaveEdit} style={{ marginHorizontal: 8 }} />
        <FontAwesome name="times" size={24} color="#ccc" onPress={handleCancelEdit} style={{ marginHorizontal: 8 }} />
      </View>
    ) : (
      <View style={[styles.transactionItem, { 
        backgroundColor: Colors[colorScheme ?? 'light'].background,
        borderColor: Colors[colorScheme ?? 'light'].tabIconDefault
      }]}> 
        <Text style={[styles.transactionText, { color: Colors[colorScheme ?? 'light'].text }]}>
          {item.description}
        </Text>
        <Text style={[
          styles.amountText, 
          { color: item.type === 'income' ? 'green' : 'red' }
        ]}>
          {item.type === 'income' ? '+' : '-'}${item.amount.toFixed(2)}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <FontAwesome name="pencil" size={22} color="#FF7001" onPress={() => handleEditTransaction(item)} style={{ marginRight: 8 }} />
          <FontAwesome name="trash" size={22} color="#FF7001" onPress={() => handleDeleteTransaction(item.id)} style={{ marginLeft: 8 }} />
        </View>
      </View>
    )
  );

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={true} horizontal={false}>
      <View style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}> 
        <TouchableOpacity onPress={() => setMenuVisible(true)} style={{ alignSelf: 'flex-end', margin: 16 }}>
          <FontAwesome name="bars" size={28} color="#FF7001" />
        </TouchableOpacity>
        <Modal
          visible={menuVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setMenuVisible(false)}
        >
          <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.2)' }} activeOpacity={1} onPress={() => setMenuVisible(false)}>
            <View style={{ position: 'absolute', top: 60, right: 20, backgroundColor: '#fff', borderRadius: 8, padding: 16, elevation: 4, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8 }}>
              <TouchableOpacity onPress={() => { setMenuVisible(false); router.replace('/'); }} style={{ paddingVertical: 8, flexDirection: 'row', alignItems: 'center' }}>
                <FontAwesome name="home" size={18} color="#FF7001" style={{ marginRight: 8 }} />
                <Text style={{ color: '#FF7001', fontWeight: 'bold', fontSize: 16 }}>Main Page</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { setMenuVisible(false); router.replace('/profile'); }} style={{ paddingVertical: 8, flexDirection: 'row', alignItems: 'center' }}>
                <FontAwesome name="user" size={18} color="#FF7001" style={{ marginRight: 8 }} />
                <Text style={{ color: '#FF7001', fontWeight: 'bold', fontSize: 16 }}>Profile</Text>
              </TouchableOpacity>
              <View style={{ height: 1, backgroundColor: '#eee', marginVertical: 4 }} />
              <TouchableOpacity onPress={() => { setMenuVisible(false); logout(); }} style={{ paddingVertical: 8, flexDirection: 'row', alignItems: 'center' }}>
                <FontAwesome name="sign-out" size={18} color="#FF7001" style={{ marginRight: 8 }} />
                <Text style={{ color: '#FF7001', fontWeight: 'bold', fontSize: 16 }}>Log out</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
        <View style={[styles.summaryContainer, { backgroundColor: '#FFF3E6' }]}> 
          <Text style={[styles.summaryTitle, { color: Colors[colorScheme ?? 'light'].text }]}> 
            Financial Summary 
          </Text> 
          <View style={styles.summaryRow}> 
            <Text style={[styles.summaryLabel, { color: Colors[colorScheme ?? 'light'].text }]}> 
              Balance: 
            </Text> 
            <Text style={[styles.summaryValue, { color: '#FF7001' }]}> 
              ${balance.toFixed(2)} 
            </Text> 
          </View> 
          <View style={styles.summaryRow}> 
            <Text style={[styles.summaryLabel, { color: Colors[colorScheme ?? 'light'].text }]}> 
              Income: 
            </Text> 
            <Text style={[styles.summaryValue, { color: '#FF7001' }]}> 
              ${totalIncome.toFixed(2)} 
            </Text> 
          </View> 
          <View style={styles.summaryRow}> 
            <Text style={[styles.summaryLabel, { color: Colors[colorScheme ?? 'light'].text }]}> 
              Expenses: 
            </Text> 
            <Text style={[styles.summaryValue, { color: '#FF7001' }]}> 
              ${totalExpenses.toFixed(2)} 
            </Text> 
          </View> 
        </View> 
        <IncomeInput onAddIncome={handleAddIncome} /> 
        <ExpenseInput onAddExpense={handleAddExpense} /> 
        <Text style={[styles.transactionsTitle, { color: Colors[colorScheme ?? 'light'].text }]}> 
          Recent Transactions 
        </Text> 
        <FlatList 
          data={transactions} 
          renderItem={renderTransaction} 
          keyExtractor={item => item.id} 
          style={styles.transactionsList} 
          scrollEnabled={false} // FlatList inside ScrollView: let ScrollView handle scrolling 
        /> 
        <Text style={{ textAlign: 'center', color: Colors[colorScheme ?? 'light'].tabIconDefault, marginVertical: 24, fontSize: 12 }}>
          Vinícius Stanley 2025 all rights reserved
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
  },
  summaryContainer: {
    backgroundColor: '#FFF3E6', // light orange background
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 16,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  transactionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  transactionsList: {
    flex: 1,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 1,
  },
  transactionText: {
    fontSize: 16,
  },
  amountText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default FinanceScreen;
