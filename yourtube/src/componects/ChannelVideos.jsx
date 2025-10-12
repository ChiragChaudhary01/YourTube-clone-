import VideoCard from "./VideoCard";

const ChannelVideos = ({ videos }) => {
    if (videos.length == 0) {
        return (
            <div>
                <p>No Videos Uploaded yet.</p>
            </div>
        );
    }
    return (
        <div>
            <h2 className="text-xl font-semibold mb-4">Videos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {videos.map((video) => (
                    <VideoCard key={video._id} video={video} />
                ))}
            </div>
        </div>
    )
}

export default ChannelVideos
