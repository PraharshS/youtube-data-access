const app = require("express")();
const axios = require("axios")
require('dotenv').config();;
const PORT = 8080;
const API_KEY = process.env.API_KEY;
const CHANNEL_ID = process.env.CHANNEL_ID;

app.get("/likes", async (req,res) => {
    const liveVideoId = await getLiveVideoId(CHANNEL_ID, API_KEY);

    if (liveVideoId) {
        // Fetch Like Count
        const likeCount = await getLiveVideoLikes(liveVideoId, API_KEY);
        console.log(`Current live stream like count: ${likeCount}`);
        res.send(likeCount);
    } 
    res.send("API NOT WORKING")
})

// Step 1: Fetch the Live Video ID from the Channel
async function getLiveVideoId(channelId, apiKey) {
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&eventType=live&type=video&key=${apiKey}`;    
    try {
        const response = await axios.get(searchUrl);
        const items = response.data.items;
        
        if (items && items.length > 0) {
            return items[0].id.videoId;
        } else {
            console.log('No live video currently streaming on the channel.');
            return null;
        }
    } catch (error) {
        console.error('Error fetching live video ID:', error);
        return null;
    }
}
// Step 2: Fetch the Like Count of the Live Video
async function getLiveVideoLikes(videoId, apiKey) {
    const statsUrl = `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${videoId}&key=${apiKey}`;
    
    try {
        const response = await axios.get(statsUrl);
        const items = response.data.items;
        
        if (items && items.length > 0) {
            const likeCount = items[0].statistics.likeCount || '0';
            return likeCount;
        } else {
            console.log('No statistics available for the live video.');
            return '0';
        }
    } catch (error) {
        console.error('Error fetching video statistics:', error);
        return '0';
    }
}
app.listen(PORT, console.log("APP RUNNING ON PORT:", PORT))