require('dotenv').config();

const express = require('express');
const line = require('@line/bot-sdk');

const app = express();

const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
};

const client = new line.messagingApi.MessagingApiClient({
  channelAccessToken: config.channelAccessToken,
});

const PORT = process.env.PORT || 3000;
const IMAGE_URL = 'https://i.imgur.com/eCkndVy.png';

// 「2年3組のみんなへ」は削除済み
const WELCOME_TEXT = `新しくグループラインを作りました。
ここでは主に
・教科の連絡
・持ち物の確認
とかに使っていきたいと思います！

もちろん、ちょっとした雑談で盛り上がるのもOKです👍
楽しく使っていきましょう！

あと、このグループは
抜けるのは自由です。
そしてまだ入ってない人がいたらぜひ積極的に追加してほしいです！

みんなで便利に使えるように協力お願いします。
楽しくやっていきましょう！
よろしくお願いします！`;

const HELP_TEXT = `使えるコマンド
/help 使い方を見る
/rule ルールをもう一度見る
/welcome 案内をもう一度送る`;

app.get('/', (_req, res) => {
  res.status(200).send('2-3 Hub bot is running!');
});

app.post('/webhook', line.middleware(config), async (req, res) => {
  try {
    const events = req.body.events || [];
    await Promise.all(events.map(handleEvent));
    res.sendStatus(200);
  } catch (error) {
    console.error('Webhook error:', error);
    res.sendStatus(500);
  }
});

async function handleEvent(event) {
  if (!event) return;

  if (event.type === 'memberJoined') {
    const userId = event.joined.members[0].userId;
    await replyWelcome(event.replyToken, userId);
    return;
  }

  if (event.type === 'join') {
    await replyText(
      event.replyToken,
      'こんにちは、2-3 Hubです。新しく参加した人が入ると、案内を自動で送ります。/rule で案内をもう一度表示できます。'
    );
    return;
  }

  if (event.type === 'message' && event.message.type === 'text') {
    const text = event.message.text.trim();

    if (text === '/help') {
      await replyText(event.replyToken, HELP_TEXT);
      return;
    }

    if (text === '/rule' || text === '/welcome') {
      await replyWelcome(event.replyToken);
      return;
    }
  }
}

async function replyWelcome(replyToken, userId) {
  if (!replyToken) return;

  let userName = '新しいメンバー';

  try {
    if (userId) {
      const profile = await client.getProfile(userId);
      userName = profile.displayName;
    }
  } catch (e) {
    console.log('名前取得失敗:', e.message);
  }

  const text = `${userName}さん、ようこそ！

${WELCOME_TEXT}`;

  await client.replyMessage({
    replyToken,
    messages: [
      {
        type: 'image',
        originalContentUrl: IMAGE_URL,
        previewImageUrl: IMAGE_URL,
      },
      {
        type: 'text',
        text: text,
      },
    ],
  });
}

async function replyText(replyToken, text) {
  if (!replyToken) return;

  await client.replyMessage({
    replyToken,
    messages: [
      {
        type: 'text',
        text,
      },
    ],
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});