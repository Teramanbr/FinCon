import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, Modal, TouchableOpacity, Image } from 'react-native';
import { useAuth } from '@/components/auth/AuthContext';
import { auth, db } from '../firebaseConfig';
import { deleteUser } from 'firebase/auth';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';

const ProfileScreen = () => {
  const { user, logout } = useAuth();
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
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const router = useRouter();

  const handleDeleteAccount = async () => {
    try {
      if (!auth.currentUser) {
        throw new Error('No authenticated user');
      }

      // Delete all user transactions
      const userId = auth.currentUser.uid;
      const txCol = collection(db, 'users', userId, 'transactions');
      const txs = await getDocs(txCol);
      for (const tx of txs.docs) {
        await deleteDoc(tx.ref);
      }
      
      // Delete user document
      await deleteDoc(doc(db, 'users', userId));

      // Delete auth user account
      await deleteUser(auth.currentUser);
      
      // Verify deletion was successful
      if (auth.currentUser) {
        throw new Error('User account still exists after deletion attempt');
      }

      // Only redirect if deletion was successful
      router.replace('/login');
    } catch (error: unknown) {
      console.error('Account deletion failed:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Could not delete account. Please re-login and try again.';
      Alert.alert('Deletion Failed', errorMessage);
      setDeleteConfirmVisible(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Menu Button */}
      <TouchableOpacity onPress={() => setMenuVisible(true)} style={styles.menuButton}>
        <FontAwesome name="bars" size={28} color="#FF7001" />
      </TouchableOpacity>

      {/* Navigation Menu */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity style={styles.menuBackdrop} activeOpacity={1} onPress={() => setMenuVisible(false)}>
          <View style={styles.menuContent}>
            <TouchableOpacity onPress={() => { setMenuVisible(false); router.replace('/'); }} style={styles.menuItem}>
              <FontAwesome name="home" size={18} color="#FF7001" style={styles.menuIcon} />
              <Text style={styles.menuText}>Main Page</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setMenuVisible(false); router.replace('/profile'); }} style={styles.menuItem}>
              <FontAwesome name="user" size={18} color="#FF7001" style={styles.menuIcon} />
              <Text style={styles.menuText}>Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setMenuVisible(false); logout(); }} style={styles.menuItem}>
              <FontAwesome name="sign-out" size={18} color="#FF7001" style={styles.menuIcon} />
              <Text style={styles.menuText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Profile Content */}
      <View style={styles.profileCard}>
        {/* Profile Picture */}
        <View style={styles.profilePictureContainer}>
          <Image
            source={user?.photoURL ? { uri: user.photoURL } : require('@/assets/images/icon.png')}
            style={styles.profilePicture}
          />
        </View>

        {/* Profile Info */}
        <Text style={styles.title}>Profile</Text>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Name:</Text>
          <Text style={styles.value}>{name}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Email:</Text>
          <Text style={styles.value}>{email}</Text>
        </View>

        {/* Actions */}
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={() => setDeleteConfirmVisible(true)}
        >
          <Text style={styles.deleteButtonText}>Delete Account</Text>
        </TouchableOpacity>

        {/* Delete Confirmation Modal */}
        <Modal
          visible={deleteConfirmVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setDeleteConfirmVisible(false)}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Delete Account</Text>
              <Text style={styles.modalText}>
                Are you sure you want to delete your account? This will permanently remove your data and cannot be undone.
              </Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setDeleteConfirmVisible(false)}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.deleteButtonModal]}
                  onPress={handleDeleteAccount}
                >
                  <Text style={styles.buttonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f8f8',
  },
  menuButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1,
  },
  menuBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  menuContent: {
    position: 'absolute',
    top: 60,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    minWidth: 200,
  },
  menuItem: {
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    marginRight: 12,
  },
  menuText: {
    color: '#FF7001',
    fontWeight: '600',
    fontSize: 16,
  },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginTop: 80,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  profilePictureContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  profilePicture: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#FF7001',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF7001',
    marginBottom: 24,
    textAlign: 'center',
  },
  infoRow: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: '#333',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  deleteButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#FF7001',
    borderRadius: 8,
    paddingVertical: 12,
    marginTop: 24,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#FF7001',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF7001',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    color: '#555',
    marginBottom: 24,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    minWidth: 120,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  deleteButtonModal: {
    backgroundColor: '#FF7001',
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ProfileScreen;
