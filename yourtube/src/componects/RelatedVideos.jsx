import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";

const vid = "/video/vdo.mp4";
export default function RelatedVideos({ videos }) {
  // const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  return (
    <div className="space-y-2">
      {videos.map((video) => (
        <Link
          key={video._id}
          to={`/watch/${video._id}`}
          className="flex gap-2 group"
        >
          <div className="relative w-40 aspect-video bg-gray-100 rounded overflow-hidden flex-shrink-0">
            <video
              src={video?.URL}
              className="object-cover group-hover:scale-105 transition-transform duration-200"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm line-clamp-2 group-hover:text-blue-600">
              {video.videotitle}
            </h3>
            <p className="text-xs text-gray-600 mt-1">{video.videochanel}</p>
            <p className="text-xs text-gray-600">
              {video.Views.toLocaleString()} views •{" "}
              {formatDistanceToNow(new Date(video.createdAt))} ago
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
