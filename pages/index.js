import { useState } from 'react';
import axios from 'axios';
import Head from 'next/head';

export default function Home() {
    const [meme, setMeme] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchMeme = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get('/api/memes');
            setMeme(response.data);
        } catch (error) {
            console.error('Error:', error);
            setError('Failed to fetch meme. Try again.');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
            <Head>
                <title>Reddit Meme Fetcher</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <div className="text-center max-w-md w-full">
                <h1 className="text-3xl font-bold mb-6 text-gray-800">Reddit Meme Fetcher</h1>

                <button
                    onClick={fetchMeme}
                    disabled={loading}
                    className="bg-blue-500 text-white px-6 py-3 rounded-lg 
          hover:bg-blue-600 transition duration-300 
          disabled:opacity-50 mb-6"
                >
                    {loading ? 'Fetching Meme...' : 'Get Random Meme'}
                </button>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                        {error}
                    </div>
                )}

                {meme && (
                    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                        <h2 className="text-xl font-semibold p-4 bg-gray-100">{meme.name}</h2>

                        {meme.image && (
                            <img src={meme.image} alt={meme.name} className="w-full max-h-[500px] object-contain" />
                        )}

                        <div className="p-4 text-gray-600">From r/{meme.subreddit}</div>
                    </div>
                )}
            </div>
        </div>
    );
}
