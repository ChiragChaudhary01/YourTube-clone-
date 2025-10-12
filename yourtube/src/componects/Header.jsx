import React, { useState } from 'react';
import { Button } from './UI/Button2.jsx';
import { Input } from './UI/Input.jsx';
import { Bell, BellIcon, Menu, Mic, Search, User, VideoIcon } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "./UI/dropdown-menu.jsx";
import { Avatar, AvatarImage, AvatarFallback } from './UI/avatar.jsx';
import ChannelDialoge from './ChannelDialoge.jsx';
import { useNavigate } from "react-router-dom"
import { useUser } from '../lib/AuthContext.jsx';
import { useEffect } from 'react';

const Header = () => {
    const { user, logout, handleGoogleSignin } = useUser();
    const [searchQuery, setSearchQuery] = useState("");
    const [hasChannel, setHasChannel] = useState(false);
    const [isDialogeOpen, setIsDialogeOpen] = useState(false);

    const navigate = useNavigate();

    const handleKeypress = (e) => {
        if (e.key === "Enter") {
            handleSearch(e);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    useEffect(() => {
        if (user?.channelname) {
            setHasChannel(true);
        } else {
            setHasChannel(false);
        }
    }, [user]);


    return (
        <header className="flex items-center justify-between px-4 py-2 bg-white">
            <div className="flex items-center gap-4">
                <button className="md:flex items-center gap-4 hidden"> <Menu className="w-6 h-6" /> </button>
                <a href="/" className="flex items-center gap-1">
                    <div className="white">
                        <svg width="30" height="30" viewBox="0 0 24 24" fill="red">
                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                        </svg>
                    </div>
                    <span className="text-xl font-medium hidden md:block">YourTube</span>
                    <span className="text-xs text-gray-400 ml-1 hidden md:block">IN</span>
                </a>
            </div>
            <form
                onSubmit={handleSearch}
                className="flex items-center gap-2 flex-1 max-w-2xl mx-4"
            >
                <div className="flex flex-1">
                    <Input
                        type="search"
                        placeholder="Search"
                        value={searchQuery}
                        onKeyPress={handleKeypress}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="rounded-l-full border-r-0 focus-visible:ring-0 border-gray-300"
                    />
                    <button
                        type="submit"
                        className="rounded-r-full px-6 bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-300"
                    >
                        <Search className="w-5 h-5" />
                    </button>
                </div>
                <button variant="ghost" size="icon" className="rounded-full hidden md:block">
                    <Mic className="w-5 h-5" />
                </button>
            </form>
            <div className="flex items-center gap-3">
                {user ? (<>
                    <button className='hidden md:block'>
                        <VideoIcon />
                    </button>
                    <button className='hidden md:block'>
                        <Bell />
                    </button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button>
                                <Avatar>
                                    <AvatarImage src={user.image} alt={user.name}></AvatarImage>
                                    <AvatarFallback>
                                        {user.name.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-white" forceMount>
                            {hasChannel ? (
                                <DropdownMenuItem>
                                    <a href={`/channel/${user.id}`} >Your channel</a>
                                </DropdownMenuItem>
                            ) : (
                                <div>
                                    <Button onClick={() => setIsDialogeOpen(true)}>
                                        Create Channel
                                    </Button>
                                </div>
                            )}
                            <DropdownMenuItem>
                                <a href={`/history`} >History</a>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <a href={`/liked`} >Liked videos</a>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <a href={`/watch-later`} >Watch later</a>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={logout}>Sign out</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </>) : (<>
                    <button
                        className="flex items-center gap-2 bg-black text-white px-2 py-1.5 rounded-xl"
                        onClick={() => {
                            console.log("Clicked");
                            handleGoogleSignin();
                        }}
                    >
                        <User className="w-4 h-4" />
                        Sign in
                    </button>
                </>)}
            </div>
            <ChannelDialoge isOpen={isDialogeOpen} onClose={() => setIsDialogeOpen(false)} mode="create" />
        </header>
    )
}

export default Header;