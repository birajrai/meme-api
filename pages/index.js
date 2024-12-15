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
            const response = await axios.get('/api/memes', {
                timeout: 10000, // 10 second timeout
            });

            if (response.data.error) {
                throw new Error(response.data.error);
            }

            setMeme(response.data);
        } catch (error) {
            console.error('Fetch Error:', error);
            setError(
                error.response?.data?.details || error.response?.data?.error || error.message || 'Failed to fetch meme'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
            <Head>
                <title>Meme Fetcher</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <div className="text-center max-w-md w-full">
                <h1 className="text-3xl font-bold mb-6 text-gray-800">Meme Fetcher</h1>

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
                        <h2 className="text-xl font-semibold p-4 bg-gray-100 break-words">{meme.name}</h2>

                        {meme.image && (
                            <img
                                src={meme.image}
                                alt={meme.name}
                                className="w-full max-h-[500px] object-contain"
                                onError={e => {
                                    e.target.onerror = null;
                                    e.target.src = '/placeholder.png';
                                }}
                            />
                        )}

                        <div className="p-4 text-gray-600">Source: {meme.subreddit}</div>
                    </div>
                )}
            </div>
        </div>
    );
}
