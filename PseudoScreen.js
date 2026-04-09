import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
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

export default function PseudoScreen({ user, onDone }) {
  const [pseudo, setPseudo]   = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleSave = async () => {
  if (pseudo.trim().length < 2) {
    setError('Ton pseudo doit faire au moins 2 caractères');
    return;
  }
  setLoading(true);
  try {
    // D'abord essayer de créer le profil s'il n'existe pas
    await supabase
      .from('profiles')
      .upsert({ id: user.id, email: user.email, pseudo: pseudo.trim() }, 
        { onConflict: 'id' });
    onDone(pseudo.trim());
  } catch (e) {
    setError('Erreur, réessaie.');
    console.log('Erreur pseudo:', e);
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
        <Text style={styles.title}>Choisis ton pseudo</Text>
        <Text style={styles.subtitle}>
          C'est le nom que les autres verront sur tes dilemmes.
        </Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>TON PSEUDO</Text>
        <TextInput
          style={styles.input}
          placeholder="ex : franck92"
          placeholderTextColor={P.textLight}
          value={pseudo}
          onChangeText={t => { setPseudo(t); setError(''); }}
          autoCapitalize="none"
          autoCorrect={false}
          autoFocus
          maxLength={20}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Text style={styles.hint}>{pseudo.length}/20 caractères</Text>

        <TouchableOpacity
          style={[styles.btn, { backgroundColor: pseudo.trim().length >= 2 ? P.teal : P.border }]}
          onPress={handleSave}
          disabled={pseudo.trim().length < 2 || loading}>
          <Text style={[styles.btnText, { color: pseudo.trim().length >= 2 ? '#fff' : P.textLight }]}>
            {loading ? 'Enregistrement...' : 'Commencer →'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: '#f2f0eb', justifyContent: 'center', padding: 32 },
  logoSection: { alignItems: 'center', gap: 12, marginBottom: 48 },
  logo:        { fontSize: 52, fontWeight: '900', color: '#1a1714', letterSpacing: -2 },
  title:       { fontSize: 24, fontWeight: '900', color: '#1a1714' },
  subtitle:    { fontSize: 15, color: '#6a6058', textAlign: 'center', lineHeight: 24 },
  form:        { gap: 10 },
  label:       { fontSize: 10, fontWeight: '800', color: '#a89e90', letterSpacing: 1.5 },
  input:       { backgroundColor: '#ffffff', borderRadius: 14, padding: 16, fontSize: 18, color: '#1a1714', borderWidth: 1.5, borderColor: '#e0dbd2', fontWeight: '700' },
  error:       { fontSize: 13, color: '#e8504a', fontWeight: '600' },
  hint:        { fontSize: 11, color: '#a89e90', textAlign: 'right' },
  btn:         { borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 8 },
  btnText:     { fontSize: 15, fontWeight: '800' },
});