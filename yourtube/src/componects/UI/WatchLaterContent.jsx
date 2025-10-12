import { formatDistanceToNow } from 'date-fns';
import { Clock, MoreVertical, Play, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './dropdown-menu';
import { Button } from './Button2';
import { useUser } from '../../lib/AuthContext.jsx'
import axiosInstance from '../../lib/axiosInstance.js';

const WatchLaterContent = () => {
    const { user } = useUser();

    const loadWatchLater = async () => {
        if (!user) return;

        try {
            const watchLaterData = await axiosInstance.get(`/watch-later/all/${user?._id}`);
            setWatchLater(watchLaterData.data);
        } catch (error) {
            console.error(error);
        }
    }

    // ✅ Use effect to load data once
    useEffect(() => {
        loadWatchLater();
        setLoading(false);
    }, [user]);

    const [WatchLater, setWatchLater] = useState([]);
    const [loading, setLoading] = useState(true);

    const handleRemoveFromWatchLater = (WatchLaterId) => {
        try {
            console.log('Removing from WatchLater:', WatchLaterId);
            setWatchLater((prev) => prev.filter((item) => item._id !== WatchLaterId));
        } catch (error) {
            console.error('Error removing from WatchLater:', error);
        }
    };

    // 🧠 Conditional UI
    if (!user) {
        return (
            <div className="text-center mt-10">
                <Clock className="w-6 h-6 mx-auto" />
                <h2 className="text-lg font-semibold mt-2">Keep track of what your watch Later Videos.</h2>
                <p className="text-gray-500">Watch Later Videos isn't viewable when signed out.</p>
            </div>
        );
    }

    if (loading) {
        return <div className="text-center mt-10">Loading...</div>;
    }

    if (WatchLater.length === 0) {
        return (
            <div className="text-center mt-10">
                <Clock className="w-6 h-6 mx-auto" />
                <h2 className="text-lg font-semibold mt-2">No watch Watch Later Videos yet</h2>
                <p className="text-gray-500">Videos you put in watch Latter will appear here.</p>
            </div>
        );
    }

    // const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

    return (
        <div className="p-4 space-y-4">
            <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">{WatchLater.length} videos</p>
                <Button className="flex items-center gap-2">
                    <Play className="w-4 h-4" />
                    Play all
                </Button>
            </div>

            <div className="grid gap-4">
                {WatchLater.map((item) => (
                    item.videoId ?
                        (<div
                            key={item._id}
                            className="flex items-start gap-4 border-b shadow-xl hover:bg-gray-50 rounded-lg transition flex-col md:flex-row"
                        >
                            <Link to={`/watch/${item.videoId._id}`} className="flex-shrink-0 w-full md:w-48">
                                <video
                                    src={item.videoId?.URL}
                                    className="rounded-lg w-full aspect-video object-cover hover:scale-105 transition-transform duration-200"
                                    muted
                                    preload="metadata"
                                />
                            </Link>

                            <div className="flex-1 px-2">
                                <Link to={`/watch/${item.videoId._id}`}>
                                    <h3 className="font-semibold">{item.videoId.videotitle}</h3>
                                    <p className="text-sm text-gray-500">{item.videoId.videochannel}</p>
                                    <p className="text-xs text-gray-400">
                                        {item.videoId.Views.toLocaleString()} views • watched{' '}
                                        {formatDistanceToNow(new Date(item.putOn))} ago
                                    </p>
                                </Link>
                            </div>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <MoreVertical />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem onClick={() => handleRemoveFromWatchLater(item._id)}>
                                        <X className="w-4 h-4 mr-2" /> Remove from Watch Later
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>)
                        :
                        (
                            <div className="flex-1">
                                <h3 className="font-semibold">Video is unavailable</h3>
                                <p className="text-xs text-gray-400">
                                    • watched{' '}
                                    {formatDistanceToNow(new Date(item?.putOn))} ago
                                </p>
                            </div>
                        )
                ))}
            </div>
        </div>
    );
};

export default WatchLaterContent;
