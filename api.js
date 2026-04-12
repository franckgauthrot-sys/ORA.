import { supabase } from './supabase';
import 'react-native-get-random-values';
import AsyncStorage from '@react-native-async-storage/async-storage';

const getUserId = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.user?.id) return session.user.id;
  // Fallback sur l'ancien système
  try {
    let id = await AsyncStorage.getItem('ora_user_id');
    if (!id) {
      id = Math.random().toString(36).substr(2, 9);
      await AsyncStorage.setItem('ora_user_id', id);
    }
    return id;
  } catch (e) {
    return Math.random().toString(36).substr(2, 9);
  }
};

export const getDilemmes = async () => {
  const { data, error } = await supabase
    .from('dilemmes')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

export const postDilemme = async ({ question, optionA, optionB, categories, userId, auteur }) => {
  const { data, error } = await supabase
    .from('dilemmes')
    .insert({
      auteur: auteur || 'Anonyme',
      question,
      option_a: optionA,
      option_b: optionB,
      categories,
      user_id: userId,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const voterPour = async (dilemmeId, choix) => {
  const userId = await getUserId();

  // Vérifier si déjà voté
  const { data: existing } = await supabase
    .from('votes')
    .select('choix')
    .eq('dilemme_id', dilemmeId)
    .eq('user_id', userId)
    .maybeSingle();

  // Enregistrer le vote
  const { error } = await supabase
    .from('votes')
    .upsert(
      { dilemme_id: dilemmeId, user_id: userId, choix },
      { onConflict: 'dilemme_id,user_id' }
    );
  if (error) throw error;

  // Incrémenter/décrémenter directement sans recalculer depuis zéro
  if (existing) {
    // Changement de vote
    if (existing.choix !== choix) {
      await supabase.rpc('increment_vote', { dilemme_id: dilemmeId, column_name: choix === 'A' ? 'votes_a' : 'votes_b' });
      await supabase.rpc('decrement_vote', { dilemme_id: dilemmeId, column_name: existing.choix === 'A' ? 'votes_a' : 'votes_b' });
    }
  } else {
    // Nouveau vote
    await supabase.rpc('increment_vote', { dilemme_id: dilemmeId, column_name: choix === 'A' ? 'votes_a' : 'votes_b' });
  }

// Envoyer la notification
  try {
    const { data: notifData, error: notifError } = await supabase.functions.invoke('send-notification', {
      body: { dilemme_id: dilemmeId, voter_id: userId, choix }
    });
    console.log('Notif result:', notifData, notifError);
  } catch (e) {
    console.log('Erreur notification:', e);
  }
};

export const annulerVote = async (dilemmeId) => {
  const userId = await getUserId();

  // Récupérer le vote existant avant de supprimer
  const { data: existing } = await supabase
    .from('votes')
    .select('choix')
    .eq('dilemme_id', dilemmeId)
    .eq('user_id', userId)
    .maybeSingle();

  if (!existing) return;

  // Supprimer le vote
  await supabase
    .from('votes')
    .delete()
    .eq('dilemme_id', dilemmeId)
    .eq('user_id', userId);

  // Décrémenter uniquement le bon compteur
  await supabase.rpc('decrement_vote', {
    dilemme_id: dilemmeId,
    column_name: existing.choix === 'A' ? 'votes_a' : 'votes_b',
  });
};

export const getMesVotes = async () => {
  const userId = await getUserId();
  const { data, error } = await supabase
    .from('votes')
    .select('dilemme_id, choix')
    .eq('user_id', userId);
  if (error) throw error;
  return data;
};

// Récupérer le profil de l'utilisateur
export const getProfil = async (userId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) throw error;
  return data;
};

// Mettre à jour le pseudo
export const updatePseudo = async (userId, pseudo) => {
  const { error } = await supabase
    .from('profiles')
    .update({ pseudo })
    .eq('id', userId);
  if (error) throw error;
};

// Récupérer les dilemmes postés par l'utilisateur
export const getMesDilemmes = async (userId) => {
  const { data, error } = await supabase
    .from('dilemmes')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};