import React, { useState } from "react";
import {
    Home,
    Compass,
    PlaySquare,
    Clock,
    ThumbsUp,
    History,
    User,
    Menu,
    X
} from "lucide-react";
import ChannelDialoge from "./ChannelDialoge";
import { Button } from "./UI/Button2";
import { useUser } from "../lib/AuthContext";
import axiosInstance from "../lib/axiosInstance";
import UpgradePlanModal from "./UpgradePlanModal";

const Sidebar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isDialogeOpen, setIsDialogeOpen] = useState(false);
    const { user, login, remainingWatchSeconds } = useUser();
    const [buying, setBuying] = useState(false);
    const [showUpgrade, setShowUpgrade] = useState(false);

    const startPremiumCheckout = async () => {
        try {
            if (!user?._id) {
                alert('Please sign in to purchase premium');
                return;
            }
            setShowUpgrade(true);
        } catch (e) {
            console.error(e);
            const message = e?.response?.data?.message || e?.message || 'Failed to start checkout';
            alert(message);
        } finally {
            setBuying(false);
        }
    };

    const toggleSidebar = () => setIsOpen(!isOpen);

    return (
        <>
            {/* Mobile menu button */}
            <div className="md:hidden fixed top-4 left-4 z-50">
                <button
                    onClick={toggleSidebar}
                    className="p-2 bg-gray-100 rounded-lg shadow-md hover:bg-gray-200 transition"
                >
                    {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Overlay when sidebar is open on mobile */}
            {isOpen && (
                <div
                    onClick={toggleSidebar}
                    className="fixed inset-0 bg-black/40 z-40 md:hidden"
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed md:static top-0 left-0 z-50 md:z-auto bg-white min-h-screen py-2 md:px-4 px-2 md:w-auto w-56 transform transition-transform duration-300
                ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
            >
                <nav className="space-y-1 flex flex-col gap-1 mt-14 md:mt-0">
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
                                <a href="/downloads">
                                    <button variant="ghost" className="flex w-full justify-start">
                                        <History className="w-5 h-5 mr-3 hidden md:block" />
                                        Downloads
                                    </button>
                                </a>
                                {user?.channelname ? (
                                    <a href={`/channel/${user.id}`}>
                                        <button variant="ghost" className="flex w-full justify-start">
                                            <User className="w-5 h-5 mr-3 hidden md:block" />
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
                                <div className="px-2 py-2 border rounded-lg mt-2 text-sm w-full">
                                    <div className="text-xs text-gray-600">Current Plan</div>
                                    <div className="flex items-center justify-between mt-1 gap-2">
                                        <div className="font-medium truncate max-w-[8rem] md:max-w-[10rem]">
                                            {(user?.planType) ? user.planType : (user?.isPremium ? 'Gold' : 'Free')}
                                        </div>
                                        <div className="text-xs text-gray-600 shrink-0 text-right">
                                            {(user?.planType === 'Gold' || user?.isPremium)
                                                ? 'Unlimited'
                                                : (() => {
                                                    const total = (user?.planDurationLimit ?? 5) * 60;
                                                    const rem = typeof remainingWatchSeconds === 'number' ? remainingWatchSeconds : total;
                                                    const mm = Math.floor(rem / 60).toString().padStart(2, '0');
                                                    const ss = Math.max(0, rem % 60).toString().padStart(2, '0');
                                                    return `${mm}:${ss} left`;
                                                  })()
                                            }
                                        </div>
                                    </div>
                                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            className="w-full min-w-0"
                                            onClick={() => setShowUpgrade(true)}
                                        >
                                            Change Plan
                                        </Button>
                                        {!user?.isPremium && (
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                className="w-full min-w-0 bg-yellow-200 text-black"
                                                onClick={startPremiumCheckout}
                                                disabled={buying}
                                            >
                                                {buying ? 'Loading…' : 'Upgrade'}
                                            </Button>
                                        )}
                                    </div>
                                </div>
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
            <UpgradePlanModal isOpen={showUpgrade} onClose={() => setShowUpgrade(false)} onSuccess={(plan) => {
                // optional hook
            }} />
        </>
    );
};

export default Sidebar;
