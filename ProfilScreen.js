import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useState, useRef, useEffect } from 'react';

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

function MiniCard({ d, userVotes, onVote }) {
  const voted = userVotes[d.id];
  const total = d.votesA + d.votesB;
  const pctA  = total ? Math.round((d.votesA / total) * 100) : 50;
  const pctB  = 100 - pctA;
  const barA  = useRef(new Animated.Value(0)).current;
  const barB  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(barA, { toValue: pctA, duration: 800, useNativeDriver: false }),
      Animated.timing(barB, { toValue: pctB, duration: 800, useNativeDriver: false }),
    ]).start();
  }, []);

  return (
    <View style={styles.card}>
      <Text style={styles.cardAuteur}>{d.auteur}</Text>
      <Text style={styles.cardQuestion}>"{d.question}"</Text>
      {[
        { label: d.optionA, key: 'A', pct: pctA, color: P.rose, deep: P.roseDeep, track: P.roseLight, bar: barA },
        { label: d.optionB, key: 'B', pct: pctB, color: P.teal, deep: P.tealDeep, track: P.tealLight, bar: barB },
      ].map(opt => (
        <View key={opt.key} style={{ marginBottom: 10 }}>
          <View style={styles.barRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, flex: 1 }}>
              {voted === opt.key && (
                <View style={[styles.myVoteBadge, { backgroundColor: opt.color }]}>
                  <Text style={styles.myVoteText}>✓</Text>
                </View>
              )}
              <Text style={[styles.barLabel, { color: opt.deep }]} numberOfLines={1}>{opt.label}</Text>
            </View>
            <Text style={[styles.barPct, { color: opt.deep }]}>{opt.pct}%</Text>
          </View>
          <View style={[styles.track, { backgroundColor: opt.track }]}>
            <Animated.View style={[styles.bar, { backgroundColor: opt.color, width: opt.bar.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }) }]} />
          </View>
        </View>
      ))}
      <Text style={styles.totalVotes}>{total.toLocaleString()} votes</Text>
      <View style={styles.changeRow}>
        {['A', 'B'].map(key => (
          <TouchableOpacity key={key} onPress={() => { if (voted !== key) onVote(d.id, key); }}
            style={[styles.changeBtn, { borderColor: voted === key ? (key === 'A' ? P.roseDeep : P.tealDeep) : P.cardBorder, backgroundColor: voted === key ? (key === 'A' ? P.roseLight : P.tealLight) : 'transparent' }]}>
            <Text style={{ fontSize: 11, fontWeight: '800', color: voted === key ? (key === 'A' ? P.roseDeep : P.tealDeep) : P.textLight }}>
              {voted === key ? '✓ ' : ''}{key}
            </Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity onPress={() => onVote(d.id, null)}>
          <Text style={styles.annuler}>Annuler</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function ProfilScreen({ myPosts, votedCount, streak, userVotes, feed, onVote, user, onSignOut, pseudo }) {
  const [tab, setTab] = useState('votes');
  const votedDilemmes = feed ? feed.filter(d => userVotes[d.id]) : [];
  const displayName = pseudo || user?.email?.split('@')[0] || 'Toi';
  const initiale = displayName[0].toUpperCase();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.logo}>ORA<Text style={{ color: P.teal }}>.</Text></Text>

      <View style={styles.profileRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initiale}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{displayName}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          <Text style={styles.stats}>
            {myPosts.length} posté{myPosts.length > 1 ? 's' : ''} · {votedCount} vote{votedCount > 1 ? 's' : ''} · 🔥 {streak}j
          </Text>
        </View>
      </View>

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

      <View style={styles.tabs}>
        {[['votes', 'Mes votes'], ['posts', 'Mes dilemmes']].map(([id, label]) => (
          <TouchableOpacity key={id} onPress={() => setTab(id)}
            style={[styles.tab, { backgroundColor: tab === id ? P.text : P.card, borderColor: tab === id ? 'transparent' : P.cardBorder }]}>
            <Text style={[styles.tabText, { color: tab === id ? '#fff' : P.textMid }]}>{label.toUpperCase()}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === 'votes' && (
        votedDilemmes.length === 0
          ? <Text style={styles.empty}>Tu n'as pas encore voté 🌵</Text>
          : votedDilemmes.map(d => <MiniCard key={d.id} d={d} userVotes={userVotes} onVote={onVote} />)
      )}

      {tab === 'posts' && (
        myPosts.length === 0
          ? <Text style={styles.empty}>Tu n'as pas encore posté 🌵</Text>
          : myPosts.map(d => {
              const live = feed?.find(x => x.id === d.id) || d;
              return <MiniCard key={d.id} d={live} userVotes={userVotes} onVote={onVote} />;
            })
      )}

      <TouchableOpacity onPress={onSignOut} style={styles.signOutBtn}>
        <Text style={styles.signOutText}>Se déconnecter</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: P.bg },
  content:      { padding: 20, paddingTop: 60, paddingBottom: 100 },
  logo:         { fontSize: 30, fontWeight: '900', color: P.text, letterSpacing: -1, marginBottom: 24 },
  profileRow:   { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 20 },
  avatar:       { width: 56, height: 56, borderRadius: 28, backgroundColor: P.teal, alignItems: 'center', justifyContent: 'center' },
  avatarText:   { fontSize: 22, fontWeight: '900', color: '#fff' },
  name:         { fontSize: 18, fontWeight: '800', color: P.text },
  email:        { fontSize: 11, color: P.textLight, marginTop: 2 },
  stats:        { fontSize: 12, color: P.textLight, marginTop: 4 },
  badges:       { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  badge:        { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 11, paddingVertical: 5, borderRadius: 8, borderWidth: 1.5 },
  badgeIcon:    { fontSize: 13 },
  badgeLabel:   { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  tabs:         { flexDirection: 'row', gap: 8, marginBottom: 20 },
  tab:          { flex: 1, padding: 10, borderRadius: 10, alignItems: 'center', borderWidth: 1.5 },
  tabText:      { fontSize: 11, fontWeight: '800', letterSpacing: 0.6 },
  empty:        { textAlign: 'center', color: P.textLight, fontSize: 14, marginTop: 60, lineHeight: 28 },
  card:         { backgroundColor: P.card, borderRadius: 20, padding: 20, marginBottom: 14, borderWidth: 1.5, borderColor: P.cardBorder },
  cardAuteur:   { fontSize: 12, fontWeight: '700', color: P.text, marginBottom: 4 },
  cardQuestion: { fontSize: 15, fontWeight: '700', color: P.text, lineHeight: 22, marginBottom: 14 },
  barRow:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  barLabel:     { fontSize: 12, fontWeight: '700', flex: 1 },
  barPct:       { fontSize: 13, fontWeight: '900' },
  track:        { height: 9, borderRadius: 999, overflow: 'hidden' },
  bar:          { height: '100%', borderRadius: 999 },
  totalVotes:   { fontSize: 11, color: P.textLight, textAlign: 'center', marginTop: 8 },
  myVoteBadge:  { borderRadius: 4, paddingHorizontal: 5, paddingVertical: 1 },
  myVoteText:   { fontSize: 10, fontWeight: '800', color: '#fff' },
  changeRow:    { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: P.cardBorder },
  changeBtn:    { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, borderWidth: 2 },
  annuler:      { fontSize: 11, color: P.textLight, fontWeight: '600' },
  signOutBtn:   { marginTop: 32, padding: 16, borderRadius: 14, borderWidth: 1.5, borderColor: P.cardBorder, alignItems: 'center' },
  signOutText:  { fontSize: 14, fontWeight: '700', color: P.textLight },
});