import { useEffect, useRef, useMemo, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom"
import { useUser } from "../lib/AuthContext";
import { toast } from 'react-toastify';

const VideoPlayer = ({ video }) => {
    const videos = "/video/vdo.mp4";
    const videoRef = useRef(null);
    const { id } = useParams();
    const { user, setRemainingWatchSeconds, watchedTodaySeconds, addWatchedSeconds } = useUser();
    const [blocked, setBlocked] = useState(false);
    const [warned, setWarned] = useState(false);
    const lastTimeRef = useRef(0);
    const fractionalRef = useRef(0); // accumulate sub-second deltas
    // const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
    // const videoURL = `${VITE_BACKEND_URL}/uploads/${video.filename}`;
    if (!video) {
        return <div>
            Not Found
        </div>;
    };
    const limitMinutes = useMemo(() => {
        if (!user) return 5; // default free
        if (user.planType === 'Gold') return 0; // unlimited
        if (typeof user.planDurationLimit === 'number') return user.planDurationLimit;
        return user.isPremium ? 0 : 5;
    }, [user]);

    useEffect(() => {
        const el = videoRef.current;
        if (!el) return;
        const onTimeUpdate = () => {
            if (limitMinutes && limitMinutes > 0) {
                const maxSeconds = limitMinutes * 60;
                // Increment watched based on forward progress only
                const current = el.currentTime;
                let delta = 0;
                if (current > lastTimeRef.current) {
                    delta = current - lastTimeRef.current;
                }
                lastTimeRef.current = current;
                if (delta > 0) {
                    fractionalRef.current += delta;
                    const whole = Math.floor(fractionalRef.current);
                    if (whole >= 1) {
                        addWatchedSeconds(whole);
                        fractionalRef.current -= whole;
                    }
                }

                const consumed = watchedTodaySeconds;
                const remaining = Math.max(0, Math.ceil(maxSeconds - consumed));
                setRemainingWatchSeconds(remaining);
                if (consumed >= maxSeconds) {
                    el.pause();
                    setBlocked(true);
                    if (!warned) {
                        toast.warning('Playback limit reached for your current plan.');
                        setWarned(true);
                    }
                }
            }
        };
        el.addEventListener('timeupdate', onTimeUpdate);
        return () => el.removeEventListener('timeupdate', onTimeUpdate);
    }, [limitMinutes, warned, watchedTodaySeconds]);

    // Reset remaining time when video or plan context changes
    useEffect(() => {
        if (!limitMinutes || limitMinutes === 0) {
            setRemainingWatchSeconds(null);
            return;
        }
        lastTimeRef.current = 0;
        fractionalRef.current = 0;
        // remaining will be recalculated on first timeupdate using watchedTodaySeconds
        setWarned(false);
        setBlocked(false);
    }, [video?._id, limitMinutes]);

    return (
        <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
            <video ref={videoRef} src={video?.URL} className="w-full h-full" controls>
                {/* <source src={video.filepath} type="video/mp4"></source> */}
                your Browser does not support the video tag.
            </video>
            {blocked && (
                <div className="absolute inset-0 bg-black/70 text-white flex items-center justify-center p-6 text-center">
                    <div>
                        <div className="text-lg font-semibold mb-2">Playback limit reached</div>
                        <div className="text-sm opacity-90">Upgrade your plan to continue watching.</div>
                    </div>
                </div>
            )}
        </div>
    )
}
export default VideoPlayer;