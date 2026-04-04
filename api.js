import { supabase } from './supabase';
import 'react-native-get-random-values';
import AsyncStorage from '@react-native-async-storage/async-storage';

const getUserId = async () => {
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

// Récupérer tous les dilemmes
export const getDilemmes = async () => {
  const { data, error } = await supabase
    .from('dilemmes')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

// Poster un dilemme
export const postDilemme = async ({ question, optionA, optionB, categories }) => {
  const { data, error } = await supabase
    .from('dilemmes')
    .insert({
      auteur: 'Anonyme',
      question,
      option_a: optionA,
      option_b: optionB,
      categories,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
};

// Voter
export const voterPour = async (dilemmeId, choix) => {
  const userId = getUserId();
  const { error } = await supabase
    .from('votes')
    .upsert({ dilemme_id: dilemmeId, user_id: userId, choix },
      { onConflict: 'dilemme_id,user_id' });
  if (error) throw error;

  // Mettre à jour les compteurs
  const { data: votes } = await supabase
    .from('votes')
    .select('choix')
    .eq('dilemme_id', dilemmeId);

  const votesA = votes.filter(v => v.choix === 'A').length;
  const votesB = votes.filter(v => v.choix === 'B').length;

  await supabase
    .from('dilemmes')
    .update({ votes_a: votesA, votes_b: votesB })
    .eq('id', dilemmeId);
};

// Annuler un vote
export const annulerVote = async (dilemmeId) => {
  const userId = getUserId();
  await supabase
    .from('votes')
    .delete()
    .eq('dilemme_id', dilemmeId)
    .eq('user_id', userId);
};

// Récupérer les votes de l'utilisateur
export const getMesVotes = async () => {
  const userId = getUserId();
  const { data, error } = await supabase
    .from('votes')
    .select('dilemme_id, choix')
    .eq('user_id', userId);
  if (error) throw error;
  return data;
};