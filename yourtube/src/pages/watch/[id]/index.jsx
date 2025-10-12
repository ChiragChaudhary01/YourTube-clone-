import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import VideoPlayer from '../../../componects/VideoPlayer';
import VideoInfo from '../../../componects/VideoInfo';
import Comments from '../../../componects/Comments';
import RelatedVideos from '../../../componects/RelatedVideos';
import axiosInstance from '../../../lib/axiosInstance';
import { useUser } from '../../../lib/AuthContext';

const WatchVideo = () => {
    const { id } = useParams();
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useUser();

    // ✅ Fetch all videos
    useEffect(() => {
        const fetchVideos = async () => {
            try {
                const response = await axiosInstance.get("/video/getall");
                setVideos(response.data);
            } catch (error) {
                console.error("Error fetching videos:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchVideos();
    }, [id]);

    // ✅ Find current video
    const video = useMemo(() => {
        if (!videos.length || !id) return null;
        const cleanId = id.toString().trim();
        const found = videos.find((v) => v._id.toString().trim() === cleanId);
        return found || null;
    }, [videos, id]);


    // ✅ Filter related videos (e.g., same channel or exclude current)
    const relatedVideos = useMemo(() => {
        if (!video) return [];
        return videos.filter((v) => v._id !== video._id);
    }, [videos, video]);

    if (loading) return <div className="p-8 text-center">Loading...</div>;

    if (!video) return <div className="p-8 text-center text-gray-500">Video not found</div>;

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-8xl mx-auto md:p-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-4">
                        <VideoPlayer video={video} />
                        <VideoInfo video={video} />
                        <Comments videoId={video._id} />
                    </div>
                    <div className="space-y-4">
                        <RelatedVideos videos={relatedVideos} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WatchVideo;
