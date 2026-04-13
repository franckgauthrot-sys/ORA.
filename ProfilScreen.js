import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Animated, TextInput, Modal } from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { supabase } from './supabase';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Animated, TextInput, Modal, Alert } from 'react-native';

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
  // Votes donnés
  { label: 'Premier vote',   icon: '🗳️',  desc: 'Voter pour la première fois',         condition: (v, p, pf, vr) => v >= 1 },
  { label: 'Série x3',       icon: '🔥',  desc: 'Voter 3 fois',                         condition: (v, p, pf, vr) => v >= 3 },
  { label: 'Top voteur',     icon: '⭐',  desc: 'Voter 10 fois',                        condition: (v, p, pf, vr) => v >= 10 },
  { label: 'Mega voteur',    icon: '💎',  desc: 'Voter 50 fois',                        condition: (v, p, pf, vr) => v >= 50 },
  { label: 'Légende',        icon: '👑',  desc: 'Voter 100 fois',                       condition: (v, p, pf, vr) => v >= 100 },
  // Dilemmes postés
  { label: 'Posteur',        icon: '✍️',  desc: 'Poster son premier dilemme',           condition: (v, p, pf, vr) => p >= 1 },
  { label: 'Narrateur',      icon: '📝',  desc: 'Poster 5 dilemmes',                    condition: (v, p, pf, vr) => p >= 5 },
  { label: 'Conteur',        icon: '🎭',  desc: 'Poster 20 dilemmes',                   condition: (v, p, pf, vr) => p >= 20 },
  // Dilemmes parfaits
  { label: 'Dilemme Parfait',icon: '🎯',  desc: 'Créer un dilemme parfait',             condition: (v, p, pf, vr) => pf >= 1 },
  { label: 'Maître du 50/50',icon: '💫',  desc: 'Créer 3 dilemmes parfaits',            condition: (v, p, pf, vr) => pf >= 3 },
  // Votes reçus
  { label: 'Populaire',      icon: '🌟',  desc: 'Recevoir 10 votes sur ses dilemmes',   condition: (v, p, pf, vr) => vr >= 10 },
  { label: 'Viral',          icon: '🚀',  desc: 'Recevoir 100 votes sur ses dilemmes',  condition: (v, p, pf, vr) => vr >= 100 },
];

