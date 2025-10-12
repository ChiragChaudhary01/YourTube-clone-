import { useNavigate, useParams, useLocation } from "react-router-dom"
import ChannelHeader from "../../../componects/UI/ChannelHeader";
import ChannelTabs from "../../../componects/UI/ChannelTabs";
import VideoUploader from "../../../componects/VideoUploader";
import ChannelVideos from "../../../componects/ChannelVideos";
import { useUser } from "../../../lib/AuthContext";

const ChannelPage = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { user } = useUser();
    // const user = {
    //     id: "1",
    //     name: "Pankaj Chaudhary",
    //     email: "pankaj@gmail.com",
    //     image: "Shample Profile Image.jpg",
    //     channelname: "Tech Corner",
    //     description: "Namste, Wellcome to my youtube channel. Here you will see the exiting Tech Videos."
    // };

    let channel = null;
    let videos = null;

    try {
        channel = user;

        videos = [
            {
                _id: "1",
                videotitle: "Amazing Nature Documentary",
                filename: "vdo.mp4",
                filetype: "video/mp4",
                filepath: "/video/vdo.mp4",
                filesize: "500MB",
                videochanel: "Nature Channel",
                Like: 1250,
                Dislike: 50,
                views: 45000,
                uploader: "nature_lover",
                createdAt: new Date().toISOString(),
            },
            {
                _id: "2",
                videotitle: 'Underrated Apps',
                filename: "Underrated Apps.mp4",
                filetype: "video/mp4",
                filepath: "/video/Underrated Apps.mp4",
                filesize: "300MB",
                videochanel: "Chef's Kitchen",
                Like: 890,
                Dislike: 20,
                views: 23000,
                uploader: "chef_master",
                createdAt: new Date(Date.now() - 86400000).toISOString(),
            },
        ];
        if (!channel) {
            return (
                <div>
                    Channel not found
                </div>
            );
        };
    } catch (error) {
        console.error("Error fetching channel data:", error);
    };
    return (
        <div>
            <div>
                <ChannelHeader channel={channel} />
                <ChannelTabs />
                <div>
                    <VideoUploader channelId={id} channelName={channel?.channelname} />
                </div>
                <div className="px-4 pb-8">
                    <ChannelVideos videos={videos} />
                </div>
            </div>
        </div>
    )
}

export default ChannelPage
