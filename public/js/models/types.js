/**
 * @typedef {Object} Event
 * @property {string} id - イベントID
 * @property {string} name - イベント名
 * @property {string[]} dates - 候補日リスト（ISO8601形式の文字列）
 * @property {string} createdAt - 作成日時（ISO8601形式の文字列）
 */

/**
 * @typedef {Object} Answer
 * @property {string} id - 回答ID
 * @property {string} eventId - イベントID
 * @property {string} userName - 回答者名
 * @property {Object.<string, string>} availability - 候補日ごとの回答（"○" | "△" | "×"）
 * @property {string} createdAt - 回答日時（ISO8601形式の文字列）
 * @property {string} updatedAt - 更新日時（ISO8601形式の文字列）
 */

// Firestoreのコンバーター
export const eventConverter = {
  toFirestore: (event) => ({
    name: event.name,
    dates: event.dates,  // すでにISOString形式
    createdAt: event.createdAt  // すでにISOString形式
  }),
  fromFirestore: (snapshot, options) => {
    const data = snapshot.data(options);
    return {
      id: snapshot.id,
      name: data.name,
      dates: data.dates,  // ISOString形式のまま
      createdAt: data.createdAt  // ISOString形式のまま
    };
  }
};

export const answerConverter = {
  toFirestore: (answer) => ({
    eventId: answer.eventId,
    userName: answer.userName,
    availability: answer.availability,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }),
  fromFirestore: (snapshot, options) => {
    const data = snapshot.data(options);
    return {
      id: snapshot.id,
      eventId: data.eventId,
      userName: data.userName,
      availability: data.availability,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    };
  }
}; 