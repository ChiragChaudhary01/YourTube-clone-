import { useEffect, useState } from "react";
import { Avatar, AvatarFallback } from "./UI/avatar";
import axiosInstance from "../lib/axiosInstance";
import { Button } from "./UI/Button2";
import {
    Clock,
    Download,
    MoreHorizontal,
    Share,
    ThumbsDown,
    ThumbsUp,
} from "lucide-react";
import { formatDistanceToNow, isAfter } from "date-fns";
import { useUser } from "../lib/AuthContext";

const VideoInfo = ({ video }) => {
    const [likes, setLikes] = useState(video.Like || 0);
    const [dislikes, setDislikes] = useState(video.Dislike || 0);
    const [isLiked, setIsLiked] = useState(false);
    const [isDisliked, setIsDisliked] = useState(false);
    const [showFullDescription, setShowFullDescription] = useState(false);
    const [isWatchLater, setIsWatchLater] = useState(false);

    const { user } = useUser();

    // ✅ Load user’s like/dislike status when video changes
    useEffect(() => {
        if (!user || !video?._id) return;

        const fetchLikeStatus = async () => {
            try {
                const { data } = await axiosInstance.get(`/like/${user._id}/${video._id}`);
                if (data) {
                    setIsLiked(!!data.liked);
                    setIsDisliked(!!data.disliked);
                }
            } catch (error) {
                console.error("Error fetching like status:", error);
            }
        };
        const fetchWatchLaterStatus = async () => {
            try {
                const { data } = await axiosInstance.get(`/watch-later/${user._id}/${video._id}`);
                if (data) {
                    setIsWatchLater(data?.watchlater);
                }
            } catch (error) {
                console.error("Error fetching like status:", error);
            }
        }

        fetchWatchLaterStatus();
        fetchLikeStatus();
    }, [user, video]);

    useEffect(() => {
        if (!video?._id || !user?._id) return;
        let called = false;

        const handleViews = async () => {
            if (called) return;
            called = true;

            try {
                await axiosInstance.post(`/history/${video._id}`, { userId: user._id });
            } catch (error) {
                console.error("Error saving history:", error);
            }
        };

        const timer = setTimeout(handleViews, 300); // Wait 300 ms
        return () => clearTimeout(timer);
    }, [video?._id, user?._id]);




    // ✅ Handle Like
    const handleLike = async () => {
        if (!user || !video?._id) return;

        const newLiked = !isLiked;
        const newDisliked = false;

        try {
            const { data } = await axiosInstance.post(`/like/${video._id}`, {
                userId: user._id,
                liked: newLiked,
                disliked: newDisliked,
            });

            // update UI immediately
            setIsLiked(newLiked);
            setIsDisliked(false);
            setLikes((prev) => prev + (newLiked ? 1 : -1));
            if (isDisliked) setDislikes((prev) => prev - 1);
        } catch (error) {
            console.error("Error updating like:", error);
        }
    };

    // ✅ Handle Dislike
    const handleDislike = async () => {
        if (!user || !video?._id) return;

        const newDisliked = !isDisliked;
        const newLiked = false;

        try {
            const { data } = await axiosInstance.post(`/like/${video._id}`, {
                userId: user._id,
                liked: newLiked,
                disliked: newDisliked,
            });

            setIsDisliked(newDisliked);
            setIsLiked(false);
            setDislikes((prev) => prev + (newDisliked ? 1 : -1));
            if (isLiked) setLikes((prev) => prev - 1);
        } catch (error) {
            console.error("Error updating dislike:", error);
        }
    };

    const handleWatchLater = async () => {
        try {
            const response = await axiosInstance.post(`/watch-later/${video._id}`, {
                userId: user._id
            });
            if (response.data.watchlater) {
                setIsWatchLater(true);
            } else {
                setIsWatchLater(false);
            }
        } catch (error) {
            console.error("Error updating dislike:", error);
        }
    }

    return (
        <div className="space-y-4">
            <h1 className="text-xl font-semibold">{video.videotitle}</h1>

            {/* Channel and Buttons */}
            <div className="flex items-center justify-between md:flex-row flex-col gap-3">
                <div className="flex items-center gap-4">
                    <Avatar className="w-10 h-10">
                        <AvatarFallback>{video.videochanel[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h3 className="font-medium">{video.videochanel}</h3>
                        <p className="text-sm text-gray-600">1.2M subscribers</p>
                    </div>
                    <Button className="ml-4 bg-black text-white">Subscribe</Button>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex items-center bg-gray-100 rounded-full">
                        <Button
                            variant="secondary"
                            size="sm"
                            className="rounded-l-full"
                            onClick={handleLike}
                        >
                            <ThumbsUp
                                className={`w-5 h-5 mr-2 ${isLiked ? "fill-black text-black" : ""
                                    }`}
                            />
                            {likes.toLocaleString()}
                        </Button>
                        <div className="w-px h-6 bg-gray-300" />
                        <Button
                            variant="secondary"
                            size="sm"
                            className="rounded-r-full"
                            onClick={handleDislike}
                        >
                            <ThumbsDown
                                className={`w-5 h-5 mr-2 ${isDisliked ? "fill-black text-black" : ""
                                    }`}
                            />
                            {dislikes.toLocaleString()}
                        </Button>
                    </div>

                    <Button
                        variant="secondary"
                        size="sm"
                        className={`bg-gray-100 rounded-full ${isWatchLater ? "text-primary" : ""
                            }`}
                        onClick={handleWatchLater}
                    >
                        <Clock className="w-5 h-5 mr-2" />
                        {isWatchLater ? "Saved" : "Watch Later"}
                    </Button>
                    <div className="hidden md:block">
                        <Button
                            variant="secondary"
                            size="sm"
                            className="bg-gray-100 rounded-full"
                        >
                            <Share className="w-5 h-5 mr-2" /> Share
                        </Button>
                    </div>
                    <div className="hidden md:block">
                        <Button
                            variant="secondary"
                            size="sm"
                            className="bg-gray-100 rounded-full"
                        >
                            <Download className="w-5 h-5 mr-2" /> Download
                        </Button>
                    </div>
                    <div className="hidden md:block">
                        <Button variant="secondary" size="icon" className="bg-gray-100 rounded-full">
                            <MoreHorizontal className="w-5 h-5" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Description */}
            <div className="bg-gray-100 rounded-lg p-4">
                <div className="flex gap-4 text-sm font-medium mb-2">
                    <span>{video.Views.toLocaleString()} views</span>
                    <span>{formatDistanceToNow(new Date(video.createdAt))} ago</span>
                </div>
                <div className={`text-sm ${showFullDescription ? "" : "line-clamp-3"}`}>
                    <p>{video.description || "No description available."}</p>
                </div>
                <Button
                    variant="secondary"
                    size="sm"
                    className="mt-2 p-0 h-auto font-medium"
                    onClick={() => setShowFullDescription(!showFullDescription)}
                >
                    {showFullDescription ? "Show less" : "Show more"}
                </Button>
            </div>
        </div>
    );
};

export default VideoInfo;
