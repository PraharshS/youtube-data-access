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
        return;
    } 
    res.send("API NOT WORKING")
})

app.get("/shorts", async (req,res) => {
    const recentShort = await getRecentShort();
    if(recentShort) {
        res.send(recentShort);
        return;
    }
    res.send("API NOT WORKING")
})

// Step 1: Fetch the Live Video ID from the Channel
async function getLiveVideoId() {
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${CHANNEL_ID}&eventType=live&type=video&key=${API_KEY}`;    
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

async function getRecentShort() {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&channelId=${CHANNEL_ID}&part=snippet&type=video&order=date&maxResults=5`
    );
    const data = await response.json();
  
    // Fetch details for each video to check duration
    for (const item of data.items) {
      const videoId = item.id.videoId;
      
      const videoDetails = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?key=${API_KEY}&id=${videoId}&part=contentDetails`
      );
      const videoData = await videoDetails.json();
      
      const duration = videoData.items[0].contentDetails.duration;
      
      // YouTube uses ISO 8601 format for duration; PT1M means 1 minute (i.e., 60 seconds or less is a Short)
      if (duration === "PT1M" || duration.includes("PT") && duration.replace(/\D/g, '') <= 60) {
        return `https://www.youtube.com/shorts/${videoId}`;
      }
    }
    
    return "No recent short video found.";
  }
  
// Step 2: Fetch the Like Count of the Live Video
async function getLiveVideoLikes(videoId) {
    const statsUrl = `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${videoId}&key=${API_KEY}`;
    
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