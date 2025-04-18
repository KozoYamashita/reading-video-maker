const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const generateVideo = require('./generateVideo');

const app = express();
const port = process.env.PORT || 10000;

// アップロード先ディレクトリの設定
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// multer設定（ファイルの保存先とファイル名）
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext);
    const uniqueName = `${base}_${Date.now()}${ext}`;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

// 動作確認ルート（GET）
app.get('/', (req, res) => {
  res.send('Reading Video Maker API is running!');
});

// 🎥 動画生成ルート（POST）
app.post('/generate-video', upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'audio', maxCount: 1 }
]), (req, res) => {
  const imageFile = req.files['image']?.[0];
  const audioFile = req.files['audio']?.[0];

  if (!imageFile || !audioFile) {
    return res.status(400).send('画像ファイルと音声ファイルを両方送信してください');
  }

  generateVideo(imageFile.path, audioFile.path, (err, outputPath) => {
    if (err) {
      return res.status(500).send('動画生成に失敗しました');
    }

    res.download(outputPath, err => {
      if (err) {
        console.error('ダウンロード失敗:', err);
        res.status(500).send('動画の送信に失敗しました');
      } else {
        console.log('動画送信完了:', outputPath);
      }
    });
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
