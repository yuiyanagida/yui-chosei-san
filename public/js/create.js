import { eventDB } from './models/db.js';

document.addEventListener('DOMContentLoaded', () => {
  const eventForm = document.getElementById('eventForm');
  const dateSelection = document.getElementById('dateSelection');
  const addDateButton = document.getElementById('addDate');
  const result = document.getElementById('result');

  // 候補日入力フィールドの追加
  function addDateField() {
    const group = document.createElement('div');
    group.className = 'date-input-group';
    
    const dateInput = document.createElement('input');
    dateInput.type = 'date';
    dateInput.className = 'date-input';
    dateInput.required = true;
    
    const removeButton = document.createElement('button');
    removeButton.type = 'button';
    removeButton.className = 'remove-date';
    removeButton.textContent = '削除';
    removeButton.onclick = () => group.remove();
    
    group.appendChild(dateInput);
    group.appendChild(removeButton);
    dateSelection.appendChild(group);
  }

  // 最初の候補日フィールドを追加
  addDateField();
  
  // 「候補日を追加」ボタンのイベントリスナー
  addDateButton.addEventListener('click', addDateField);

  // フォーム送信時の処理
  eventForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    try {
      const eventName = document.getElementById('eventName').value;
      const dateInputs = Array.from(document.querySelectorAll('.date-input'));
      const dates = dateInputs.map(input => new Date(input.value));
      
      // デバッグ用のログ
      console.log('Creating event with data:', {
        name: eventName,
        dates: dates
      });
      
      // イベントの作成
      const eventId = await eventDB.create({
        name: eventName,
        dates: dates,
      });
      
      // 成功時のログ
      console.log('Event created successfully:', eventId);
      
      // 結果の表示
      const eventUrl = `${window.location.origin}/event.html?id=${eventId}`;
      result.innerHTML = `
        <p class="success">イベントを作成しました！</p>
        <p>以下のURLを共有してください：</p>
        <input type="text" class="input" value="${eventUrl}" readonly>
        <button class="btn copy-button" onclick="navigator.clipboard.writeText('${eventUrl}')">
          URLをコピー
        </button>
      `;
      result.classList.add('show');
      
      // フォームのリセット
      eventForm.reset();
      while (dateSelection.children.length > 1) {
        dateSelection.lastChild.remove();
      }
    } catch (error) {
      // より詳細なエラーログ
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        stack: error.stack,
        name: error.name,
        fullError: error
      });

      // エラーメッセージを表示
      result.innerHTML = `
        <p class="error">エラーが発生しました：${error.message}</p>
      `;
      result.classList.add('show');
    }
  });
}); 