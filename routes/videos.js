// load environment variables
require('dotenv').config();
const {PORT, API_URL} = process.env;

// load unique ID generator 
const {v4: uuid} = require('uuid');

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

// modular router to handle videos GET/POST req
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

        res.status(200).json(videos); // 200 HTTP OK
    })
    .post((req, res) => { // handle POST request to /videos
        const videos = getVideos();
        // create a new video object - hardcode required fields
        const newVideo = { 
            id: uuid(), // generate unique ID
            title: req.body.title, // get video title from upload form
            channel: 'Always Blue',
            image: '/images/image9.jpeg',
            description: req.body.description, // get video description from upload form
            views: '0',
            likes: '0',
            duration: '3:22',
            video: 'https://project-2-api.herokuapp.com/stream',
            timestamp: Date.now(), // generate timestamp 
            comments: []
        }

        videos.push(newVideo);

        // convert videos dataset into a string and write it to the file  
        fs.writeFileSync(
            './data/videos.json',
            JSON.stringify(videos)
        )
        
        res.status(201).json(newVideo); // 201 HTTP created
    })

// modular router to handle featured video GET req
router
    .route('/:id') // handle GET req with ID param
    .get((req, res) => {
        const id = req.params.id; // store ID param from URL path

        // search videos dataset to find one that mathces the ID param
        const featuredVideo = getVideos().find(
            video => video.id === id
        )
        
        // if the ID does not match any video - send HTTP 404 with error message
        if (!featuredVideo) {
            return res.send(404, {
                error: 'Video not found, invalid ID'
            });
        }

        res.status(200).json(featuredVideo); // 200 HTTP OK
})


module.exports = router;
