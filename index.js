import express from "express";
import ytdl from "ytdl-core";
import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import fs from "fs";
import path from "path";

const app = express();
ffmpeg.setFfmpegPath(ffmpegPath);

// ✅ Allowed API keys
const VALID_KEYS = ["HM93D8P03N", "DLIT154920"];

app.get("/api", async (req, res) => {
  const { key, link } = req.query;

  // ✅ Validate inputs
  if (!key || !link)
    return res.json({ status: false, error: "Missing key or link" });

  if (!VALID_KEYS.includes(key))
    return res.json({ status: false, error: "Invalid API key" });

  if (!ytdl.validateURL(link))
    return res.json({ status: false, error: "Invalid YouTube link" });

  try {
    const info = await ytdl.getInfo(link);
    const title = info.videoDetails.title.replace(/[^\w\s]/gi, "");
    const videoId = info.videoDetails.videoId;
    const outputPath = path.resolve(`./public/${videoId}.mp3`);

    // ✅ Convert to MP3
    const stream = ytdl(link, { quality: "highestaudio" });
    ffmpeg(stream)
      .audioBitrate(128)
      .toFormat("mp3")
      .save(outputPath)
      .on("end", () => {
        res.json({
          status: true,
          title,
          duration: info.videoDetails.lengthSeconds,
          thumbnail: info.videoDetails.thumbnails.pop().url,
          download_url: `https://yt-mp3-it.vercel.app/audio/${videoId}.mp3`,
        });
      })
      .on("error", (err) => {
        res.json({ status: false, error: "Conversion failed", details: err.message });
      });
  } catch (e) {
    res.json({ status: false, error: e.message });
  }
});

// ✅ Serve generated files
app.use("/audio", express.static("public"));

// ✅ Export for Vercel
export default app;
