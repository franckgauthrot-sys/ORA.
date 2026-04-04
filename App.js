import { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import FeedScreen, { DILEMMES_INIT } from './FeedScreen';
import PostScreen from './PostScreen';
import ProfilScreen from './ProfilScreen';

const P = {
  bg:       '#f2f0eb',
  teal:     '#e8943a',
  textMid:  '#6a6058',
  cardBorder:'#e0dbd2',
  palmPink: '#e8a0a8',
};

export default function App() {
  const [page, setPage]         = useState('feed');
  const [feed, setFeed]         = useState(DILEMMES_INIT);
  const [userVotes, setUserVotes] = useState({});
  const [myPosts, setMyPosts]   = useState([]);
  const [activeTab, setActiveTab] = useState('trending');

  const handleVote = (id, choix) => {
    if (choix === null) {
      setUserVotes(v => { const n = { ...v }; delete n[id]; return n; });
    } else {
      setUserVotes(v => ({ ...v, [id]: choix }));
    }
  };

  const handlePost = ({ question, optionA, optionB, categories }) => {
    const newPost = {
      id: Date.now(),
      auteur: 'Toi',
      tempsPoste: 'À l\'instant',
      question, optionA, optionB,
      categories: categories.length ? categories : [],
      votesA: 0, votesB: 0,
    };
    setFeed(f => [newPost, ...f]);
    setMyPosts(p => [newPost, ...p]);
    setPage('feed');
  };

  const votedCount = Object.keys(userVotes).length;
  const navItems = [
    { id: 'feed',   icon: '⊞', label: 'Feed' },
    { id: 'post',   icon: '+', label: 'Poster' },
    { id: 'profil', icon: '○', label: 'Profil' },
  ];

  return (
    <View style={styles.container}>
      {/* Pages */}
      {page === 'feed' && (
        <FeedScreen
          dilemmes={feed}
          userVotes={userVotes}
          onVote={handleVote}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      )}
      {page === 'post' && (
        <PostScreen onPost={handlePost} />
      )}
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

      {/* Nav bar */}
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
  container:  { flex: 1, backgroundColor: '#f2f0eb' },
  nav:        { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-around', paddingBottom: 30, paddingTop: 12, backgroundColor: '#f2f0eb', borderTopWidth: 1, borderTopColor: '#e0dbd2' },
  navItem:    { alignItems: 'center', gap: 3, position: 'relative' },
  navIcon:    { fontSize: 20 },
  navLabel:   { fontSize: 9, fontWeight: '800', letterSpacing: 1.2 },
  streakDot:  { position: 'absolute', top: -4, right: -10, backgroundColor: '#e8a0a8', borderRadius: 8, width: 15, height: 15, alignItems: 'center', justifyContent: 'center' },
  streakText: { fontSize: 8, fontWeight: '800', color: '#fff' },
});