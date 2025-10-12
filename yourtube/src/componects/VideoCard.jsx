import { formatDistanceToNow } from "date-fns";
import { AvatarFallback, Avatar, AvatarImage } from './UI/avatar';
import { Link } from "react-router-dom";
import { useState } from "react";
import { useRef } from "react";

const VideoCard = ({ video }) => {
    const [duration, setDuration] = useState();
    const videoRef = useRef(null);

    // const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
    // const videoURL = `${VITE_BACKEND_URL}/uploads/${video.filename}`;

    // Convert second => mm:ss format
    const formatDuration = (second) => {
        const minutes = Math.floor(second / 60);
        const secs = Math.floor(second % 60);
        return `${minutes}:${secs < 10 ? "0" : ""}${secs}`
    }

    const handleLoadedMetadata = () => {
        if (videoRef.current) {
            const dur = videoRef.current.duration;
            setDuration(formatDuration(dur));
        }
    };

    return (
        <Link to={`watch/${video._id}`}>
            <div className="space-y-3">
                <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
                    <video
                        ref={videoRef}
                        src={video?.URL}
                        onLoadedMetadata={handleLoadedMetadata}
                        className="object-cover group-hover:scale-105 transition-transform duration-200 hover:scale-105"
                    />
                    <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1 rounded">
                        {duration}
                    </div>
                </div>
                <div className="flex gap-3">
                    <Avatar className="w-9 h-9 flex-shrink-0 bg-gray-200 font-medium">
                        <AvatarFallback>{video?.videochanel[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm line-clamp-2 group-hover:text-blue-600">
                            {video?.videotitle}
                        </h3>
                        <div className="flex gap-2">
                            <p className="text-sm text-gray-600 font-semibold">{video?.videochanel}</p>
                            <p className="text-sm text-gray-600 font-medium">• {(video?.Views ?? 0).toLocaleString()} views</p>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    )
}

export default VideoCard
