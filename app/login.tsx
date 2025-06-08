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
      setErrorMsg('Por favor insira email e senha');
      return;
    }
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    
    if (result === true) {
      // Navigate to home after successful login
      router.replace('/');
    } else if (typeof result === 'object' && result.success === false) {
      let message = 'Falha no login. Por favor tente novamente.';
      if (result.error === 'auth/user-not-found') {
        message = 'Nenhuma conta encontrada com este email.';
      } else if (result.error === 'auth/wrong-password') {
        message = 'Senha incorreta.';
      } else if (result.error === 'auth/invalid-email') {
        message = 'Endereço de email inválido.';
      }
      setErrorMsg(message);
    } else {
      setErrorMsg('Falha no login. Por favor tente novamente.');
    }
  };

  const handleSignup = async () => {
    if (!email || !password) {
      Alert.alert('Erro', 'Por favor insira email e senha');
      return;
    }
    setLoading(true);
    const result = await signup(email, password);
    setLoading(false);
    if (result.success) {
      Alert.alert('Sucesso', 'Conta criada! Você está logado agora.');
      setMode('login');
    } else {
      Alert.alert('Erro', result.error || 'Falha no cadastro');
    }
  };

  const handleReset = async () => {
    if (!resetEmail) {
      Alert.alert('Erro', 'Por favor insira seu email');
      return;
    }
    setLoading(true);
    const result = await resetPassword(resetEmail);
    setLoading(false);
    if (result.success) {
      Alert.alert('Sucesso', 'Email de redefinição de senha enviado!');
      setMode('login');
    } else {
      Alert.alert('Erro', result.error || 'Falha ao enviar email de redefinição');
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
            placeholder="E-mail"
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
            placeholder="Senha"
            placeholderTextColor={Colors[colorScheme ?? 'light'].tabIconDefault}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          {errorMsg && (
            <Text style={{ color: 'red', textAlign: 'center', marginBottom: 8 }}>{errorMsg}</Text>
          )}
          <Button title={loading ? 'Entrando...' : 'Entrar'} onPress={handleLogin} color="#FF7001" disabled={loading} />
          <Text style={{ textAlign: 'center', marginTop: 10 }}>
            <Text style={{ color: '#FF7001' }} onPress={() => setMode('signup')}>Cadastrar</Text> | <Text style={{ color: '#FF7001' }} onPress={() => setMode('reset')}>Esqueceu a senha?</Text>
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
          <Button title={loading ? 'Cadastrando...' : 'Cadastrar'} onPress={handleSignup} color="#FF7001" disabled={loading} />
          <Text style={{ textAlign: 'center', marginTop: 10 }}>
            <Text style={{ color: '#FF7001' }} onPress={() => setMode('login')}>Voltar para login</Text>
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
            placeholder="Digite seu e-mail"
            placeholderTextColor={Colors[colorScheme ?? 'light'].tabIconDefault}
            value={resetEmail}
            onChangeText={setResetEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <Button title={loading ? 'Enviando...' : 'Enviar email de redefinição'} onPress={handleReset} color="#FF7001" disabled={loading} />
          <Text style={{ textAlign: 'center', marginTop: 10 }}>
            <Text style={{ color: '#FF7001' }} onPress={() => setMode('login')}>Voltar para login</Text>
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
