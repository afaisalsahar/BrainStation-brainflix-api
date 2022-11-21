// load environment variables
require('dotenv').config();
const { PORT, API_URL } = process.env;

// load unique ID generator 
const { v4: uuid } = require('uuid');

// load api dependencies
const express = require('express'); // express server
const router = express.Router(); // express router
const fs = require('fs'); // file system

// read JSON dataset from file - parse - return JS object
const getVideos = () => {
    const videosDB = (
        fs.readFileSync('./data/videos.json')
    );
    return JSON.parse(videosDB);
}

const getVideo = id => {
    return getVideos().find(
        video => video.id === id
    );
}

// modular router to handle videos GET/POST req
router
    .route('/') // handle GET request to /videos
    .get((_req, res) => {

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
    .post((_req, res) => { // handle POST request to /videos
        const videos = getVideos();
        // create a new video object - hardcode required fields
        const newVideo = {
            id: uuid(), // generate unique ID
            title: _req.body.title, // get video title from upload form
            channel: 'Always Blue',
            image: '/images/image9.jpeg',
            description: _req.body.description, // get video description from upload form
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

        return res.status(201).json(newVideo); // 201 HTTP created
    })

// modular router to handle featured video GET req
router
    .route('/:id') // handle GET req with ID param
    .get((_req, res) => {
        const id = _req.params.id; // store ID param from URL path

        // search videos dataset to find one that mathces the ID param
        const featuredVideo = getVideo(id);

        if (featuredVideo) {
            featuredVideo.image = `${API_URL}:${PORT}${featuredVideo.image}`;
            return res.status(200).json(featuredVideo); // 200 HTTP OK
        }

        // if the ID does not match any video - send HTTP 404 with error message
        return res.status(404).json({
            error: 'Video not found, invalid ID'
        }
        );
    })

// modular router to handle comment POST req
router
    .route('/:id/comments') // handle req with video ID
    .post((_req, res) => {
        const id = _req.params.id; // store ID param from URL path
        // create a new comment object - hardcode required fields
        const newComment = {
            id: uuid(),
            name: _req.body.name,
            comment: _req.body.comment,
            likes: 0,
            timestamp: Date.now()
        }
        
        // read videos file - filter featured video - manipulate comments array
        const videos = getVideos().map(video => {
            if (video.id === id) video.comments.unshift(newComment); // add new trailing comment
            return video;
        });

        // convert videos dataset into a string and write it to the file  
        fs.writeFileSync(
            './data/videos.json',
            JSON.stringify(videos)
        )

        return res.status(201).json(
            // return featured video comments
            getVideo(id).comments
        ); // 201 HTTP created
    });

// modular router to handle comment DELETE req
router
    .route('/:videoId/comments/:commentId') // handle req with video ID and comment ID
    .delete((_req, res) => {
        const videoId = _req.params.videoId; // store video ID param from URL path
        const commentId = _req.params.commentId; // store comment ID param from URL path

        // read videos file - filter featured video - filter comments - exclude comment that matches the ID
        const videos = getVideos().map(video => {
            if (video.id === videoId) {
                video.comments = video.comments.filter(comment => {
                    return comment.id !== commentId;
                });
            };
            return video;
        });

        // convert videos dataset into a string and write it to the file  
        fs.writeFileSync(
            './data/videos.json',
            JSON.stringify(videos)
        )

        return res.status(200).json(
            // return featured video comments
            getVideo(videoId).comments
        ); // 200 HTTP OK
    })

module.exports = router;
