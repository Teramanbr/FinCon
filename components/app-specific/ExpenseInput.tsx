import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Text } from 'react-native';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';

interface ExpenseInputProps {
  onAddExpense: (description: string, amount: string) => void;
}

const ExpenseInput: React.FC<ExpenseInputProps> = ({ onAddExpense }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const colorScheme = useColorScheme();

  const handleAddExpense = () => {
    if (!description || !amount) return;
    onAddExpense(description, amount);
    setDescription('');
    setAmount('');
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].text }]}>
        Adicionar Despesa
      </Text>
      <TextInput
        style={[styles.input, { 
          backgroundColor: Colors[colorScheme ?? 'light'].background, 
          color: Colors[colorScheme ?? 'light'].text,
          borderColor: Colors[colorScheme ?? 'light'].tabIconDefault
        }]}
        placeholder="Descrição"
        placeholderTextColor={Colors[colorScheme ?? 'light'].tabIconDefault}
        value={description}
        onChangeText={setDescription}
      />
      <TextInput
        style={[styles.input, { 
          backgroundColor: Colors[colorScheme ?? 'light'].background, 
          color: Colors[colorScheme ?? 'light'].text,
          borderColor: Colors[colorScheme ?? 'light'].tabIconDefault
        }]}
        placeholder="Valor"
        placeholderTextColor={Colors[colorScheme ?? 'light'].tabIconDefault}
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
      />
      <Button title="Adicionar Despesa" onPress={handleAddExpense} color="#FF7001" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 15,
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    height: 40,
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
});

export default ExpenseInput;
