import { useEffect, useState } from 'react';
import axiosInstance from '../lib/axiosInstance';
import { useUser } from '../lib/AuthContext';

const ProfileDownloads = () => {
    const { user } = useUser();
    const [items, setItems] = useState([]);
    const toAbsoluteUrl = (u) => {
        try {
            if (!u) return u;
            if (/^https?:\/\//i.test(u)) return u;
            return new URL(u, axiosInstance.defaults.baseURL).href;
        } catch {
            return u;
        }
    };

    useEffect(() => {
        const load = async () => {
            if (!user?._id) return;
            const { data } = await axiosInstance.get(`/download/${user._id}`);
            setItems(data || []);
        };
        load();
    }, [user]);

    return (
        <div className="p-4">
            <h1 className="text-xl font-semibold mb-4">Your Downloads</h1>
            {items.length === 0 ? (
                <p className="text-gray-600">No downloads yet.</p>
            ) : (
                <div className="space-y-3">
                    {items.map((it) => (
                        <div key={it._id} className="p-3 border rounded flex justify-between items-center">
                            <div>
                                <div className="font-medium">{it.videoTitle}</div>
                                <div className="text-xs text-gray-600">{new Date(it.createdAt).toLocaleString()}</div>
                            </div>
                            <a className="text-blue-600 underline" href={toAbsoluteUrl(it.videoURL)} download>
                                Download
                            </a>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProfileDownloads;


