import { useState, useEffect } from 'react';
import { Download, ChevronLeft, ChevronRight, Share2 } from 'lucide-react';
import Head from 'next/head';

const MemeViewer = () => {
    const [memes, setMemes] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [touchStart, setTouchStart] = useState(null);
    const [isFullscreen, setIsFullscreen] = useState(false);

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
        fetchMeme();
        const intervalId = setInterval(fetchMeme, 5000);
        return () => clearInterval(intervalId);
    }, []);

    // Touch gestures for mobile swipe
    const handleTouchStart = e => {
        setTouchStart(e.touches[0].clientX);
    };

    const handleTouchEnd = e => {
        if (!touchStart) return;

        const touchEnd = e.changedTouches[0].clientX;
        const diff = touchStart - touchEnd;

        // Require a minimum swipe distance of 50px
        if (Math.abs(diff) > 50) {
            if (diff > 0 && currentIndex < memes.length - 1) {
                handleNext();
            } else if (diff < 0 && currentIndex > 0) {
                handlePrevious();
            }
        }
        setTouchStart(null);
    };

    const handleShare = async () => {
        const currentMeme = memes[currentIndex];
        if (!currentMeme) return;

        try {
            if (navigator.share) {
                await navigator.share({
                    title: currentMeme.name,
                    text: `Check out this meme from r/${currentMeme.subreddit}`,
                    url: currentMeme.image,
                });
            } else {
                await navigator.clipboard.writeText(currentMeme.image);
                alert('Link copied to clipboard!');
            }
        } catch (error) {
            console.error('Share failed:', error);
        }
    };

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

    const handleKeyPress = e => {
        if (e.key === 'ArrowLeft') handlePrevious();
        if (e.key === 'ArrowRight') handleNext();
    };

    useEffect(() => {
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, []);

    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
    };

    const currentMeme = memes[currentIndex];

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 p-2 sm:p-4">
            <Head>
                <title>Reddit Meme Viewer</title>
                <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <div className="max-w-2xl mx-auto">
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm sm:text-base">
                        {error}
                    </div>
                )}

                <div
                    className={`bg-white rounded-xl shadow-xl overflow-hidden ${
                        isFullscreen ? 'fixed inset-0 z-50' : ''
                    }`}
                >
                    {loading && !currentMeme ? (
                        <div className="h-48 sm:h-96 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-4 border-blue-500 border-t-transparent"></div>
                        </div>
                    ) : currentMeme ? (
                        <>
                            <h2 className="text-lg sm:text-xl font-semibold p-3 sm:p-4 bg-gray-50 border-b line-clamp-2">
                                {currentMeme.name}
                            </h2>

                            <div
                                className="relative bg-black"
                                onTouchStart={handleTouchStart}
                                onTouchEnd={handleTouchEnd}
                                onClick={toggleFullscreen}
                            >
                                <img
                                    src={currentMeme.image}
                                    alt={currentMeme.name}
                                    className={`w-full object-contain mx-auto ${
                                        isFullscreen ? 'h-screen' : 'max-h-[400px] sm:max-h-[600px]'
                                    }`}
                                    onError={e => {
                                        e.target.onerror = null;
                                        e.target.src = '/placeholder.png';
                                    }}
                                />

                                {/* Mobile swipe indicators */}
                                <div className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-black/10 to-transparent sm:hidden" />
                                <div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-black/10 to-transparent sm:hidden" />
                            </div>

                            <div className="p-3 sm:p-4 bg-gray-50 border-t">
                                <div className="flex items-center justify-between flex-wrap gap-2">
                                    <span className="text-sm sm:text-base text-gray-600">
                                        r/{currentMeme.subreddit}
                                    </span>
                                    <div className="flex gap-1 sm:gap-2">
                                        <button
                                            onClick={handlePrevious}
                                            disabled={currentIndex === 0}
                                            className="p-1.5 sm:p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 transition"
                                            aria-label="Previous meme"
                                        >
                                            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                                        </button>
                                        <button
                                            onClick={handleShare}
                                            className="p-1.5 sm:p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition"
                                            aria-label="Share meme"
                                        >
                                            <Share2 className="w-5 h-5 sm:w-6 sm:h-6" />
                                        </button>
                                        <button
                                            onClick={handleDownload}
                                            className="p-1.5 sm:p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition"
                                            aria-label="Download meme"
                                        >
                                            <Download className="w-5 h-5 sm:w-6 sm:h-6" />
                                        </button>
                                        <button
                                            onClick={handleNext}
                                            disabled={currentIndex === memes.length - 1}
                                            className="p-1.5 sm:p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 transition"
                                            aria-label="Next meme"
                                        >
                                            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
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
