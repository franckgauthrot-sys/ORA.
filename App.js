import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import FeedScreen, { DILEMMES_INIT } from './FeedScreen';
import PostScreen from './PostScreen';
import ProfilScreen from './ProfilScreen';
import { useState, useEffect } from 'react';
import { getDilemmes, postDilemme, voterPour, annulerVote, getMesVotes } from './api';
import AuthScreen from './AuthScreen';
import { supabase } from './supabase';
import PseudoScreen from './PseudoScreen';
import { registerForPushNotifications, setupNotificationListeners } from './notifications';
import { getDilemmes, postDilemme, voterPour, annulerVote, getMesVotes, supprimerDilemme } from './api';

const P = {
  bg:        '#f2f0eb',
  teal:      '#e8943a',
  textMid:   '#6a6058',
  cardBorder:'#e0dbd2',
  palmPink:  '#e8a0a8',
};

export default function App() {
  const [page, setPage]             = useState('feed');
  const [feed, setFeed]             = useState([]);
  const [userVotes, setUserVotes]   = useState({});
  const [myPosts, setMyPosts]       = useState([]);
  const [activeTab, setActiveTab]   = useState('');
  const [loading, setLoading]       = useState(true);
  const [user, setUser]             = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [pseudo, setPseudo]         = useState(null);
  const [newVoteDilemmes, setNewVoteDilemmes] = useState([]); // liste des dilemme_id avec nouveaux votes

  const loadProfile = async (sessionUser) => {
  try {
    const { data } = await supabase
      .from('profiles')
      .select('pseudo')
      .eq('id', sessionUser.id)
      .maybeSingle();

    if (!data) {
      await supabase
        .from('profiles')
        .upsert({ id: sessionUser.id, email: sessionUser.email }, { onConflict: 'id' });
    } else if (data?.pseudo) {
      setPseudo(data.pseudo);
    }
    
    await chargerMesVotes();

    // Charger mes dilemmes
    const { data: mesDilemmes } = await supabase
      .from('dilemmes')
      .select('*')
      .eq('user_id', sessionUser.id)
      .order('created_at', { ascending: false });
    
    if (mesDilemmes && mesDilemmes.length > 0) {
      setMyPosts(mesDilemmes.map(d => ({
        id: d.id,
        auteur: d.auteur,
        tempsPoste: new Date(d.created_at).toLocaleDateString('fr-FR'),
        question: d.question,
        optionA: d.option_a,
        optionB: d.option_b,
        categories: d.categories || [],
        votesA: d.votes_a || 0,
        votesB: d.votes_b || 0,
      })));
    }

  } catch (e) {
    console.log('Erreur profil:', e);
  }
};

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        setUser(session.user);
        await loadProfile(session.user);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        setUser(session.user);
        await loadProfile(session.user);
      } else {
        setUser(null);
        setPseudo(null);
        await chargerMesVotes();
      }
    });

    chargerDilemmes();
    chargerMesVotes();
    setTimeout(() => setLoading(false), 5000);

    return () => subscription?.unsubscribe();
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel('votes-realtime')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'dilemmes' },
        (payload) => {
          const d = payload.new;
          setFeed(f => f.map(item => item.id === d.id ? {
            ...item, votesA: d.votes_a, votesB: d.votes_b,
          } : item));
        }
      )
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  useEffect(() => {
  if (user) {
    registerForPushNotifications(user.id);
   const cleanup = setupNotificationListeners((notif) => {
  const dilemmeId = notif?.request?.content?.data?.dilemme_id;
  if (dilemmeId) setNewVoteDilemmes(prev => [...new Set([...prev, dilemmeId])]);
});
    return cleanup;
  }
}, [user]);

  const chargerDilemmes = async () => {
    try {
      const data = await getDilemmes();
      if (data && data.length > 0) {
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
          user_id: d.user_id,
        }));
        setFeed(formatted);
      } else {
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

  const handleRefresh = async () => {
  setRefreshing(true);
  await chargerDilemmes();
  await chargerMesVotes();
  
  // Recharger mes dilemmes
  if (user) {
    const { data: mesDilemmes } = await supabase
      .from('dilemmes')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (mesDilemmes) {
      setMyPosts(mesDilemmes.map(d => ({
        id: d.id,
        auteur: d.auteur,
        tempsPoste: new Date(d.created_at).toLocaleDateString('fr-FR'),
        question: d.question,
        optionA: d.option_a,
        optionB: d.option_b,
        categories: d.categories || [],
        votesA: d.votes_a || 0,
        votesB: d.votes_b || 0,
      })));
    }
  }
  
  setRefreshing(false);
};

  const handleSignOut = async () => {
  await supabase.auth.signOut();
  setUser(null);
  setPseudo(null);
  setUserVotes({});  // ← déjà là
  setMyPosts([]);    // ← déjà là
  setFeed([]);       // ← ajoute ça !
  await chargerDilemmes(); // ← recharge depuis Supabase
};

  const handleVote = async (id, choix) => {
    const prev = userVotes[id];
    if (choix === null) {
      setUserVotes(v => { const n = { ...v }; delete n[id]; return n; });
      setFeed(f => f.map(d => d.id === id ? {
        ...d,
        votesA: Math.max(0, d.votesA - (prev === 'A' ? 1 : 0)),
        votesB: Math.max(0, d.votesB - (prev === 'B' ? 1 : 0)),
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
    const auteur = pseudo || user?.email?.split('@')[0] || 'Anonyme';
    try {
      const newPost = await postDilemme({ question, optionA, optionB, categories, userId: user?.id, auteur });
      const formatted = {
        id: newPost.id,
        auteur,
        tempsPoste: "À l'instant",
        question: newPost.question,
        optionA: newPost.option_a,
        optionB: newPost.option_b,
        categories: newPost.categories || [],
        votesA: 0, votesB: 0,
      };
      setFeed(f => [formatted, ...f]);
      setMyPosts(p => [formatted, ...p]);
    } catch (e) {
      console.log('Erreur post:', e);
      const newPost = {
        id: Date.now().toString(),
        auteur,
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

  const handleSupprimerDilemme = async (id) => {
  try {
    await supprimerDilemme(id);
    setFeed(f => f.filter(d => d.id !== id));
    setMyPosts(p => p.filter(d => d.id !== id));
  } catch (e) {
    console.log('Erreur suppression:', e);
  }
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

  if (!user) {
    return <AuthScreen onAuth={setUser} />;
  }

  if (!pseudo) {
    return <PseudoScreen user={user} onDone={setPseudo} />;
  }

  return (
    <View style={styles.container}>
      {page === 'feed' && (
        <FeedScreen
          dilemmes={feed}
          userVotes={userVotes}
          onVote={handleVote}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onRefresh={handleRefresh}
          refreshing={refreshing}
        />
      )}
      {page === 'post' && <PostScreen onPost={handlePost} />}
      {page === 'profil' && (
        <ProfilScreen
          myPosts={myPosts}
          votedCount={votedCount}
          userVotes={userVotes}
          feed={feed}
          onVote={handleVote}
          user={user}
          onSignOut={handleSignOut}
          pseudo={pseudo}
          onPseudoChange={setPseudo}
          newVoteDilemmes={newVoteDilemmes}
          onVoteSeen={(id) => setNewVoteDilemmes(prev => prev.filter(d => d !== id))}
          onSupprimerDilemme={handleSupprimerDilemme}
/>
      
      )}

      <View style={styles.nav}>
        {navItems.map(item => {
  const active = page === item.id;
  return (
    <TouchableOpacity key={item.id} style={styles.navItem} onPress={() => {
      setPage(item.id);
if (item.id === 'profil') setNewVoteDilemmes([]);
    }}>
      <View>
        <Text style={[styles.navIcon, { color: active ? P.teal : P.textMid }]}>{item.icon}</Text>
        {item.id === 'profil' && newVoteDilemmes.length > 0 && (
  <View style={styles.pastille} />
)}
      </View>
      <Text style={[styles.navLabel, { color: active ? P.teal : P.textMid }]}>{item.label.toUpperCase()}</Text>
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
  pastille: { position: 'absolute', top: -2, right: -2, width: 8, height: 8, borderRadius: 4, backgroundColor: '#e8503a' },
});