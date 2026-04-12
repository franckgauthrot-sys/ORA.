import { View, Text, TouchableOpacity, StyleSheet, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useState } from 'react';
import { supabase } from './supabase';

const P = {
  bg:        '#f2f0eb',
  card:      '#ffffff',
  border:    '#e0dbd2',
  teal:      '#e8943a',
  text:      '#1a1714',
  textMid:   '#6a6058',
  textLight: '#a89e90',
};

export default function AuthScreen({ onAuth }) {
  const [email, setEmail]     = useState('');
  const [code, setCode]       = useState('');
  const [phase, setPhase]     = useState('input');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleSend = async () => {
    if (!email.trim()) return;
    setLoading(true);
    setError('');
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { shouldCreateUser: true },
      });
      if (error) throw error;
      setPhase('verify');
    } catch (e) {
      setError('Erreur envoi. Réessaie dans quelques minutes.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (code.length !== 8) return;
    setLoading(true);
    setError('');
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: code,
        type: 'email',
      });
      if (error) throw error;
      onAuth(data.user);
    } catch (e) {
      setError('Code incorrect. Vérifie ton email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>

      <View style={styles.logoSection}>
        <Text style={styles.logo}>ORA<Text style={{ color: P.teal }}>.</Text></Text>
        <Text style={styles.tagline}>MIROIR COLLECTIF</Text>
        <Text style={styles.description}>
          Pose tes dilemmes.{'\n'}Vois comment les autres pensent.
        </Text>
      </View>

      {phase === 'input' ? (
        <View style={styles.form}>
          <Text style={styles.label}>TON EMAIL</Text>
          <TextInput
            style={styles.input}
            placeholder="ton@email.com"
            placeholderTextColor={P.textLight}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <TouchableOpacity
            style={[styles.mainBtn, { backgroundColor: email.trim() ? P.teal : P.border }]}
            onPress={handleSend}
            disabled={!email.trim() || loading}>
            <Text style={[styles.mainBtnText, { color: email.trim() ? '#fff' : P.textLight }]}>
              {loading ? 'Envoi...' : 'Recevoir mon code →'}
            </Text>
          </TouchableOpacity>
          <Text style={styles.legal}>
            En continuant, tu acceptes nos conditions d'utilisation et notre politique de confidentialité.
          </Text>
        </View>
      ) : (
        <View style={styles.form}>
          <View style={styles.sentIcon}>
            <Text style={{ fontSize: 36 }}>📬</Text>
          </View>
          <Text style={styles.sentTitle}>Vérifie tes emails !</Text>
          <Text style={styles.sentText}>
            On a envoyé un code à{'\n'}
            <Text style={{ fontWeight: '800', color: P.text }}>{email}</Text>
          </Text>

          <Text style={[styles.label, { marginTop: 20 }]}>CODE À 8 CHIFFRES</Text>
          <TextInput
            style={[styles.input, styles.codeInput]}
            placeholder="00000000"
            placeholderTextColor={P.textLight}
            value={code}
            onChangeText={setCode}
            keyboardType="number-pad"
            maxLength={8}
            autoFocus
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.mainBtn, { backgroundColor: code.length === 8 ? P.teal : P.border }]}
            onPress={handleVerify}
            disabled={code.length !== 8 || loading}>
            <Text style={[styles.mainBtnText, { color: code.length === 8 ? '#fff' : P.textLight }]}>
              {loading ? 'Vérification...' : 'Confirmer →'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => { setPhase('input'); setCode(''); setError(''); }}>
            <Text style={styles.backText}>← Changer d'email</Text>
          </TouchableOpacity>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: '#f2f0eb', justifyContent: 'center', padding: 32 },
  logoSection: { alignItems: 'center', gap: 12, marginBottom: 48 },
  logo:        { fontSize: 52, fontWeight: '900', color: '#1a1714', letterSpacing: -2 },
  tagline:     { fontSize: 11, color: '#a89e90', letterSpacing: 3, fontWeight: '800' },
  description: { fontSize: 16, color: '#6a6058', textAlign: 'center', lineHeight: 26, marginTop: 8 },
  form:        { gap: 12 },
  label:       { fontSize: 10, fontWeight: '800', color: '#a89e90', letterSpacing: 1.5 },
  input:       { backgroundColor: '#ffffff', borderRadius: 14, padding: 16, fontSize: 16, color: '#1a1714', borderWidth: 1.5, borderColor: '#e0dbd2' },
  codeInput:   { fontSize: 24, fontWeight: '900', textAlign: 'center', letterSpacing: 6 },
  mainBtn:     { borderRadius: 14, padding: 16, alignItems: 'center' },
  mainBtnText: { fontSize: 15, fontWeight: '800' },
  error:       { fontSize: 13, color: '#e8504a', textAlign: 'center', fontWeight: '600' },
  legal:       { fontSize: 11, color: '#a89e90', textAlign: 'center', lineHeight: 18 },
  sentIcon:    { alignItems: 'center' },
  sentTitle:   { fontSize: 24, fontWeight: '900', color: '#1a1714', textAlign: 'center' },
  sentText:    { fontSize: 15, color: '#6a6058', textAlign: 'center', lineHeight: 24 },
  backText:    { fontSize: 13, color: '#a89e90', fontWeight: '700', textAlign: 'center', padding: 8 },
});