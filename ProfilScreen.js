import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useState } from 'react';

const P = {
  bg:         '#f2f0eb',
  card:       '#ffffff',
  cardBorder: '#e0dbd2',
  rose:       '#4db8a8',
  roseDeep:   '#2a8a7a',
  roseLight:  '#cff0ea',
  teal:       '#e8943a',
  tealDeep:   '#b86820',
  tealLight:  '#fae0c0',
  palmPink:   '#e8a0a8',
  text:       '#1a1714',
  textMid:    '#6a6058',
  textLight:  '#a89e90',
  sage:       '#58a878',
};

const BADGES = [
  { label: 'Premier vote', icon: '🗳', condition: (v, p) => v >= 1 },
  { label: 'Posteur',      icon: '✍️', condition: (v, p) => p >= 1 },
  { label: 'Série x3',    icon: '🔥', condition: (v, p) => v >= 3 },
  { label: 'Top voteur',  icon: '⭐', condition: (v, p) => v >= 5 },
];

export default function ProfilScreen({ myPosts, votedCount, streak }) {
  const [tab, setTab] = useState('votes');

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <Text style={styles.logo}>ORA<Text style={{ color: P.teal }}>.</Text></Text>

      {/* Avatar + stats */}
      <View style={styles.profileRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>T</Text>
        </View>
        <View>
          <Text style={styles.name}>Toi</Text>
          <Text style={styles.stats}>
            {myPosts.length} posté{myPosts.length > 1 ? 's' : ''} · {votedCount} vote{votedCount > 1 ? 's' : ''} · 🔥 {streak}j
          </Text>
        </View>
      </View>

      {/* Badges */}
      <View style={styles.badges}>
        {BADGES.map((b, i) => {
          const earned = b.condition(votedCount, myPosts.length);
          return (
            <View key={i} style={[styles.badge, { backgroundColor: earned ? P.roseLight : P.bg, borderColor: earned ? P.rose : P.cardBorder, opacity: earned ? 1 : 0.4 }]}>
              <Text style={styles.badgeIcon}>{b.icon}</Text>
              <Text style={[styles.badgeLabel, { color: earned ? P.roseDeep : P.textLight }]}>{b.label.toUpperCase()}</Text>
            </View>
          );
        })}
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {[['votes', 'Mes votes'], ['posts', 'Mes dilemmes']].map(([id, label]) => (
          <TouchableOpacity key={id} onPress={() => setTab(id)}
            style={[styles.tab, { backgroundColor: tab === id ? P.text : P.card, borderColor: tab === id ? 'transparent' : P.cardBorder }]}>
            <Text style={[styles.tabText, { color: tab === id ? '#fff' : P.textMid }]}>{label.toUpperCase()}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      {tab === 'votes' && (
        votedCount === 0
          ? <Text style={styles.empty}>Tu n'as pas encore voté 🌵</Text>
          : <Text style={styles.info}>{votedCount} vote{votedCount > 1 ? 's' : ''} enregistré{votedCount > 1 ? 's' : ''} ✓</Text>
      )}
      {tab === 'posts' && (
        myPosts.length === 0
          ? <Text style={styles.empty}>Tu n'as pas encore posté 🌵</Text>
          : myPosts.map((d, i) => (
            <View key={i} style={styles.postCard}>
              <Text style={styles.postQuestion}>"{d.question}"</Text>
              <Text style={styles.postOptions}>{d.optionA} vs {d.optionB}</Text>
            </View>
          ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: P.bg },
  content:     { padding: 20, paddingTop: 60, paddingBottom: 100 },
  logo:        { fontSize: 30, fontWeight: '900', color: P.text, letterSpacing: -1, marginBottom: 24 },
  profileRow:  { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 20 },
  avatar:      { width: 56, height: 56, borderRadius: 28, backgroundColor: P.teal, alignItems: 'center', justifyContent: 'center' },
  avatarText:  { fontSize: 22, fontWeight: '900', color: '#fff' },
  name:        { fontSize: 18, fontWeight: '800', color: P.text },
  stats:       { fontSize: 12, color: P.textLight, marginTop: 2 },
  badges:      { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  badge:       { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 11, paddingVertical: 5, borderRadius: 8, borderWidth: 1.5 },
  badgeIcon:   { fontSize: 13 },
  badgeLabel:  { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  tabs:        { flexDirection: 'row', gap: 8, marginBottom: 20 },
  tab:         { flex: 1, padding: 10, borderRadius: 10, alignItems: 'center', borderWidth: 1.5 },
  tabText:     { fontSize: 11, fontWeight: '800', letterSpacing: 0.6 },
  empty:       { textAlign: 'center', color: P.textLight, fontSize: 14, marginTop: 60, lineHeight: 28 },
  info:        { textAlign: 'center', color: P.sage, fontSize: 14, fontWeight: '700', marginTop: 40 },
  postCard:    { backgroundColor: P.card, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1.5, borderColor: P.cardBorder },
  postQuestion:{ fontSize: 14, fontWeight: '700', color: P.text, marginBottom: 8 },
  postOptions: { fontSize: 12, color: P.textMid },
});