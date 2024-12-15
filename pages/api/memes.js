import axios from 'axios';

const MEME_APIS = [
    // Multiple fallback APIs
    async () => {
        try {
            const response = await axios.get('https://meme-api.com/gimme');
            return {
                name: response.data.title,
                image: response.data.url,
                subreddit: response.data.subreddit,
            };
        } catch (error) {
            console.error('Meme API Error:', error);
            return null;
        }
    },
    async () => {
        try {
            const response = await axios.get('https://api.imgflip.com/get_memes');
            const memes = response.data.data.memes;
            const randomMeme = memes[Math.floor(Math.random() * memes.length)];
            return {
                name: randomMeme.name,
                image: randomMeme.url,
                subreddit: 'imgflip',
            };
        } catch (error) {
            console.error('Imgflip API Error:', error);
            return null;
        }
    },
    async () => {
        try {
            const response = await axios.get('https://random-d.uk/api/random');
            return {
                name: 'Random Meme',
                image: response.data.url,
                subreddit: 'random',
            };
        } catch (error) {
            console.error('Random API Error:', error);
            return null;
        }
    },
];

export default async function handler(req, res) {
    for (const fetchMeme of MEME_APIS) {
        try {
            const meme = await fetchMeme();
            if (meme && meme.image) {
                return res.status(200).json(meme);
            }
        } catch (error) {
            console.error('Meme Fetch Error:', error);
        }
    }

    // If all APIs fail
    res.status(500).json({
        error: 'Failed to fetch meme',
        details: 'All meme APIs are currently unavailable',
    });
}
