import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import { supabase } from './supabase';

const P = {
  bg:       '#f2f0eb',
  card:     '#ffffff',
  border:   '#e0dbd2',
  teal:     '#e8943a',
  text:     '#1a1714',
  textMid:  '#6a6058',
  textLight:'#a89e90',
};

export default function AuthScreen({ onAuth }) {

  const handleApple = async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: credential.identityToken,
      });
      if (error) throw error;
      onAuth(data.user);
    } catch (e) {
      console.log('Apple auth error:', e);
    }
  };

  const handleGuest = () => {
    // Continuer sans compte
    onAuth({ id: 'guest_' + Math.random().toString(36).substr(2, 9), isGuest: true });
  };

  return (
    <View style={styles.container}>
      {/* Logo */}
      <View style={styles.logoSection}>
        <Text style={styles.logo}>ORA<Text style={{ color: P.teal }}>.</Text></Text>
        <Text style={styles.tagline}>MIROIR COLLECTIF</Text>
        <Text style={styles.description}>
          Pose tes dilemmes.{'\n'}Vois comment les autres pensent.{'\n'}Tu n'es pas seul(e).
        </Text>
      </View>

      {/* Boutons */}
      <View style={styles.buttons}>
        {/* Apple Sign In */}
        <AppleAuthentication.AppleAuthenticationButton
          buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
          buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
          cornerRadius={14}
          style={styles.appleBtn}
          onPress={handleApple}
        />

        {/* Continuer sans compte */}
        <TouchableOpacity onPress={handleGuest} style={styles.guestBtn}>
          <Text style={styles.guestText}>Continuer sans compte →</Text>
        </TouchableOpacity>

        <Text style={styles.legal}>
          En continuant, tu acceptes nos conditions d'utilisation et notre politique de confidentialité.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: P.bg, justifyContent: 'space-between', padding: 32, paddingTop: 100, paddingBottom: 60 },
  logoSection: { alignItems: 'center', gap: 12 },
  logo:        { fontSize: 52, fontWeight: '900', color: P.text, letterSpacing: -2 },
  tagline:     { fontSize: 11, color: P.textLight, letterSpacing: 3, fontWeight: '800' },
  description: { fontSize: 16, color: P.textMid, textAlign: 'center', lineHeight: 26, marginTop: 16 },
  buttons:     { gap: 14 },
  appleBtn:    { width: '100%', height: 52 },
  guestBtn:    { backgroundColor: P.card, borderRadius: 14, padding: 16, alignItems: 'center', borderWidth: 1.5, borderColor: P.border },
  guestText:   { fontSize: 14, fontWeight: '700', color: P.textMid },
  legal:       { fontSize: 11, color: P.textLight, textAlign: 'center', lineHeight: 18, marginTop: 8 },
});