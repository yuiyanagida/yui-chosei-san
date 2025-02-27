import { eventDB, answerDB } from './models/db.js';

// グローバルでイベントデータを保持
let currentEvent = null;

document.addEventListener('DOMContentLoaded', async () => {
    // URLからイベントIDを取得
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('id');

    if (!eventId) {
        showError('イベントIDが指定されていません');
        return;
    }

    try {
        // イベント情報を取得
        currentEvent = await eventDB.get(eventId);
        if (!currentEvent) {
            showError('イベントが見つかりません');
            return;
        }

        // イベント情報を表示
        displayEventDetails(currentEvent);

        // 回答一覧を取得して表示
        const answers = await answerDB.getByEventId(eventId);
        displayAnswers(currentEvent, answers);

        // 回答フォームを設定
        setupAnswerForm(currentEvent);

    } catch (error) {
        console.error('Error loading event:', error);
        showError('イベントの読み込みに失敗しました');
    }
});

// イベント詳細の表示
function displayEventDetails(event) {
    document.getElementById('eventName').textContent = event.name;
    document.getElementById('eventDate').textContent = formatDate(event.createdAt);

    // 日付ヘッダーを追加
    const headerRow = document.querySelector('#availabilityGrid thead tr');
    event.dates.forEach(date => {
        const th = document.createElement('th');
        th.textContent = formatDate(date);
        headerRow.appendChild(th);
    });
}

// 回答一覧の表示
function displayAnswers(event, answers) {
    const tbody = document.querySelector('#availabilityGrid tbody');
    tbody.innerHTML = ''; // 既存の回答をクリア

    answers.forEach(answer => {
        const tr = document.createElement('tr');
        
        // 名前セル
        const nameTd = document.createElement('td');
        nameTd.textContent = answer.userName;
        tr.appendChild(nameTd);

        // 各日付の回答セル
        event.dates.forEach(dateStr => {  // dateStrはすでにISO形式
            const td = document.createElement('td');
            td.textContent = answer.availability[dateStr] || '-';
            tr.appendChild(td);
        });

        tbody.appendChild(tr);
    });
}

// 回答フォームの設定
function setupAnswerForm(event) {
    const dateAnswers = document.getElementById('dateAnswers');
    dateAnswers.innerHTML = ''; // 既存のフォームをクリア

    event.dates.forEach(dateStr => {  // dateStrはすでにISO形式
        const group = document.createElement('div');
        group.className = 'date-answer-group';

        const label = document.createElement('label');
        label.textContent = formatDate(dateStr);
        group.appendChild(label);

        const options = document.createElement('div');
        options.className = 'availability-options';

        ['◯', '△', '✗'].forEach(symbol => {
            const option = createAvailabilityOption(dateStr, symbol);  // dateStrはすでにISO形式
            options.appendChild(option);
        });

        group.appendChild(options);
        dateAnswers.appendChild(group);
    });
}

// 回答オプションの作成
function createAvailabilityOption(dateStr, symbol) {
    const label = document.createElement('label');
    label.className = 'availability-option';

    const input = document.createElement('input');
    input.type = 'radio';
    input.name = `availability_${dateStr}`;
    input.value = symbol;
    input.required = true;

    const span = document.createElement('span');
    span.className = `availability-circle ${getSymbolClass(symbol)}`;
    span.textContent = symbol;

    label.appendChild(input);
    label.appendChild(span);

    return label;
}

// 日付のフォーマット
function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        weekday: 'short'
    });
}

// シンボルに対応するクラス名を取得
function getSymbolClass(symbol) {
    switch (symbol) {
        case '◯': return 'yes';
        case '△': return 'maybe';
        case '✗': return 'no';
        default: return '';
    }
}

// エラーメッセージの表示
function showError(message) {
    const eventDetails = document.getElementById('eventDetails');
    eventDetails.innerHTML = `
        <div class="error">
            <p>${message}</p>
            <a href="/" class="btn">トップページに戻る</a>
        </div>
    `;
}

// フォームの送信処理
document.getElementById('answerForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!currentEvent) {
        alert('イベントデータが読み込まれていません');
        return;
    }

    const userName = document.getElementById('userName').value;
    const eventId = new URLSearchParams(window.location.search).get('id');
    const availability = {};

    // 各日付の回答を収集
    currentEvent.dates.forEach(dateStr => {
        const selected = document.querySelector(`input[name="availability_${dateStr}"]:checked`);
        if (selected) {
            availability[dateStr] = selected.value;
        }
    });

    try {
        // 回答を送信
        await answerDB.create({
            eventId,
            userName,
            availability
        });

        // 回答一覧を更新
        const answers = await answerDB.getByEventId(eventId);
        displayAnswers(currentEvent, answers);

        // フォームをリセット
        e.target.reset();
        alert('回答を送信しました！');

    } catch (error) {
        console.error('Error submitting answer:', error);
        alert('回答の送信に失敗しました。');
    }
}); 