import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Text, Alert } from 'react-native';
import { useAuth } from '@/components/auth/AuthContext';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { useRouter } from 'expo-router';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'login' | 'signup' | 'reset'>('login');
  const [resetEmail, setResetEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { login, signup, resetPassword } = useAuth();
  const colorScheme = useColorScheme();
  const router = useRouter();

  const handleLogin = async () => {
    setErrorMsg(null);
    if (!email || !password) {
      setErrorMsg('Please enter both email and password');
      return;
    }
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    
    if (result === true) {
      // Navigate to home after successful login
      router.replace('/');
    } else if (typeof result === 'object' && result.success === false) {
      let message = 'Login failed. Please try again.';
      if (result.error === 'auth/user-not-found') {
        message = 'No account found with this email.';
      } else if (result.error === 'auth/wrong-password') {
        message = 'Incorrect password.';
      } else if (result.error === 'auth/invalid-email') {
        message = 'Invalid email address.';
      }
      setErrorMsg(message);
    } else {
      setErrorMsg('Login failed. Please try again.');
    }
  };

  const handleSignup = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }
    setLoading(true);
    const result = await signup(email, password);
    setLoading(false);
    if (result.success) {
      Alert.alert('Success', 'Account created! You are now logged in.');
      setMode('login');
    } else {
      Alert.alert('Error', result.error || 'Sign up failed');
    }
  };

  const handleReset = async () => {
    if (!resetEmail) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }
    setLoading(true);
    const result = await resetPassword(resetEmail);
    setLoading(false);
    if (result.success) {
      Alert.alert('Success', 'Password reset email sent!');
      setMode('login');
    } else {
      Alert.alert('Error', result.error || 'Failed to send reset email');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}> 
      <Text style={[styles.title, { color: '#FF7001', fontSize: 32 }]}>FinCon</Text>
      {mode === 'login' && (
        <>
          <TextInput
            style={[styles.input, { 
              backgroundColor: Colors[colorScheme ?? 'light'].background, 
              color: Colors[colorScheme ?? 'light'].text,
              borderColor: Colors[colorScheme ?? 'light'].tabIconDefault
            }]}
            placeholder="Email"
            placeholderTextColor={Colors[colorScheme ?? 'light'].tabIconDefault}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextInput
            style={[styles.input, { 
              backgroundColor: Colors[colorScheme ?? 'light'].background, 
              color: Colors[colorScheme ?? 'light'].text,
              borderColor: Colors[colorScheme ?? 'light'].tabIconDefault
            }]}
            placeholder="Password"
            placeholderTextColor={Colors[colorScheme ?? 'light'].tabIconDefault}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          {errorMsg && (
            <Text style={{ color: 'red', textAlign: 'center', marginBottom: 8 }}>{errorMsg}</Text>
          )}
          <Button title={loading ? 'Logging in...' : 'Login'} onPress={handleLogin} color="#FF7001" disabled={loading} />
          <Text style={{ textAlign: 'center', marginTop: 10 }}>
            <Text style={{ color: '#FF7001' }} onPress={() => setMode('signup')}>Sign up</Text> | <Text style={{ color: '#FF7001' }} onPress={() => setMode('reset')}>Forgot password?</Text>
          </Text>
        </>
      )}
      {mode === 'signup' && (
        <>
          <TextInput
            style={[styles.input, { 
              backgroundColor: Colors[colorScheme ?? 'light'].background, 
              color: Colors[colorScheme ?? 'light'].text,
              borderColor: Colors[colorScheme ?? 'light'].tabIconDefault
            }]}
            placeholder="Email"
            placeholderTextColor={Colors[colorScheme ?? 'light'].tabIconDefault}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextInput
            style={[styles.input, { 
              backgroundColor: Colors[colorScheme ?? 'light'].background, 
              color: Colors[colorScheme ?? 'light'].text,
              borderColor: Colors[colorScheme ?? 'light'].tabIconDefault
            }]}
            placeholder="Password"
            placeholderTextColor={Colors[colorScheme ?? 'light'].tabIconDefault}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <Button title={loading ? 'Signing up...' : 'Sign up'} onPress={handleSignup} color="#FF7001" disabled={loading} />
          <Text style={{ textAlign: 'center', marginTop: 10 }}>
            <Text style={{ color: '#FF7001' }} onPress={() => setMode('login')}>Back to login</Text>
          </Text>
        </>
      )}
      {mode === 'reset' && (
        <>
          <TextInput
            style={[styles.input, { 
              backgroundColor: Colors[colorScheme ?? 'light'].background, 
              color: Colors[colorScheme ?? 'light'].text,
              borderColor: Colors[colorScheme ?? 'light'].tabIconDefault
            }]}
            placeholder="Enter your email"
            placeholderTextColor={Colors[colorScheme ?? 'light'].tabIconDefault}
            value={resetEmail}
            onChangeText={setResetEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <Button title={loading ? 'Sending...' : 'Send reset email'} onPress={handleReset} color="#FF7001" disabled={loading} />
          <Text style={{ textAlign: 'center', marginTop: 10 }}>
            <Text style={{ color: '#FF7001' }} onPress={() => setMode('login')}>Back to login</Text>
          </Text>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
});

export default LoginScreen;
