import { useState } from 'react';
import { useRef, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Animated, Share } from 'react-native';

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

const CAT_STYLE = {
  amour:    { bg: '#fae0c0', text: '#b86820' },
  carriere: { bg: '#d0e0f4', text: '#2e5898' },
  social:   { bg: '#cff0ea', text: '#2a8a7a' },
  argent:   { bg: '#eef4c0', text: '#6a8010' },
  famille:  { bg: '#e0daf4', text: '#5848a8' },
};

const CATEGORIES = [
  { id: 'amour',    label: 'Amour' },
  { id: 'carriere', label: 'Carrière' },
  { id: 'social',   label: 'Vie sociale' },
  { id: 'argent',   label: 'Argent' },
  { id: 'famille',  label: 'Famille' },
];

const DILEMMES_INIT = [
  { id: 1, auteur: 'Marie, 28 ans',  tempsPoste: 'Il y a 2h',  question: 'Je quitte mon job stable pour lancer ma startup — j\'ai une idée mais pas encore de financement', optionA: 'Je quitte tout',        optionB: 'Je reste encore 1 an',  categories: ['carriere', 'argent'], votesA: 312, votesB: 189 },
  { id: 2, auteur: 'Anonyme',        tempsPoste: 'Il y a 5h',  question: 'En couple depuis 4 ans, relation stable mais sans passion. Une opportunité de partir à l\'étranger', optionA: 'Je reste avec lui/elle', optionB: 'Je pars vers l\'inconnu', categories: ['amour'],              votesA: 203, votesB: 401 },
  { id: 3, auteur: 'Kevin, 34 ans',  tempsPoste: 'Il y a 23h', question: 'Mon ex m\'a recontacté après 2 ans de silence. Je lui réponds ou je tourne la page ?',              optionA: 'Je lui écris',          optionB: 'Je tourne la page',     categories: ['amour', 'social'],    votesA: 567, votesB: 234 },
  { id: 4, auteur: 'Sophie, 41 ans', tempsPoste: 'Il y a 3h',  question: 'Mon frère traverse une période difficile et me demande 3000€. Mes économies sont limitées',         optionA: 'Je lui prête',          optionB: 'Je refuse',             categories: ['argent', 'famille'], votesA: 145, votesB: 298 },
  { id: 5, auteur: 'Thomas, 26 ans', tempsPoste: 'Il y a 8h',  question: 'Une offre d\'emploi à Barcelone, salaire x2. Mais ma famille et mes amis sont tous ici',            optionA: 'Je pars à Barcelone',   optionB: 'Je reste',              categories: ['carriere', 'famille', 'social'], votesA: 489, votesB: 311 },
];

function Badge({ catId }) {
  const s = CAT_STYLE[catId];
  const cat = CATEGORIES.find(c => c.id === catId);
  if (!cat || !s) return null;
  return (
    <View style={[styles.badge, { backgroundColor: s.bg }]}>
      <Text style={[styles.badgeText, { color: s.text }]}>{cat.label.toUpperCase()}</Text>
    </View>
  );
}

