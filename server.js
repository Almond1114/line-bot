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

// ここに画像URLを直接埋め込み
const IMAGE_URL = "https://i.imgur.com/eCkndVy.png";

const WELCOME_TEXT = `2年3組のみんなへ

新しくグループラインを作りました。
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

app.get('/', (_req, res) => {
  res.send('2-3 Hub bot is running!');
});

app.post('/webhook', line.middleware(config), async (req, res) => {
  try {
    const events = req.body.events || [];

    await Promise.all(events.map(async (event) => {
      if (event.type === 'memberJoined') {
        await client.replyMessage({
          replyToken: event.replyToken,
          messages: [
            {
              type: 'image',
              originalContentUrl: IMAGE_URL,
              previewImageUrl: IMAGE_URL,
            },
            {
              type: 'text',
              text: WELCOME_TEXT,
            }
          ]
        });
      }
    }));

    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});