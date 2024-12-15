import axios from 'axios';

export default async function handler(req, res) {
    try {
        const subreddits = ['memes', 'dankmemes', 'funny'];

        const randomSubreddit = subreddits[Math.floor(Math.random() * subreddits.length)];

        // Use Reddit's JSON API with more robust fetching
        const response = await axios.get(`https://www.reddit.com/r/${randomSubreddit}/top.json?limit=50`, {
            headers: {
                'User-Agent': 'MemeApp/1.0',
            },
        });

        const posts = response.data.data.children;

        // Filter for image posts
        const imagePosts = posts.filter(
            post =>
                post.data.url &&
                (post.data.url.endsWith('.jpg') ||
                    post.data.url.endsWith('.png') ||
                    post.data.url.includes('i.redd.it'))
        );

        if (imagePosts.length === 0) {
            return res.status(404).json({ error: 'No memes found' });
        }

        // Select a random image post
        const randomPost = imagePosts[Math.floor(Math.random() * imagePosts.length)];

        const memeData = {
            name: randomPost.data.title,
            image: randomPost.data.url,
            subreddit: randomPost.data.subreddit,
        };

        res.status(200).json(memeData);
    } catch (error) {
        console.error('Detailed Error:', error.response ? error.response.data : error.message);
        res.status(500).json({
            error: 'Failed to fetch meme',
            details: error.message,
        });
    }
}