function DilemmeCard({ d, onVote, userVotes }) {
  const voted = userVotes[d.id];
  const total = d.votesA + d.votesB;
  const pctA  = total === 0 ? 50 : Math.round((d.votesA / total) * 100);
  const pctB  = 100 - pctA;
  const barA  = useRef(new Animated.Value(0)).current;
  const barB  = useRef(new Animated.Value(0)).current;
  const [revealing, setRevealing] = useState(false);
  const [revealed,  setRevealed]  = useState(!!voted);
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;
const handleShare = async () => {
  const total = d.votesA + d.votesB;
const pctA  = total === 0 ? 50 : Math.round((d.votesA / total) * 100);
const pctB  = 100 - pctA;
  await Share.share({
    message: `ORA. — Dilemme\n\n"${d.question}"\n\n${d.optionA} ${pctA}% vs ${d.optionB} ${pctB}%\n\n${total} votes — Et toi tu choisirais quoi ?`,
  });
};
  useEffect(() => {
    if (voted && revealed) {
      Animated.parallel([
        Animated.timing(barA, { toValue: pctA, duration: 900, useNativeDriver: false }),
        Animated.timing(barB, { toValue: pctB, duration: 900, useNativeDriver: false }),
      ]).start();
    }
  }, [revealed]);

  useEffect(() => {
    if (revealing) {
      const anim = (dot) => Animated.sequence([
        Animated.timing(dot, { toValue: -8, duration: 300, useNativeDriver: true }),
        Animated.timing(dot, { toValue: 0,  duration: 300, useNativeDriver: true }),
      ]);
      Animated.loop(Animated.stagger(150, [anim(dot1), anim(dot2), anim(dot3)])).start();
    }
  }, [revealing]);

  const handleVote = (id, choix) => {
    onVote(id, choix);
    setRevealing(true);
    setTimeout(() => { setRevealing(false); setRevealed(true); }, 1400);
  };

  const isMajority = voted && (voted === 'A' ? pctA : pctB) > 50;

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.cardHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{d.auteur[0]}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.auteur}>{d.auteur}</Text>
          <Text style={styles.temps}>{d.tempsPoste}</Text>
        </View>
      </View>

      {/* Badges */}
      <View style={styles.badges}>
        {d.categories.map(c => <Badge key={c} catId={c} />)}
      </View>

      {/* Question */}
      <Text style={styles.question}>"{d.question}"</Text>

      {/* Vote / Suspense / Results */}
      {!voted && !revealing ? (
        <View>
          <Text style={styles.voteCount}>{(d.votesA + d.votesB).toLocaleString()}</Text>
          <Text style={styles.voteLabel}>votes</Text>
          <View style={styles.btns}>
            <TouchableOpacity style={[styles.btn, { backgroundColor: P.roseLight }]} onPress={() => handleVote(d.id, 'A')}>
              <Text style={[styles.btnText, { color: P.roseDeep }]}>{d.optionA}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, { backgroundColor: P.tealLight }]} onPress={() => handleVote(d.id, 'B')}>
              <Text style={[styles.btnText, { color: P.tealDeep }]}>{d.optionB}</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : revealing ? (
        <View style={styles.suspense}>
          <Text style={styles.suspenseText}>Calcul des votes…</Text>
          <View style={styles.dots}>
            {[dot1, dot2, dot3].map((dot, i) => (
              <Animated.View key={i} style={[styles.dot, { transform: [{ translateY: dot }] }]} />
            ))}
          </View>
        </View>
      ) : (
        <View>
          {[
            { label: d.optionA, key: 'A', pct: pctA, color: P.rose, deep: P.roseDeep, track: P.roseLight, bar: barA },
            { label: d.optionB, key: 'B', pct: pctB, color: P.teal, deep: P.tealDeep, track: P.tealLight, bar: barB },
          ].map(opt => (
            <View key={opt.key} style={{ marginBottom: 12 }}>
              <View style={styles.barRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
                  {voted === opt.key && (
                    <View style={[styles.myVoteBadge, { backgroundColor: opt.color }]}>
                      <Text style={styles.myVoteText}>✓ Mon vote</Text>
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
          <Text style={[styles.majorityMsg, { color: isMajority ? P.sage : P.palmPink }]}>
            {isMajority ? 'Tu es dans la majorité 🙌' : 'Tu es dans la minorité 🤔'}
          </Text>

{/* Partager */}
<TouchableOpacity onPress={handleShare} style={styles.shareBtn}>
  <Text style={styles.shareText}>Partager →</Text>
</TouchableOpacity>

          {/* Changer / Annuler */}
          <View style={styles.changeRow}>
            {['A', 'B'].map(key => (
              <TouchableOpacity key={key} onPress={() => { if (voted !== key) onVote(d.id, key); }}
                style={[styles.changeBtn, { borderColor: voted === key ? (key === 'A' ? P.roseDeep : P.tealDeep) : P.cardBorder, backgroundColor: voted === key ? (key === 'A' ? P.roseLight : P.tealLight) : 'transparent' }]}>
                <Text style={{ fontSize: 11, fontWeight: '800', color: voted === key ? (key === 'A' ? P.roseDeep : P.tealDeep) : P.textLight }}>
                  {voted === key ? '✓ ' : ''}{key}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity onPress={() => { onVote(d.id, null); setRevealed(false); }}>
              <Text style={styles.annuler}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

export default function FeedScreen({ dilemmes, userVotes, onVote, activeTab, onTabChange }) {
  const tabs = [
    { id: 'trending', label: 'Trending' },
    { id: 'all',      label: 'Tous' },
    ...CATEGORIES.map(c => ({ id: c.id, label: c.label })),
  ];

  let displayed;
  if (activeTab === 'trending') {
    displayed = [...dilemmes].sort((a, b) => (b.votesA + b.votesB) - (a.votesA + a.votesB));
  } else if (activeTab === 'all') {
    displayed = [...dilemmes].sort((a, b) => b.id - a.id);
  } else {
    displayed = dilemmes.filter(d => d.categories.includes(activeTab)).sort((a, b) => b.id - a.id);
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>ORA<Text style={{ color: P.teal }}>.</Text></Text>
      </View>

    {/* Row 1 — Trending + Tous fixes */}
<View style={styles.fixedTabs}>
  {[{ id: 'trending', label: 'Trending' }, { id: 'all', label: 'Tous' }].map(tab => {
    const active = activeTab === tab.id;
    return (
      <TouchableOpacity key={tab.id} onPress={() => onTabChange(tab.id)}
        style={[styles.tab, { backgroundColor: active ? (tab.id === 'trending' ? '#e8a0a8' : '#1a1714') : '#ffffff', borderColor: active ? 'transparent' : '#e0dbd2' }]}>
        <Text style={[styles.tabText, { color: active ? '#fff' : '#6a6058' }]}>{tab.label.toUpperCase()}</Text>
      </TouchableOpacity>
    );
  })}
</View>

{/* Row 2 — Catégories scrollables */}
<ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScroll} contentContainerStyle={styles.tabsContent}>
  {CATEGORIES.map(cat => {
    const active = activeTab === cat.id;
    const cs = CAT_STYLE[cat.id];
    return (
      <TouchableOpacity key={cat.id} onPress={() => onTabChange(cat.id)}
        style={[styles.tab, { backgroundColor: active ? cs.bg : '#ffffff', borderColor: active ? cs.text : '#e0dbd2' }]}>
        <Text style={[styles.tabText, { color: active ? cs.text : '#6a6058' }]}>{cat.label.toUpperCase()}</Text>
      </TouchableOpacity>
    );
  })}
</ScrollView>

      {/* Feed */}
      <ScrollView contentContainerStyle={styles.feed}>
        {displayed.map(d => (
          <DilemmeCard key={d.id} d={d} onVote={onVote} userVotes={userVotes} />
        ))}
      </ScrollView>
    </View>
  );
}

export { DILEMMES_INIT, P, CAT_STYLE, CATEGORIES };

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: P.bg },
  header:       { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 8 },
  logo:         { fontSize: 30, fontWeight: '900', color: P.text, letterSpacing: -1 },
  tabsScroll:   { height: 44, flexShrink: 0, flexGrow: 0 },
  tabsContent:  { paddingLeft: 16, paddingRight: 32, gap: 7, paddingVertical: 4 },
  fixedTabs:    { flexDirection: 'row', gap: 7, paddingHorizontal: 16, marginBottom: 6 },
  tab:          { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 8, borderWidth: 1.5, height: 34, justifyContent: 'center', alignItems: 'center' },
  tabText:      { fontSize: 10, fontWeight: '800', letterSpacing: 0.3 },
  feed:         { padding: 16, paddingBottom: 100 },
  card:         { backgroundColor: P.card, borderRadius: 20, padding: 20, marginBottom: 14, borderWidth: 1.5, borderColor: P.cardBorder },
  cardHeader:   { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  avatar:       { width: 34, height: 34, borderRadius: 17, backgroundColor: P.teal, alignItems: 'center', justifyContent: 'center' },
  avatarText:   { fontSize: 13, fontWeight: '800', color: '#fff' },
  auteur:       { fontSize: 12, fontWeight: '700', color: P.text },
  temps:        { fontSize: 10, color: P.textLight },
  badges:       { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginBottom: 12 },
  badge:        { borderRadius: 6, paddingHorizontal: 9, paddingVertical: 3 },
  badgeText:    { fontSize: 10, fontWeight: '800', letterSpacing: 0.8 },
  question:     { fontSize: 16, fontWeight: '700', color: P.text, lineHeight: 24, marginBottom: 16 },
  voteCount:    { fontSize: 28, fontWeight: '900', color: P.textLight, textAlign: 'center' },
  voteLabel:    { fontSize: 11, color: P.textLight, textAlign: 'center', marginBottom: 14 },
  btns:         { flexDirection: 'row', gap: 10 },
  btn:          { flex: 1, padding: 14, borderRadius: 13, alignItems: 'center' },
  btnText:      { fontSize: 12, fontWeight: '800', textAlign: 'center' },
  suspense:     { alignItems: 'center', paddingVertical: 20 },
  suspenseText: { fontSize: 12, color: P.textMid, marginBottom: 12 },
  dots:         { flexDirection: 'row', gap: 6 },
  dot:          { width: 8, height: 8, borderRadius: 4, backgroundColor: P.rose },
  barRow:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  barLabel:     { fontSize: 12, fontWeight: '700', flex: 1 },
  barPct:       { fontSize: 13, fontWeight: '900' },
  track:        { height: 9, borderRadius: 999, overflow: 'hidden' },
  bar:          { height: '100%', borderRadius: 999 },
  totalVotes:   { fontSize: 11, color: P.textLight, textAlign: 'center', marginTop: 8 },
  majorityMsg:  { fontSize: 11, fontWeight: '800', textAlign: 'center', marginTop: 4 },
  myVoteBadge:  { borderRadius: 4, paddingHorizontal: 5, paddingVertical: 1 },
  myVoteText:   { fontSize: 10, fontWeight: '800', color: '#fff' },
  changeRow:    { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: P.cardBorder },
  changeBtn:    { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, borderWidth: 2 },
  annuler:      { fontSize: 11, color: P.textLight, fontWeight: '600' },
  fixedTabs: { flexDirection: 'row', gap: 7, paddingHorizontal: 16, marginBottom: 6 },
shareBtn:  { paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#e0dbd2', marginTop: 12 },
shareText: { fontSize: 12, fontWeight: '700', color: '#a89e90' },
});