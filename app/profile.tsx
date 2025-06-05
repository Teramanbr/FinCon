import React from 'react';
import { View, Text, StyleSheet, Alert, Button } from 'react-native';
import { useAuth } from './auth/AuthContext';
import { auth, db } from '../firebaseConfig';
import { deleteUser } from 'firebase/auth';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

const ProfileScreen = () => {
  const { user } = useAuth();
  const email = user?.email || '';
  const name = email.split('@')[0];

  const handleDeleteAccount = async () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This will permanently remove your data and cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive', onPress: async () => {
            try {
              // Delete all user transactions
              const userId = auth.currentUser?.uid;
              if (userId) {
                const txCol = collection(db, 'users', userId, 'transactions');
                const txs = await getDocs(txCol);
                for (const tx of txs.docs) {
                  await deleteDoc(tx.ref);
                }
                // Delete user document (if you have one)
                await deleteDoc(doc(db, 'users', userId));
              }
              // Delete user auth account
              if (auth.currentUser) {
                await deleteUser(auth.currentUser);
              }
            } catch (e) {
              Alert.alert('Error', 'Failed to delete account. Please re-login and try again.');
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.label}>Name:</Text>
      <Text style={styles.value}>{name}</Text>
      <Text style={styles.label}>Email:</Text>
      <Text style={styles.value}>{email}</Text>
      <Button title="Delete Account" color="#FF7001" onPress={handleDeleteAccount} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF7001',
    marginBottom: 32,
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 12,
    color: '#333',
  },
  value: {
    fontSize: 18,
    color: '#555',
    marginBottom: 8,
  },
});

export default ProfileScreen;
