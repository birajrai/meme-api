import { useState, useEffect } from 'react';
import { Download, ChevronLeft, ChevronRight } from 'lucide-react';
import Head from 'next/head';

const MemeViewer = () => {
    const [memes, setMemes] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
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

            setMemes(prevMemes => {
                // Avoid duplicates
                if (!prevMemes.some(meme => meme.id === data.id)) {
                    return [...prevMemes, data];
                }
                return prevMemes;
            });
        } catch (error) {
            console.error('Fetch Error:', error);
            setError(error.message || 'Unknown error');
        }
        setLoading(false);
    };

    useEffect(() => {
        // Initial fetch
        fetchMeme();

        // Set up auto-refresh
        const intervalId = setInterval(fetchMeme, 5000);

        return () => clearInterval(intervalId);
    }, []);

    const handleDownload = async () => {
        if (!memes[currentIndex]?.image) return;

        try {
            const response = await fetch(memes[currentIndex].image);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `meme-${memes[currentIndex].id}.jpg`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Download error:', error);
            setError('Failed to download image');
        }
    };

    const handlePrevious = () => {
        setCurrentIndex(prev => (prev > 0 ? prev - 1 : prev));
    };

    const handleNext = () => {
        setCurrentIndex(prev => (prev < memes.length - 1 ? prev + 1 : prev));
    };

    const currentMeme = memes[currentIndex];

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 p-4">
            <Head>
                <title>Reddit Meme Viewer</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <div className="max-w-2xl mx-auto">
                <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">Reddit Meme Viewer</h1>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
                        {error}
                    </div>
                )}

                <div className="bg-white rounded-xl shadow-xl overflow-hidden">
                    {loading && !currentMeme ? (
                        <div className="h-96 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                        </div>
                    ) : currentMeme ? (
                        <>
                            <h2 className="text-xl font-semibold p-4 bg-gray-50 border-b">{currentMeme.name}</h2>

                            <div className="relative">
                                <img
                                    src={currentMeme.image}
                                    alt={currentMeme.name}
                                    className="w-full max-h-[600px] object-contain bg-black"
                                    onError={e => {
                                        e.target.onerror = null;
                                        e.target.src = '/placeholder.png';
                                    }}
                                />
                            </div>

                            <div className="p-4 bg-gray-50 border-t">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">r/{currentMeme.subreddit}</span>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handlePrevious}
                                            disabled={currentIndex === 0}
                                            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 transition"
                                            aria-label="Previous meme"
                                        >
                                            <ChevronLeft className="w-6 h-6" />
                                        </button>
                                        <button
                                            onClick={handleDownload}
                                            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition"
                                            aria-label="Download meme"
                                        >
                                            <Download className="w-6 h-6" />
                                        </button>
                                        <button
                                            onClick={handleNext}
                                            disabled={currentIndex === memes.length - 1}
                                            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 transition"
                                            aria-label="Next meme"
                                        >
                                            <ChevronRight className="w-6 h-6" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : null}
                </div>
            </div>
        </div>
    );
};

export default MemeViewer;
