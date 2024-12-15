import { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import Head from 'next/head';

const MemeViewer = () => {
    const [meme, setMeme] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchMeme = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/memes');
            const data = await response.json();

            if (data.error) {
                throw new Error(data.error);
            }

            setMeme(data);
        } catch (error) {
            console.error('Fetch Error:', error);
            setError(error.message || 'Unknown error');
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchMeme();
        const intervalId = setInterval(fetchMeme, 10000);
        return () => clearInterval(intervalId);
    }, []);

    const handleDownload = async () => {
        if (!meme?.image) return;

        try {
            const response = await fetch(meme.image);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `meme-${meme.id}.jpg`;
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Download error:', error);
            setError('Failed to download image');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-pink-50 p-4 flex items-center justify-center">
            <Head>
                <title>Meme API - Get Random Memes every 10seconds</title>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <div className="w-full max-w-md">
                {error && (
                    <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl mb-4 text-sm shadow-sm">
                        {error}
                    </div>
                )}

                <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 backdrop-blur-sm bg-white/80">
                    {loading && !meme ? (
                        <div className="h-64 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent"></div>
                        </div>
                    ) : meme ? (
                        <>
                            <div className="relative">
                                <img
                                    src={meme.image}
                                    alt={meme.name}
                                    className="w-full h-64 object-contain bg-gray-50"
                                    onError={e => {
                                        e.target.onerror = null;
                                        e.target.src = '/placeholder.png';
                                    }}
                                />
                                <button
                                    onClick={handleDownload}
                                    className="absolute bottom-3 right-3 p-2 rounded-full bg-black/75 hover:bg-black/90 text-white transition-all duration-300 shadow-lg backdrop-blur-sm"
                                    aria-label="Download meme"
                                >
                                    <Download className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="px-4 py-3 bg-gradient-to-b from-gray-50 to-white border-t border-gray-100">
                                <div className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">{meme.name}</div>
                                <div className="text-xs text-gray-500">r/{meme.subreddit}</div>
                            </div>
                        </>
                    ) : null}
                </div>
            </div>
        </div>
    );
};

export default MemeViewer;
