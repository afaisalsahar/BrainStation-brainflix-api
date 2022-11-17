// load environment variables
require('dotenv').config();
const {PORT, API_URL} = process.env;

// load api dependencies
const express = require('express'); // express server
const router = express.Router(); // express router
const fs = require('fs'); // file system

// read JSON dataset from file - parse - return JS object
function getVideos() {
    const videosDB = (
        fs.readFileSync('./data/videos.json')
    );
    return JSON.parse(videosDB);
}

// express modular router to keep the api organized
router
    .route('/') // handle GET request to /videos
    .get((req, res) => {    

        // create a filtered version of dataset to render list of videos
        const videos = getVideos().map(video => {
            return {
                id: video.id,
                title: video.title,
                channel: video.channel,
                image: `${API_URL}:${PORT}${video.image}`
            }
        })

        return res.status(200).json(videos);
    })

module.exports = router;
