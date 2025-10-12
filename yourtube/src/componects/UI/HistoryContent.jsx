import { formatDistanceToNow } from 'date-fns';
import { Clock, MoreVertical, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './dropdown-menu';
import { Button } from './Button2';

import { useUser } from '../../lib/AuthContext.jsx'
import axiosInstance from '../../lib/axiosInstance.js';

const HistoryContent = () => {
    const { user } = useUser();

    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadHisory = async () => {
        if (!user) return;

        try {
            const historyData = await axiosInstance.get(`/history/${user?._id}`);
            console.log("historyData.data", historyData.data);
            setHistory(historyData.data);
        } catch (error) {
            console.error(error);
        }
    }

    // ✅ Use effect to load data once
    useEffect(() => {
        loadHisory();
        setLoading(false);
    }, [user]);

    const handleRemoveFromHistory = (historyId) => {
        try {
            console.log('Removing from history:', historyId);
            setHistory((prev) => prev.filter((item) => item._id !== historyId));
        } catch (error) {
            console.error('Error removing from history:', error);
        }
    };

    // 🧠 Conditional UI
    if (!user) {
        return (
            <div className="text-center mt-10">
                <Clock className="w-6 h-6 mx-auto" />
                <h2 className="text-lg font-semibold mt-2">Keep track of what you watch</h2>
                <p className="text-gray-500">Watch history isn't viewable when signed out.</p>
            </div>
        );
    }

    if (loading) {
        return <div className="text-center mt-10">Loading...</div>;
    }

    if (history.length === 0) {
        return (
            <div className="text-center mt-10">
                <Clock className="w-6 h-6 mx-auto" />
                <h2 className="text-lg font-semibold mt-2">No watch history yet</h2>
                <p className="text-gray-500">Videos you watch will appear here.</p>
            </div>
        );
    }
    // const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
    console.log(history);

    return (
        <div className="p-4 space-y-4">
            <div className="text-sm text-gray-600">{history.length} videos</div>

            <div className="grid gap-4">
                {history.map((item) => (
                    item.videoId ?
                        (<div
                            key={item._id}
                            className="flex items-start gap-4 border-b shadow-xl hover:bg-gray-50 rounded-lg transition"
                        >
                            <Link to={`/watch/${item.videoId?._id}`} className="flex-shrink-0 w-48">
                                <video
                                    src={item.videoId?.URL}
                                    className="rounded-lg w-full aspect-video object-cover hover:scale-105 transition-transform duration-200"
                                    muted
                                    preload="metadata"
                                />
                            </Link>

                            <div className="flex-1">
                                <Link to={`/watch/${item.videoId?._id}`}>
                                    <h3 className="font-semibold">{item.videoId?.videotitle}</h3>
                                    <p className="text-sm text-gray-500">{item.videoId?.videochannel}</p>
                                    <p className="text-xs text-gray-400">
                                        {item.videoId?.Views.toLocaleString()} views • watched{' '}
                                        {formatDistanceToNow(new Date(item.whatchedOn))} ago
                                    </p>
                                </Link>
                            </div>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="secondary" size="icon">
                                        <MoreVertical />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem onClick={() => handleRemoveFromHistory(item._id)}>
                                        <X className="w-4 h-4 mr-2" /> Remove from history
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
                                    {formatDistanceToNow(new Date(item?.whatchedOn))} ago
                                </p>
                            </div>
                        )
                ))}
            </div>
        </div>
    );
};

export default HistoryContent;
