import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import FeedScreen, { DILEMMES_INIT } from './FeedScreen';
import PostScreen from './PostScreen';
import ProfilScreen from './ProfilScreen';
import { useState, useEffect } from 'react';
import { getDilemmes, postDilemme, voterPour, annulerVote, getMesVotes } from './api';

const P = {
  bg:        '#f2f0eb',
  teal:      '#e8943a',
  textMid:   '#6a6058',
  cardBorder:'#e0dbd2',
  palmPink:  '#e8a0a8',
};

export default function App() {
  const [page, setPage]           = useState('feed');
  const [feed, setFeed]           = useState([]);
  const [userVotes, setUserVotes] = useState({});
  const [myPosts, setMyPosts]     = useState([]);
  const [activeTab, setActiveTab] = useState('trending');
  const [notif, setNotif]         = useState(null);
  const [fomoSeen, setFomoSeen]   = useState(false);
  const [loading, setLoading]     = useState(true);

  // Charger les dilemmes depuis Supabase
  useEffect(() => {
    chargerDilemmes();
    chargerMesVotes();
  }, []);

  const chargerDilemmes = async () => {
    try {
      const data = await getDilemmes();
      if (data && data.length > 0) {
        // Convertir le format Supabase vers le format de l'app
        const formatted = data.map(d => ({
          id: d.id,
          auteur: d.auteur,
          tempsPoste: new Date(d.created_at).toLocaleDateString('fr-FR'),
          question: d.question,
          optionA: d.option_a,
          optionB: d.option_b,
          categories: d.categories || [],
          votesA: d.votes_a || 0,
          votesB: d.votes_b || 0,
        }));
        setFeed(formatted);
      } else {
        // Pas de données en base — utiliser les données initiales
        setFeed(DILEMMES_INIT);
      }
    } catch (e) {
      console.log('Erreur chargement:', e);
      setFeed(DILEMMES_INIT);
    } finally {
      setLoading(false);
    }
  };

  const chargerMesVotes = async () => {
    try {
      const votes = await getMesVotes();
      const votesMap = {};
      votes.forEach(v => { votesMap[v.dilemme_id] = v.choix; });
      setUserVotes(votesMap);
    } catch (e) {
      console.log('Erreur votes:', e);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => setNotif('12 personnes ont voté sur ton dilemme 🔥'), 5000);
    return () => clearTimeout(t);
  }, []);

  const handleVote = async (id, choix) => {
    // Mise à jour optimiste — l'UI se met à jour immédiatement
    const prev = userVotes[id];
    if (choix === null) {
      setUserVotes(v => { const n = { ...v }; delete n[id]; return n; });
      setFeed(f => f.map(d => d.id === id ? {
        ...d,
        votesA: d.votesA - (prev === 'A' ? 1 : 0),
        votesB: d.votesB - (prev === 'B' ? 1 : 0),
      } : d));
      try { await annulerVote(id); } catch (e) { console.log(e); }
    } else {
      setUserVotes(v => ({ ...v, [id]: choix }));
      setFeed(f => f.map(d => d.id === id ? {
        ...d,
        votesA: d.votesA + (choix === 'A' ? 1 : 0) - (prev === 'A' ? 1 : 0),
        votesB: d.votesB + (choix === 'B' ? 1 : 0) - (prev === 'B' ? 1 : 0),
      } : d));
      try { await voterPour(id, choix); } catch (e) { console.log(e); }
    }
  };

  const handlePost = async ({ question, optionA, optionB, categories }) => {
    try {
      const newPost = await postDilemme({ question, optionA, optionB, categories });
      const formatted = {
        id: newPost.id,
        auteur: 'Toi',
        tempsPoste: "À l'instant",
        question: newPost.question,
        optionA: newPost.option_a,
        optionB: newPost.option_b,
        categories: newPost.categories || [],
        votesA: 0,
        votesB: 0,
      };
      setFeed(f => [formatted, ...f]);
      setMyPosts(p => [formatted, ...p]);
    } catch (e) {
      console.log('Erreur post:', e);
      // Fallback local
      const newPost = {
        id: Date.now().toString(),
        auteur: 'Toi',
        tempsPoste: "À l'instant",
        question, optionA, optionB,
        categories: categories.length ? categories : [],
        votesA: 0, votesB: 0,
      };
      setFeed(f => [newPost, ...f]);
      setMyPosts(p => [newPost, ...p]);
    }
    setPage('feed');
  };

  const votedCount = Object.keys(userVotes).length;
  const navItems = [
    { id: 'feed',   icon: '⊞', label: 'Feed' },
    { id: 'post',   icon: '+', label: 'Poster' },
    { id: 'profil', icon: '○', label: 'Profil' },
  ];

  if (loading) {
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingText}>ora<Text style={{ color: '#e8943a' }}>.</Text></Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {notif && (
        <TouchableOpacity onPress={() => setNotif(null)} style={styles.toast}>
          <Text style={styles.toastText}>🔔 {notif}</Text>
        </TouchableOpacity>
      )}
      {!fomoSeen && page === 'feed' && (
        <TouchableOpacity onPress={() => setFomoSeen(true)} style={styles.fomo}>
          <Text style={styles.fomoText}>4 nouveaux 🔥</Text>
        </TouchableOpacity>
      )}

      {page === 'feed' && (
        <FeedScreen
          dilemmes={feed}
          userVotes={userVotes}
          onVote={handleVote}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      )}
      {page === 'post' && <PostScreen onPost={handlePost} />}
      {page === 'profil' && (
        <ProfilScreen
          myPosts={myPosts}
          votedCount={votedCount}
          streak={3}
          userVotes={userVotes}
          feed={feed}
          onVote={handleVote}
        />
      )}

      <View style={styles.nav}>
        {navItems.map(item => {
          const active = page === item.id;
          return (
            <TouchableOpacity key={item.id} style={styles.navItem} onPress={() => setPage(item.id)}>
              <Text style={[styles.navIcon, { color: active ? P.teal : P.textMid }]}>{item.icon}</Text>
              <Text style={[styles.navLabel, { color: active ? P.teal : P.textMid }]}>{item.label.toUpperCase()}</Text>
              {item.id === 'profil' && (
                <View style={styles.streakDot}>
                  <Text style={styles.streakText}>3</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: '#f2f0eb' },
  loading:     { flex: 1, backgroundColor: '#f2f0eb', alignItems: 'center', justifyContent: 'center' },
  loadingText: { fontSize: 40, fontWeight: '900', color: '#1a1714' },
  nav:         { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-around', paddingBottom: 30, paddingTop: 12, backgroundColor: '#f2f0eb', borderTopWidth: 1, borderTopColor: '#e0dbd2' },
  navItem:     { alignItems: 'center', gap: 3, position: 'relative' },
  navIcon:     { fontSize: 20 },
  navLabel:    { fontSize: 9, fontWeight: '800', letterSpacing: 1.2 },
  streakDot:   { position: 'absolute', top: -4, right: -10, backgroundColor: '#e8a0a8', borderRadius: 8, width: 15, height: 15, alignItems: 'center', justifyContent: 'center' },
  streakText:  { fontSize: 8, fontWeight: '800', color: '#fff' },
  toast:       { position: 'absolute', top: 54, right: 16, backgroundColor: '#1a1714', borderRadius: 14, padding: 12, zIndex: 999, maxWidth: 220 },
  toastText:   { color: '#fff', fontSize: 13, fontWeight: '700' },
  fomo:        { position: 'absolute', top: 54, right: 16, backgroundColor: '#e8a0a8', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, zIndex: 998 },
  fomoText:    { color: '#fff', fontSize: 12, fontWeight: '800' },
});