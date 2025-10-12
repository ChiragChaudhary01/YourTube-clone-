import { useEffect, useRef, useMemo } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom"

const VideoPlayer = ({ video }) => {
    const videos = "/video/vdo.mp4";
    const videoRef = useRef(null);
    const { id } = useParams();
    // const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
    // const videoURL = `${VITE_BACKEND_URL}/uploads/${video.filename}`;
    if (!video) {
        return <div>
            Not Found
        </div>;
    };
    return (
        <div className="aspect-video bg-black rounded-lg overflow-hidden">
            <video src={video?.URL} className="w-full h-full" controls>
                {/* <source src={video.filepath} type="video/mp4"></source> */}
                your Browser does not support the video tag.
            </video>
        </div>
    )
}
export default VideoPlayer;