import { db, functions } from '../config.js';
import { httpsCallable } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-functions.js';
import { collection, doc, addDoc, getDoc, getDocs, query, where, orderBy } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import { eventConverter, answerConverter } from './types.js';

// イベント関連の操作
export const eventDB = {
  // イベントの作成
  async create(eventData) {
    console.log('Starting to create event:', eventData);
    try {
      const createEvent = httpsCallable(functions, 'createEvent');
      console.log('Calling createEvent function with:', {
        name: eventData.name,
        dates: eventData.dates.map(d => d.toISOString())
      });
      
      const result = await createEvent({
        name: eventData.name,
        dates: eventData.dates.map(d => d.toISOString())
      });
      
      console.log('Event created with result:', result);
      return result.data.id;
    } catch (error) {
      console.error('Error in eventDB.create:', error);
      throw error;
    }
  },

  // イベントの取得
  async get(eventId) {
    const docRef = doc(db, 'events', eventId).withConverter(eventConverter);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() : null;
  }
};

// 回答関連の操作
export const answerDB = {
  // 回答の作成
  async create(answerData) {
    try {
      const submitAnswer = httpsCallable(functions, 'submitAnswer');
      const result = await submitAnswer(answerData);
      return result.data.id;
    } catch (error) {
      console.error('Error in answerDB.create:', error);
      throw error;
    }
  },

  // イベントの回答一覧取得
  async getByEventId(eventId) {
    try {
      const answersRef = collection(db, `events/${eventId}/answers`).withConverter(answerConverter);
      const querySnapshot = await getDocs(answersRef);
      return querySnapshot.docs.map(doc => doc.data());
    } catch (error) {
      console.error('Error in answerDB.getByEventId:', error);
      throw error;
    }
  }
}; 