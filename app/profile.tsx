import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, Button, Modal, TouchableOpacity } from 'react-native';
import { useAuth } from './auth/AuthContext';
import { auth, db } from '../firebaseConfig';
import { deleteUser } from 'firebase/auth';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';

const ProfileScreen = () => {
  const { user } = useAuth();
  // Defensive: handle user object from Firebase Auth
  let email = '';
  let name = '';
  if (user) {
    if (typeof user.email === 'string') {
      email = user.email;
      name = user.displayName || email.split('@')[0];
    } else if (user.user && typeof user.user.email === 'string') {
      email = user.user.email;
      name = user.user.displayName || email.split('@')[0];
    }
  }
  const [menuVisible, setMenuVisible] = useState(false);
  const router = useRouter();

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
      <TouchableOpacity onPress={() => setMenuVisible(true)} style={{ position: 'absolute', top: 40, right: 20, zIndex: 1 }}>
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
          </View>
        </TouchableOpacity>
      </Modal>
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
