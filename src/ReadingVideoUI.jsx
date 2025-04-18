import React, { useState, useEffect } from "react";

const ffmpeg = {
  instance: null,
  ready: false,
};

export default function ReadingVideoUI() {
  const [images, setImages] = useState([]);
  const [audio, setAudio] = useState(null);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        if (!window.createFFmpeg) {
          alert("window.createFFmpeg が見つかりません");
          return;
        }

        ffmpeg.instance = window.createFFmpeg({
          log: true,
          corePath: "https://unpkg.com/@ffmpeg/core@0.10.0/dist/ffmpeg-core.js",
        });

        await ffmpeg.instance.load();
        ffmpeg.ready = true;
        setReady(true);
      } catch (e) {
        alert("FFmpegの読み込みに失敗しました");
        console.error(e);
      }
    };
    load();
  }, []);

  const generateVideo = async () => {
    if (!images.length || !audio) {
      alert("画像と音声を選んでや！");
      return;
    }

    setLoading(true);

    try {
      const imgName = "input.png";
      const audioName = "input.mp3";
      const outputName = "output.mp4";

      await ffmpeg.instance.FS("writeFile", imgName, await fetch(images[0]).then(res => res.arrayBuffer()));
      await ffmpeg.instance.FS("writeFile", audioName, await fetch(audio).then(res => res.arrayBuffer()));

      await ffmpeg.instance.run(
        "-loop", "1",
        "-i", imgName,
        "-i", audioName,
        "-c:v", "libx264",
        "-tune", "stillimage",
        "-c:a", "aac",
        "-b:a", "192k",
        "-pix_fmt", "yuv420p",
        "-shortest",
        outputName
      );

      const data = ffmpeg.instance.FS("readFile", outputName);
      const videoBlob = new Blob([data.buffer], { type: "video/mp4" });
      const url = URL.createObjectURL(videoBlob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "reading-video.mp4";
      a.click();
    } catch (err) {
      console.error("動画生成エラー:", err);
      alert("動画生成に失敗したで💥");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Reading Video Maker</h1>

      {ready ? (
        <>
          <p>FFmpeg is ready ✅</p>

          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImages([e.target.files[0]])}
          />
          <input
            type="file"
            accept="audio/*"
            onChange={(e) => setAudio(e.target.files[0])}
          />
          <button onClick={generateVideo} disabled={loading}>
            {loading ? "Generating..." : "Generate Video"}
          </button>
        </>
      ) : (
        <p>Loading FFmpeg...</p>
      )}
    </div>
  );
}
