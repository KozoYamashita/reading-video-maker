const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static"); // ✅ staticパス取得

const app = express();
const port = process.env.PORT || 10000;

app.use(cors());

const upload = multer({ dest: "uploads/" });

app.post("/generate-video", upload.fields([
  { name: "image", maxCount: 1 },
  { name: "audio", maxCount: 1 }
]), async (req, res) => {
  try {
    const imagePath = req.files.image[0].path;
    const audioPath = req.files.audio[0].path;

    // ✅ 出力ディレクトリがなければ作成
    const outputDir = path.join(__dirname, "outputs");
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }

    const outputPath = path.join(outputDir, `output_${Date.now()}.mp4`);

    ffmpeg.setFfmpegPath(ffmpegPath); // ✅ staticなffmpegに切り替え

    ffmpeg()
      .addInput(imagePath)
      .loop(5) // 画像5秒表示
      .addInput(audioPath)
      .outputOptions([
        "-c:v libx264",
        "-c:a aac",
        "-strict experimental",
        "-shortest",
      ])
      .on("end", () => {
        res.sendFile(outputPath);
      })
      .on("error", (err) => {
        console.error("FFmpeg error:", err);
        res.status(500).send("動画生成に失敗しました。");
      })
      .save(outputPath);
  } catch (err) {
    console.error("Unexpected error:", err);
    res.status(500).send("内部エラー");
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
