import axios from 'axios';

export default async function handler(req, res) {
    try {
        const subreddits = ['memes', 'dankmemes', 'funny'];

        const randomSubreddit = subreddits[Math.floor(Math.random() * subreddits.length)];

        const response = await axios.get(`https://www.reddit.com/r/${randomSubreddit}/random.json`, {
            headers: {
                'User-Agent': 'MemeApp/1.0',
            },
        });

        const posts = response.data[0]?.data?.children;

        if (!posts || posts.length === 0) {
            return res.status(404).json({ error: 'No memes found' });
        }

        const memePost = posts[0].data;

        const memeData = {
            name: memePost.title,
            image: memePost.url_overridden_by_dest || memePost.url,
            subreddit: memePost.subreddit,
        };

        res.status(200).json(memeData);
    } catch (error) {
        console.error('Error fetching meme:', error);
        res.status(500).json({ error: 'Failed to fetch meme' });
    }
}
