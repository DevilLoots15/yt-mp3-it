import ytdl from "ytdl-core";

export default async function handler(req, res) {
  const { key, link } = req.query;

  // ✅ Verify key
  const VALID_KEY = "HM93D8P03N";
  if (key !== VALID_KEY) {
    return res.status(403).json({
      status: false,
      error: "Invalid API key",
      buildBy: "@ITACHIxHUNTER15"
    });
  }

  // ✅ Validate link
  if (!link || !ytdl.validateURL(link)) {
    return res.status(400).json({
      status: false,
      error: "Invalid or missing YouTube link",
      buildBy: "@ITACHIxHUNTER15"
    });
  }

  try {
    const info = await ytdl.getInfo(link);
    const videoId = info.videoDetails.videoId;
    const title = info.videoDetails.title;
    const duration = info.videoDetails.lengthSeconds;
    const thumbnail = info.videoDetails.thumbnails.pop().url;

    const download_url = `https://ssyoutube.com/watch?v=${videoId}`; // safe external downloader

    return res.status(200).json({
      status: true,
      title,
      duration,
      thumbnail,
      download_url,
      buildBy: "@ITACHIxHUNTER15"
    });
  } catch (err) {
    return res.status(500).json({
      status: false,
      error: "Failed to fetch video info",
      details: err.message,
      buildBy: "@ITACHIxHUNTER15"
    });
  }
}      .toFormat("mp3")
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
