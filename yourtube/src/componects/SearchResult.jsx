import { Avatar, AvatarImage, AvatarFallback } from '@radix-ui/react-avatar';
import { formatDistanceToNow } from 'date-fns';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../lib/axiosInstance';

const SearchResult = ({ query }) => {
    const [videos, setVideos] = useState([]);
    const [filteredVideos, setFilteredVideos] = useState([]);
    const [durations, setDurations] = useState({}); // store durations per video
    const [loading, setLoading] = useState(false);

    const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

    // 🧠 Fetch + filter videos
    useEffect(() => {
        if (!query.trim()) {
            setFilteredVideos([]);
            return;
        }

        const fetchVideos = async () => {
            setLoading(true);
            try {
                const response = await axiosInstance.get("/video/getall");
                const allVideos = response.data || [];

                const results = allVideos.filter(
                    (vid) =>
                        vid.videotitle.toLowerCase().includes(query.toLowerCase()) ||
                        vid.videochanel.toLowerCase().includes(query.toLowerCase())
                );

                setVideos(allVideos);
                setFilteredVideos(results);
            } catch (error) {
                console.error("Error fetching videos:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchVideos();
    }, [query]);

    // ⏱️ Format seconds to mm:ss
    const formatDuration = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    };

    // ⏳ Handle duration once video metadata loads
    const handleLoadedMetadata = (videoId, e) => {
        const duration = e.target.duration;
        setDurations((prev) => ({
            ...prev,
            [videoId]: formatDuration(duration),
        }));
    };

    // 🟡 UI States
    if (!query.trim()) {
        return (
            <div className="text-center py-12 text-gray-600">
                Enter a search term to find videos.
            </div>
        );
    }

    if (loading) {
        return (
            <div className="text-center py-12 text-gray-600">
                Searching for “{query}”...
            </div>
        );
    }

    if (filteredVideos.length === 0) {
        return (
            <div className="text-center py-12">
                <h2 className="text-xl font-semibold mb-2">No results found</h2>
                <p className="text-gray-600">
                    Try different keywords or remove search filters.
                </p>
            </div>
        );
    }

    // 🎥 Render results
    return (
        <div>
            {filteredVideos.map((video) => (
                <div key={video._id} className="p-4 flex gap-4 group">
                    <Link to={`/watch/${video._id}`} className="flex-shrink-0">
                        <div className="relative w-80 aspect-video bg-gray-100 rounded-lg overflow-hidden">
                            <video
                                src={video?.URL}
                                onLoadedMetadata={(e) => handleLoadedMetadata(video._id, e)}
                                className="object-cover group-hover:scale-105 transition-transform duration-200"
                            />
                            {durations[video._id] && (
                                <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1 rounded">
                                    {durations[video._id]}
                                </div>
                            )}
                        </div>
                    </Link>

                    <div className="flex-1 min-w-0 py-1">
                        <Link to={`/watch/${video._id}`}>
                            <h3 className="font-medium text-lg line-clamp-2 group-hover:text-blue-600 mb-2">
                                {video.videotitle}
                            </h3>
                        </Link>

                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                            <span>{video.Views?.toLocaleString() || 0} views</span>
                            <span>•</span>
                            <span>{formatDistanceToNow(new Date(video.createdAt))} ago</span>
                        </div>

                        <Link
                            to={`/channel/${video.uploader}`}
                            className="flex items-center gap-2 mb-2 hover:text-blue-600"
                        >
                            <Avatar className="w-6 h-6">
                                <AvatarImage src="/placeholder.svg?height=24&width=24" />
                                <AvatarFallback className="text-xs">
                                    {video.videochanel?.[0] || "?"}
                                </AvatarFallback>
                            </Avatar>
                            <span className="text-sm text-gray-600">
                                {video.videochanel}
                            </span>
                        </Link>

                        <p className="text-sm text-gray-700 line-clamp-2">
                            Sample video description that would show search-relevant
                            content and help users understand what the video is about
                            before clicking.
                        </p>
                    </div>
                </div>
            ))}

            <div className="text-center py-8">
                <p className="text-gray-600">
                    Showing {filteredVideos.length} results for “{query}”
                </p>
            </div>
        </div>
    );
};

export default SearchResult;
