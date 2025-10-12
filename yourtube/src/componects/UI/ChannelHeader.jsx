import React, { useState } from 'react'
import { AvatarFallback, Avatar, AvatarImage } from './avatar';
import { Button } from './Button2';
import { useUser } from '../../lib/AuthContext';

const ChannelHeader = ({ channel }) => {
    const [isSubscribed, setIsSubscribed] = useState();
    const { user } = useUser();
    // const user = {
    //     id: "1",
    //     name: "Pankaj Chaudhary",
    //     email: "pankaj@gmail.com",
    //     image: "Shample Profile Image.jpg",
    //     channelname: "Tech Corner"
    // };

    return (
        <div className="w-[89vw]">
            {/* Banner */}
            <div className="relative h-32 md:h-43 lg:h-54 bg-gradient-to-r from-blue-400 to-purple-500 overflow-hidden w-100%"></div>

            {/* Channel Info */}
            <div className="px-4 py-6">
                <div className="flex flex-col md:flex-row gap-6 items-start">
                    <Avatar className="w-20 h-20 md:w-32 md:h-32">
                        {channel?.image ? (
                            <AvatarImage src={channel.image} alt={user.name}></AvatarImage>
                        ) : (
                            <AvatarFallback className="text-2xl">
                                {channel?.channelname[0]}
                            </AvatarFallback>
                        )}
                    </Avatar>

                    <div className="flex-1 space-y-2">
                        <h1 className="text-2xl md:text-4xl font-bold">{channel?.channelname}</h1>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                            <span>@{channel?.channelname.toLowerCase().replace(/\s+/g, "")}</span>
                        </div>
                        {channel?.description && (
                            <p className="text-sm text-gray-700 max-w-2xl">
                                {channel?.description}
                            </p>
                        )}
                    </div>

                    {user && user?._id !== channel?._id && (
                        <div className="flex gap-2">
                            <Button
                                onClick={() => setIsSubscribed(!isSubscribed)}
                                variant={isSubscribed ? "outline" : "default"}
                                className={
                                    isSubscribed ? "bg-gray-100" : "bg-red-600 hover:bg-red-700"
                                }
                            >
                                {isSubscribed ? "Subscribed" : "Subscribe"}
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default ChannelHeader
