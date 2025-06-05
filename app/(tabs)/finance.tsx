import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import ExpenseInput from '../components/ExpenseInput';
import IncomeInput from '../components/IncomeInput';

interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'expense' | 'income';
  date: Date;
}

const FinanceScreen: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balance, setBalance] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const colorScheme = useColorScheme();

  useEffect(() => {
    calculateTotals();
  }, [transactions]);

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

  const handleAddExpense = (description: string, amount: string) => {
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      description,
      amount: parseFloat(amount) || 0,
      type: 'expense',
      date: new Date(),
    };
    setTransactions([...transactions, newTransaction]);
  };

  const handleAddIncome = (description: string, amount: string) => {
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      description,
      amount: parseFloat(amount) || 0,
      type: 'income',
      date: new Date(),
    };
    setTransactions([...transactions, newTransaction]);
  };

  const renderTransaction = ({ item }: { item: Transaction }) => (
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
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
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
      />
    </View>
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
