const express = require('express');
const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const port = process.env.PORT || 3000;

app.get('/download', async (req, res) => {
    const videoUrl = req.query.url;

    if (!videoUrl || !ytdl.validateURL(videoUrl)) {
        return res.status(400).send('Invalid URL');
    }

    const videoId = ytdl.getURLVideoID(videoUrl);
    const outputFileName = `${uuidv4()}.mp3`;
    const outputPath = path.resolve(__dirname, 'downloads', outputFileName);

    if (!fs.existsSync('downloads')) {
        fs.mkdirSync('downloads');
    }

    try {
        const stream = ytdl(videoUrl, { quality: 'highestaudio' });

        ffmpeg(stream)
            .audioBitrate(128)
            .save(outputPath)
            .on('end', () => {
                res.json({ url: `${req.protocol}://${req.get('host')}/files/${outputFileName}` });
            })
            .on('error', (error) => {
                console.error(error);
                res.status(500).send('Error processing audio');
            });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal server error');
    }
});

app.use('/files', express.static(path.join(__dirname, 'downloads')));

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
