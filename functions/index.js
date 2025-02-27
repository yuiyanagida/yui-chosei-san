/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const { onRequest } = require("firebase-functions/v2/https");
const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const logger = require("firebase-functions/logger");
const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const cors = require('cors')({ origin: true });

// Firebase Adminの初期化
initializeApp();
const db = getFirestore();

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

exports.helloWorld = onRequest((request, response) => {
  logger.info("Hello logs!", {structuredData: true});
  response.send("Hello from Firebase!");
});

// イベント作成API
exports.createEvent = onRequest((request, response) => {
  return cors(request, response, async () => {
    try {
      // POSTメソッド以外は拒否
      if (request.method !== 'POST') {
        response.status(405).send('Method Not Allowed');
        return;
      }

      // リクエストデータのログ出力
      console.log('Received request data:', request.body);

      const { name, dates } = request.body.data || {}; // data プロパティから取得

      // バリデーション
      if (!name || !dates || !Array.isArray(dates) || dates.length === 0) {
        console.log('Validation failed:', { name, dates });
        response.status(400).json({
          error: 'Invalid request data',
          received: { name, dates }
        });
        return;
      }

      // イベントデータの作成
      const eventData = {
        name: name,
        dates: dates,  // すでにISOString形式で送られてくるので変換不要
        createdAt: new Date().toISOString()  // ISOString形式で保存
      };

      // Firestoreにデータを保存
      const docRef = await db.collection('events').add(eventData);

      logger.info('Event created:', {
        eventId: docRef.id,
        eventName: name,
        datesCount: dates.length
      });

      // 成功レスポンス
      response.status(200).json({
        data: {  // data プロパティでラップ
          id: docRef.id,
          message: 'Event created successfully'
        }
      });

    } catch (error) {
      logger.error('Error creating event:', error);
      response.status(500).json({
        error: 'Internal Server Error',
        message: error.message
      });
    }
  });
});

// イベント作成後の処理
exports.onEventCreated = onDocumentCreated("events/{eventId}", (event) => {
  const eventData = event.data.data();
  const eventId = event.data.id;
  
  logger.info("New event created", {
    eventId: eventId,
    eventName: eventData.name,
    datesCount: eventData.dates.length
  });
  
  // 必要に応じて追加の処理を実装
  // 例：通知の送信、統計の更新など
});

// 回答送信API
exports.submitAnswer = onRequest((request, response) => {
  return cors(request, response, async () => {
    try {
      // POSTメソッド以外は拒否
      if (request.method !== 'POST') {
        response.status(405).send('Method Not Allowed');
        return;
      }

      // リクエストデータのログ出力
      console.log('Received answer data:', request.body);

      const { eventId, userName, availability } = request.body.data || {};

      // バリデーション
      if (!eventId || !userName || !availability || typeof availability !== 'object') {
        console.log('Validation failed:', { eventId, userName, availability });
        response.status(400).json({
          error: 'Invalid request data',
          received: { eventId, userName, availability }
        });
        return;
      }

      // イベントの存在確認
      const eventRef = db.collection('events').doc(eventId);
      const eventDoc = await eventRef.get();
      
      if (!eventDoc.exists) {
        response.status(404).json({
          error: 'Event not found',
          eventId: eventId
        });
        return;
      }

      // 回答データの作成
      const answerData = {
        eventId,
        userName,
        availability,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Firestoreに回答を保存
      const answerRef = await db.collection(`events/${eventId}/answers`).add(answerData);

      logger.info('Answer submitted:', {
        answerId: answerRef.id,
        eventId: eventId,
        userName: userName
      });

      // 成功レスポンス
      response.status(200).json({
        data: {
          id: answerRef.id,
          message: 'Answer submitted successfully'
        }
      });

    } catch (error) {
      logger.error('Error submitting answer:', error);
      response.status(500).json({
        error: 'Internal Server Error',
        message: error.message
      });
    }
  });
});
