import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';

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
  text:       '#1a1714',
  textMid:    '#6a6058',
  textLight:  '#a89e90',
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

export default function PostScreen({ onPost }) {
  const [question, setQuestion] = useState('');
  const [optA, setOptA]         = useState('');
  const [optB, setOptB]         = useState('');
  const [cats, setCats]         = useState([]);
  const [phase, setPhase]       = useState('form'); // form | sending | done

  const toggleCat = (id) => setCats(p => p.includes(id) ? p.filter(c => c !== id) : [...p, id]);
  const canSubmit = question.trim() && optA.trim() && optB.trim();

  const handleSubmit = () => {
    if (!canSubmit) return;
    setPhase('sending');
    setTimeout(() => {
      onPost({ question, optionA: optA, optionB: optB, categories: cats });
      setPhase('done');
      setTimeout(() => {
        setQuestion(''); setOptA(''); setOptB(''); setCats([]);
        setPhase('form');
      }, 1500);
    }, 900);
  };

  if (phase === 'sending' || phase === 'done') {
    return (
      <View style={styles.centerScreen}>
        {phase === 'sending' ? (
          <>
            <View style={styles.spinner} />
            <Text style={styles.phaseText}>Publication en cours…</Text>
          </>
        ) : (
          <>
            <View style={styles.successCircle}>
              <Text style={styles.successCheck}>✓</Text>
            </View>
            <Text style={styles.successTitle}>Posté !</Text>
            <Text style={styles.phaseText}>Retour au feed…</Text>
          </>
        )}
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Ton dilemme</Text>

      {/* Hint */}
      <View style={styles.hint}>
        <Text style={styles.hintText}>
          💡 Donne assez de contexte pour que les autres comprennent.{'\n'}
          <Text style={styles.hintExample}>"J'ai 28 ans, en couple depuis 3 ans — je pars ou je reste ?"</Text>
        </Text>
      </View>

      {/* Catégories */}
      <Text style={styles.label}>CATÉGORIES</Text>
      <View style={styles.cats}>
        {CATEGORIES.map(cat => {
          const active = cats.includes(cat.id);
          const s = CAT_STYLE[cat.id];
          return (
            <TouchableOpacity key={cat.id} onPress={() => toggleCat(cat.id)}
              style={[styles.catBtn, { backgroundColor: active ? s.bg : P.card, borderColor: active ? s.text : P.cardBorder }]}>
              <Text style={[styles.catText, { color: active ? s.text : P.textMid }]}>{cat.label.toUpperCase()}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Champs */}
      <Text style={styles.label}>LE DILEMME</Text>
      <TextInput
        style={styles.input}
        placeholder="Décris ta situation avec du contexte..."
        placeholderTextColor={P.textLight}
        value={question}
        onChangeText={setQuestion}
        multiline
        numberOfLines={4}
      />

      <Text style={[styles.label, { color: P.roseDeep }]}>OPTION A</Text>
      <TextInput
        style={[styles.input, { borderColor: optA ? P.rose : P.cardBorder }]}
        placeholder="ex : Je quitte tout"
        placeholderTextColor={P.textLight}
        value={optA}
        onChangeText={setOptA}
      />

      <Text style={[styles.label, { color: P.tealDeep }]}>OPTION B</Text>
      <TextInput
        style={[styles.input, { borderColor: optB ? P.teal : P.cardBorder }]}
        placeholder="ex : Je reste encore"
        placeholderTextColor={P.textLight}
        value={optB}
        onChangeText={setOptB}
      />

      {/* Bouton */}
      <TouchableOpacity
        style={[styles.publishBtn, { backgroundColor: canSubmit ? P.teal : P.cardBorder }]}
        onPress={handleSubmit}
        disabled={!canSubmit}>
        <Text style={[styles.publishText, { color: canSubmit ? '#fff' : P.textLight }]}>
          Publier mon dilemme →
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: '#f2f0eb' },
  content:       { padding: 20, paddingTop: 60, paddingBottom: 100 },
  title:         { fontSize: 24, fontWeight: '900', color: '#1a1714', marginBottom: 20 },
  hint:          { backgroundColor: '#ffffff', borderRadius: 12, padding: 14, marginBottom: 20, borderWidth: 1, borderColor: '#e0dbd2' },
  hintText:      { fontSize: 12, color: '#a89e90', lineHeight: 20 },
  hintExample:   { fontStyle: 'italic', color: '#6a6058' },
  label:         { fontSize: 10, fontWeight: '800', color: '#a89e90', letterSpacing: 1.5, marginBottom: 10 },
  cats:          { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  catBtn:        { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 8, borderWidth: 1.5 },
  catText:       { fontSize: 11, fontWeight: '800', letterSpacing: 0.6 },
  input:         { backgroundColor: '#ffffff', borderRadius: 11, padding: 14, fontSize: 14, color: '#1a1714', borderWidth: 1.5, borderColor: '#e0dbd2', marginBottom: 16, minHeight: 48 },
  publishBtn:    { borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 8 },
  publishText:   { fontSize: 15, fontWeight: '800' },
  centerScreen:  { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f2f0eb', gap: 16 },
  spinner:       { width: 56, height: 56, borderRadius: 28, borderWidth: 4, borderColor: '#4db8a8', borderTopColor: 'transparent' },
  phaseText:     { fontSize: 14, color: '#6a6058', fontWeight: '700' },
  successCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#4db8a8', alignItems: 'center', justifyContent: 'center' },
  successCheck:  { fontSize: 28, color: '#fff' },
  successTitle:  { fontSize: 20, fontWeight: '900', color: '#1a1714' },
});