function MiniCard({ d, userVotes, onVote }) {
  const voted = userVotes[d.id];
  const total = d.votesA + d.votesB;
  const pctA  = total ? Math.round((d.votesA / total) * 100) : 0;
  const pctB  = total ? 100 - pctA : 0;
  const barA  = useRef(new Animated.Value(0)).current;
  const barB  = useRef(new Animated.Value(0)).current;
  const isParfait = d.categories?.includes('parfait');
  const perfScore = Math.abs(pctA - 50);
  const isPerfect = isParfait && perfScore <= 2 && total > 0;
  const perfectAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(barA, { toValue: pctA, duration: 800, useNativeDriver: false }),
      Animated.timing(barB, { toValue: pctB, duration: 800, useNativeDriver: false }),
    ]).start();
  }, []);

  useEffect(() => {
    if (isPerfect) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(perfectAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
          Animated.timing(perfectAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
        ])
      ).start();
    } else {
      perfectAnim.setValue(0);
    }
  }, [isPerfect]);

  return (
    <Animated.View style={[styles.card, isPerfect ? {
      borderColor: perfectAnim.interpolate({ inputRange: [0, 1], outputRange: ['#f0c000', '#e8943a'] }),
      borderWidth: 2.5,
      shadowColor: '#f0c000',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: perfectAnim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.8] }),
      shadowRadius: 12,
    } : {}]}>
      <Text style={styles.cardAuteur}>{d.auteur}</Text>
      <Text style={styles.cardQuestion}>"{d.question}"</Text>

      {isParfait ? (
        <View style={{ marginBottom: 10 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, flex: 1 }}>
              {voted === 'A' && <View style={[styles.myVoteBadge, { backgroundColor: '#4db8a8' }]}><Text style={styles.myVoteText}>✓</Text></View>}
              <Text style={{ fontSize: 12, fontWeight: '700', color: '#2a8a7a', flex: 1 }} numberOfLines={2}>{d.optionA}</Text>
            </View>
            <Text style={{ fontSize: 13, fontWeight: '900', color: '#2a8a7a', marginLeft: 8 }}>{pctA}%</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, flex: 1 }}>
              {voted === 'B' && <View style={[styles.myVoteBadge, { backgroundColor: '#e8943a' }]}><Text style={styles.myVoteText}>✓</Text></View>}
              <Text style={{ fontSize: 12, fontWeight: '700', color: '#b86820', flex: 1 }} numberOfLines={2}>{d.optionB}</Text>
            </View>
            <Text style={{ fontSize: 13, fontWeight: '900', color: '#b86820', marginLeft: 8 }}>{pctB}%</Text>
          </View>

          <View style={{ paddingTop: 28 }}>
            <Animated.View style={{
              position: 'absolute', top: 0,
              left: barA.interpolate({ inputRange: [0, 50, 100], outputRange: ['100%', '50%', '0%'] }),
              marginLeft: -20, width: 40, height: 40, borderRadius: 20,
              backgroundColor: barA.interpolate({
                inputRange: [0, 35, 50, 65, 100],
                outputRange: ['#e8943a', '#d4a800', '#f0c000', '#d4a800', '#4db8a8'],
              }),
              alignItems: 'center', justifyContent: 'center',
              shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2, shadowRadius: 4, zIndex: 10,
            }}>
              <Text style={{ fontSize: isPerfect ? 14 : 10, fontWeight: '900', color: '#fff' }}>
                {isPerfect ? '🎯' : (pctA >= 50 ? `${pctA}%` : `${pctB}%`)}
              </Text>
            </Animated.View>

            <View style={{ height: 12, borderRadius: 999, backgroundColor: '#f0ece6', overflow: 'hidden', position: 'relative' }}>
              <Animated.View style={{
                position: 'absolute', height: '100%', borderRadius: 999,
                backgroundColor: barA.interpolate({
                  inputRange: [0, 35, 50, 65, 100],
                  outputRange: ['#e8943a', '#d4a800', '#f0c000', '#d4a800', '#4db8a8'],
                }),
                left: barA.interpolate({ inputRange: [0, 50, 100], outputRange: ['50%', '50%', '0%'] }),
                right: barA.interpolate({ inputRange: [0, 50, 100], outputRange: ['0%', '50%', '50%'] }),
              }} />
              <View style={{ position: 'absolute', left: '50%', marginLeft: -1, width: 2, height: 12, backgroundColor: '#c0b8b0', zIndex: 2 }} />
            </View>
          </View>

          <Text style={{ fontSize: 11, color: P.textLight, textAlign: 'center', marginTop: 16 }}>{total.toLocaleString()} votes</Text>
          {isPerfect && (
            <View style={{ alignItems: 'center', marginTop: 8 }}>
              <View style={{ backgroundColor: '#f0c000', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 5 }}>
                <Text style={{ fontSize: 12, fontWeight: '900', color: '#7a5800' }}>🎯 DILEMME PARFAIT</Text>
              </View>
            </View>
          )}
        </View>
      ) : (
        [
          { label: d.optionA, key: 'A', pct: pctA, color: '#4db8a8', deep: '#2a8a7a', track: '#cff0ea', bar: barA },
          { label: d.optionB, key: 'B', pct: pctB, color: '#e8943a', deep: '#b86820', track: '#fae0c0', bar: barB },
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
        ))
      )}

      <Text style={styles.totalVotes}>{total.toLocaleString()} votes</Text>
      <View style={styles.changeRow}>
        {['A', 'B'].map(key => (
          <TouchableOpacity key={key} onPress={() => { if (voted !== key) onVote(d.id, key); }}
            style={[styles.changeBtn, { borderColor: voted === key ? (key === 'A' ? '#2a8a7a' : '#b86820') : P.cardBorder, backgroundColor: voted === key ? (key === 'A' ? '#cff0ea' : '#fae0c0') : 'transparent' }]}>
            <Text style={{ fontSize: 11, fontWeight: '800', color: voted === key ? (key === 'A' ? '#2a8a7a' : '#b86820') : P.textLight }}>
              {voted === key ? '✓ ' : ''}{key}
            </Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity onPress={() => onVote(d.id, null)}>
          <Text style={styles.annuler}>Annuler</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

export default function ProfilScreen({ myPosts, votedCount, userVotes, feed, onVote, user, onSignOut, pseudo, onPseudoChange, newVoteDilemmes, onVoteSeen }) {
  const [tab, setTab] = useState('votes');
  const [menuVisible, setMenuVisible] = useState(false);
  const [editingPseudo, setEditingPseudo] = useState(false);
  const [newPseudo, setNewPseudo] = useState(pseudo || '');
  const [savingPseudo, setSavingPseudo] = useState(false);

  const votedDilemmes = feed ? feed.filter(d => userVotes[d.id]) : [];
  const displayName = pseudo || user?.email?.split('@')[0] || 'Toi';
  const initiale = displayName[0].toUpperCase();

  // Calculs pour les badges
  const parfaitsCount = feed?.filter(d =>
    d.categories?.includes('parfait') &&
    d.user_id === user?.id &&
    Math.abs((d.votesA / ((d.votesA + d.votesB) || 1) * 100) - 50) <= 2 &&
    (d.votesA + d.votesB) > 0
  ).length || 0;

  const votesRecus = myPosts.reduce((acc, d) => {
    const live = feed?.find(x => x.id === d.id) || d;
    return acc + (live.votesA || 0) + (live.votesB || 0);
  }, 0);

  const handleSavePseudo = async () => {
    if (newPseudo.trim().length < 2) return;
    setSavingPseudo(true);
    try {
      await supabase
        .from('profiles')
        .upsert({ id: user.id, email: user.email, pseudo: newPseudo.trim() }, { onConflict: 'id' });
      onPseudoChange(newPseudo.trim());
      setEditingPseudo(false);
      setMenuVisible(false);
    } catch (e) {
      console.log('Erreur pseudo:', e);
    } finally {
      setSavingPseudo(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* Header avec menu ⋮ */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Text style={styles.logo}>ORA<Text style={{ color: P.teal }}>.</Text></Text>
        <TouchableOpacity onPress={() => setMenuVisible(!menuVisible)} style={styles.menuBtn}>
          <Text style={styles.menuIcon}>⋮</Text>
        </TouchableOpacity>
      </View>

      {/* Menu contextuel */}
      {menuVisible && (
        <View style={styles.menuCard}>
          <TouchableOpacity style={styles.menuItem} onPress={() => { setEditingPseudo(true); setMenuVisible(false); }}>
            <Text style={styles.menuItemText}>✏️  Modifier le pseudo</Text>
          </TouchableOpacity>
          <View style={styles.menuDivider} />
          <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuVisible(false); onSignOut(); }}>
            <Text style={[styles.menuItemText, { color: '#e05050' }]}>🚪  Se déconnecter</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Modal modifier pseudo */}
      <Modal visible={editingPseudo} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setEditingPseudo(false)}>
          <View style={styles.modalCard} onStartShouldSetResponder={() => true}>
            <Text style={styles.modalTitle}>Modifier le pseudo</Text>
            <TextInput
              style={styles.modalInput}
              value={newPseudo}
              onChangeText={setNewPseudo}
              placeholder="Ton nouveau pseudo"
              placeholderTextColor={P.textLight}
              maxLength={20}
              autoFocus
            />
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: P.cardBorder, flex: 1 }]} onPress={() => setEditingPseudo(false)}>
                <Text style={{ fontWeight: '700', color: P.textMid }}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: P.teal, flex: 1 }]} onPress={handleSavePseudo}>
                <Text style={{ fontWeight: '700', color: '#fff' }}>{savingPseudo ? '...' : 'Sauvegarder'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      <View style={styles.profileRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initiale}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{displayName}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          <Text style={styles.stats}>
{votedCount} vote{votedCount > 1 ? 's' : ''} · {myPosts.length} dilemme{myPosts.length > 1 ? 's' : ''} · {parfaitsCount} 🎯          </Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {[['votes', 'Mes votes'], ['posts', 'Mes dilemmes'], ['badges', 'Mes badges']].map(([id, label]) => (
          <TouchableOpacity key={id} onPress={() => setTab(id)}
            style={[styles.tab, { backgroundColor: tab === id ? P.text : P.card, borderColor: tab === id ? 'transparent' : P.cardBorder }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={[styles.tabText, { color: tab === id ? '#fff' : P.textMid }]}>{label.toUpperCase()}</Text>
              {id === 'posts' && newVoteDilemmes?.length > 0 && (
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#e8503a' }} />
              )}
            </View>
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
  const hasNew = newVoteDilemmes?.includes(d.id);
  return (
    <TouchableOpacity key={d.id} onPress={() => onVoteSeen?.(d.id)} activeOpacity={1}>
      <View style={{ position: 'relative' }}>
        {hasNew && (
          <View style={{ position: 'absolute', top: 10, right: 10, width: 10, height: 10, borderRadius: 5, backgroundColor: '#e8503a', zIndex: 10 }} />
        )}
        <MiniCard d={live} userVotes={userVotes} onVote={onVote} />
        <TouchableOpacity 
          onPress={() => {
            Alert.alert(
              'Supprimer ce dilemme ?',
              'Cette action est irréversible.',
              [
                { text: 'Annuler', style: 'cancel' },
                { text: 'Supprimer', style: 'destructive', onPress: () => onSupprimerDilemme(d.id) },
              ]
            );
          }}
          style={{ alignItems: 'center', marginTop: -8, marginBottom: 6 }}>
          <Text style={{ fontSize: 11, color: '#e05050', fontWeight: '600' }}>🗑️ Supprimer ce dilemme</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
})}


      {tab === 'badges' && (
  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
    {BADGES.map((b, i) => {
      const earned = b.condition(votedCount, myPosts.length, parfaitsCount, votesRecus);
      return (
        <View key={i} style={{
          width: '30%',
          backgroundColor: earned ? P.card : P.bg,
          borderRadius: 16,
          borderWidth: 1.5,
          borderColor: earned ? P.teal : P.cardBorder,
          padding: 12,
          alignItems: 'center',
          gap: 6,
          opacity: earned ? 1 : 0.5,
        }}>
          <Text style={{ fontSize: 32 }}>{earned ? b.icon : '🔒'}</Text>
          <Text style={{ fontSize: 9, fontWeight: '800', color: earned ? P.text : P.textLight, textAlign: 'center', letterSpacing: 0.3 }}>{b.label.toUpperCase()}</Text>
          <Text style={{ fontSize: 9, color: P.textLight, textAlign: 'center', lineHeight: 13 }}>{b.desc}</Text>
          {earned && (
            <View style={{ backgroundColor: P.roseLight, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 }}>
              <Text style={{ fontSize: 9, fontWeight: '800', color: P.roseDeep }}>DÉBLOQUÉ</Text>
            </View>
          )}
        </View>
      );
    })}
  </View>
)}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: P.bg },
  content:        { padding: 20, paddingTop: 60, paddingBottom: 100 },
  logo:           { fontSize: 30, fontWeight: '900', color: P.text, letterSpacing: -1 },
  menuBtn:        { padding: 8 },
  menuIcon:       { fontSize: 24, color: P.textMid, fontWeight: '900' },
  menuCard:       { position: 'absolute', top: 70, right: 20, backgroundColor: P.card, borderRadius: 14, borderWidth: 1.5, borderColor: P.cardBorder, zIndex: 100, minWidth: 200, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12 },
  menuItem:       { padding: 16 },
  menuItemText:   { fontSize: 14, fontWeight: '700', color: P.text },
  menuDivider:    { height: 1, backgroundColor: P.cardBorder },
  modalOverlay:   { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  modalCard:      { backgroundColor: P.card, borderRadius: 20, padding: 24, width: '85%' },
  modalTitle:     { fontSize: 18, fontWeight: '900', color: P.text, marginBottom: 16 },
  modalInput:     { backgroundColor: P.bg, borderRadius: 11, padding: 14, fontSize: 14, color: P.text, borderWidth: 1.5, borderColor: P.cardBorder },
  modalBtn:       { padding: 14, borderRadius: 11, alignItems: 'center' },
  profileRow:     { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 20 },
  avatar:         { width: 56, height: 56, borderRadius: 28, backgroundColor: P.teal, alignItems: 'center', justifyContent: 'center' },
  avatarText:     { fontSize: 22, fontWeight: '900', color: '#fff' },
  name:           { fontSize: 18, fontWeight: '800', color: P.text },
  email:          { fontSize: 11, color: P.textLight, marginTop: 2 },
  stats:          { fontSize: 12, color: P.textLight, marginTop: 4 },
  tabs:           { flexDirection: 'row', gap: 6, marginBottom: 20 },
  tab:            { flex: 1, padding: 9, borderRadius: 10, alignItems: 'center', borderWidth: 1.5 },
  tabText:        { fontSize: 9, fontWeight: '800', letterSpacing: 0.4 },
  empty:          { textAlign: 'center', color: P.textLight, fontSize: 14, marginTop: 60, lineHeight: 28 },
  card:           { backgroundColor: P.card, borderRadius: 20, padding: 20, marginBottom: 14, borderWidth: 1.5, borderColor: P.cardBorder },
  cardAuteur:     { fontSize: 12, fontWeight: '700', color: P.text, marginBottom: 4 },
  cardQuestion:   { fontSize: 15, fontWeight: '700', color: P.text, lineHeight: 22, marginBottom: 14 },
  barRow:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  barLabel:       { fontSize: 12, fontWeight: '700', flex: 1 },
  barPct:         { fontSize: 13, fontWeight: '900' },
  track:          { height: 9, borderRadius: 999, overflow: 'hidden' },
  bar:            { height: '100%', borderRadius: 999 },
  totalVotes:     { fontSize: 11, color: P.textLight, textAlign: 'center', marginTop: 8 },
  myVoteBadge:    { borderRadius: 4, paddingHorizontal: 5, paddingVertical: 1 },
  myVoteText:     { fontSize: 10, fontWeight: '800', color: '#fff' },
  changeRow:      { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: P.cardBorder },
  changeBtn:      { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, borderWidth: 2 },
  annuler:        { fontSize: 11, color: P.textLight, fontWeight: '600' },
  badgeCard:      { backgroundColor: P.card, borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14, borderWidth: 1.5, borderColor: P.cardBorder },
  badgeIconBox:   { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  badgeCardLabel: { fontSize: 14, fontWeight: '800', marginBottom: 3 },
  badgeCardDesc:  { fontSize: 11, color: P.textLight },
  badgeEarned:    { width: 22, height: 22, borderRadius: 11, backgroundColor: P.roseLight, alignItems: 'center', justifyContent: 'center' },
});