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

    const { user, login } = useUser();
    const [downloading, setDownloading] = useState(false);
    const [showPremiumHint, setShowPremiumHint] = useState(false);
    const [creatingOrder, setCreatingOrder] = useState(false);
    const toAbsoluteUrl = (u) => {
        try {
            if (!u) return u;
            if (/^https?:\/\//i.test(u)) return u;
            return new URL(u, axiosInstance.defaults.baseURL).href;
        } catch {
            return u;
        }
    };

    const handleDownload = async () => {
        if (!user) return alert('Please sign in to download');
        try {
            setDownloading(true);
            const { data } = await axiosInstance.post(`/download`, { userId: user._id, videoId: video._id });
            const url = toAbsoluteUrl(data?.download?.videoURL);
            if (url) {
                const a = document.createElement('a');
                a.href = url;
                a.download = `${video.videotitle || 'video'}.mp4`;
                document.body.appendChild(a);
                a.click();
                a.remove();
            }
            setShowPremiumHint(false);
        } catch (e) {
            if (e?.response?.status === 403) {
                setShowPremiumHint(true);
            } else {
                console.error(e);
                alert('Download failed');
            }
        } finally {
            setDownloading(false);
        }
    };

    const startPremiumCheckout = async () => {
        try {
            setCreatingOrder(true);
            const { data: keyData } = await axiosInstance.get(`/payment/key`);
            const { data: order } = await axiosInstance.post(`/payment/order`, { amount: 49900 });
            const options = {
                key: keyData.key,
                amount: order.amount,
                currency: order.currency,
                name: "YourTube Premium",
                description: "Unlimited downloads for 30 days",
                order_id: order.id,
                handler: async function (response) {
                    try {
                        await axiosInstance.post(`/payment/verify`, {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            userId: user._id
                        });
                        if (user) {
                            const until = new Date();
                            until.setMonth(until.getMonth() + 1);
                            login({ ...user, isPremium: true, premiumUntil: until.toISOString() });
                        }
                        alert('Payment successful! You are now premium.');
                        setShowPremiumHint(false);
                    } catch (e) {
                        console.error(e);
                        alert('Verification failed');
                    }
                },
                theme: { color: "#000000" }
            };
            // ensure checkout script is present
            if (!window.Razorpay) {
                await new Promise((resolve, reject) => {
                    const script = document.createElement('script');
                    script.src = "https://checkout.razorpay.com/v1/checkout.js";
                    script.onload = resolve;
                    script.onerror = reject;
                    document.body.appendChild(script);
                });
            }
            const rz = new window.Razorpay(options);
            rz.open();
        } catch (e) {
            console.error(e);
            alert('Failed to start checkout');
        } finally {
            setCreatingOrder(false);
        }
    };

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

                <div className="flex items-center gap-2 flex-wrap">
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
                    <Button
                        variant="secondary"
                        size="sm"
                        className="bg-gray-100 rounded-full"
                    >
                        <Share className="w-5 h-5 mr-2" /> Share
                    </Button>
                    <Button
                        variant="secondary"
                        size="sm"
                        className="bg-gray-100 rounded-full"
                        onClick={handleDownload}
                        disabled={downloading}
                    >
                        <Download className="w-5 h-5 mr-2" /> {downloading ? 'Downloading...' : 'Download'}
                    </Button>
                    {(!user?.isPremium) && (
                        <div>
                            <Button
                                variant="secondary"
                                size="sm"
                                className="bg-yellow-200 rounded-full text-black"
                                onClick={startPremiumCheckout}
                                disabled={creatingOrder}
                            >
                                {creatingOrder ? 'Processing…' : 'Go Premium'}
                            </Button>
                        </div>
                    )}
                    <Button variant="secondary" size="icon" className="bg-gray-100 rounded-full">
                        <MoreHorizontal className="w-5 h-5" />
                    </Button>
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

            {showPremiumHint && (
                <div className="bg-yellow-100 border border-yellow-300 text-yellow-900 rounded-lg p-4 flex items-center justify-between gap-3">
                    <div className="text-sm">
                        You have reached the daily download limit. Upgrade to premium for unlimited downloads.
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="secondary"
                            size="sm"
                            className="bg-yellow-300 text-black"
                            onClick={startPremiumCheckout}
                            disabled={creatingOrder}
                        >
                            {creatingOrder ? 'Processing…' : 'Go Premium'}
                        </Button>
                        <Button
                            variant="secondary"
                            size="sm"
                            className="bg-gray-200"
                            onClick={() => setShowPremiumHint(false)}
                        >
                            Not now
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VideoInfo;
