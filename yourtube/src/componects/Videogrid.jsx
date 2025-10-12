import React, { useState, useEffect } from 'react';
import VideoCard from './VideoCard';
import axiosInstance from '../lib/axiosInstance';

const Videogrid = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await axiosInstance.get("/video/getall");
        setVideos(response.data); // ✅ only store the array
      } catch (error) {
        console.error("Error fetching videos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-4">
      {loading ? (
        Array(8).fill(0).map((_, i) => (
          <div key={i} className="animate-pulse bg-gray-200 rounded-lg aspect-video"></div>
        ))
      ) : Array.isArray(videos) && videos.length > 0 ? (
        videos.map((vid) => (
          <VideoCard key={vid._id} video={vid} />
        ))
      ) : (
        <p className="text-gray-500">No videos found.</p>
      )}
    </div>
  );
};

export default Videogrid;
