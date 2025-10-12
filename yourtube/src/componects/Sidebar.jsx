import {
    Home,
    Compass,
    PlaySquare,
    Clock,
    ThumbsUp,
    History,
    User,
} from "lucide-react";
import ChannelDialoge from "./ChannelDialoge";
import React, { useState } from "react";
import { Button } from "./UI/Button2";
import { useUser } from "../lib/AuthContext";

const Sidebar = () => {
    const [hasChannel, setHasZChannel] = useState(false);
    const [isDialogeOpen, setIsDialogeOpen] = useState(false);
    const { user } = useUser();

    // const user = {
    //     id: "1",
    //     name: "Pankaj Chaudhary",
    //     email: "pankaj@gmail.com",
    //     image: "Shample Profile Image.jpg",
    //     channelname: "Tech Corner"
    // };

    return (
        <aside className=" bg-white min-h-screen py-2 md:px-4 px-2 md:w-auto w-35">
            <nav className="space-y-1 flex flex-col gap-1">
                <a href="/">
                    <button variant="ghost" className="flex w-full justify-start">
                        <Home className="w-5 h-5 mr-3 hidden md:block" />
                        Home
                    </button>
                </a>
                <a href="/explore">
                    <button variant="ghost" className="flex w-full justify-start">
                        <Compass className="w-5 h-5 mr-3 hidden md:block" />
                        Explore
                    </button>
                </a>
                <a href="/subscriptions">
                    <button variant="ghost" className="flex w-full justify-start">
                        <PlaySquare className="w-5 h-5 mr-3 hidden md:block" />
                        Subscriptions
                    </button>
                </a>

                {user && (
                    <>
                        <div className="border-t pt-4 mt-2 flex flex-col gap-1 border-gray-200">
                            <a href="/history">
                                <button variant="ghost" className="flex w-full justify-start">
                                    <History className="w-5 h-5 mr-3 hidden md:block" />
                                    History
                                </button>
                            </a>
                            <a href="/liked">
                                <button variant="ghost" className="flex w-full justify-start">
                                    <ThumbsUp className="w-5 h-5 mr-3 hidden md:block" />
                                    Liked videos
                                </button>
                            </a>
                            <a href="/watch-later">
                                <button variant="ghost" className="flex w-full justify-start">
                                    <Clock className="w-5 h-5 mr-3 hidden md:block" />
                                    Watch later
                                </button>
                            </a>
                            {user?.channelname ? (
                                <a href={`/channel/${user.id}`}>
                                    <button variant="ghost" className="flex w-full justify-start">
                                        <User className="w-5 h-5 mr-3" />
                                        Your channel
                                    </button>
                                </a>
                            ) : (
                                <div className="px-2 py-1.5">
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        className="flex w-full"
                                        onClick={() => setIsDialogeOpen(true)}
                                    >
                                        Create Channel
                                    </Button>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </nav>
            <ChannelDialoge
                isOpen={isDialogeOpen}
                onClose={() => setIsDialogeOpen(false)}
                mode="create"
            />
        </aside>
    );
};

export default Sidebar;
