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

const Sidebar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isDialogeOpen, setIsDialogeOpen] = useState(false);
    const { user, login } = useUser();
    const [buying, setBuying] = useState(false);

    const startPremiumCheckout = async () => {
        try {
            if (!user?._id) {
                alert('Please sign in to purchase premium');
                return;
            }
            setBuying(true);
            const { data: keyData } = await axiosInstance.get(`/payment/key`);
            const { data: order } = await axiosInstance.post(`/payment/order`, { amount: 49900 });
            const options = {
                key: keyData.key,
                amount: order.amount,
                currency: order.currency,
                name: "YourTube Premium",
                description: "Unlimited downloads for 30 days",
                order_id: order.id,
                handler: async function (response) {
                    try {
                        await axiosInstance.post(`/payment/verify`, {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            userId: user._id
                        });
                        if (user) {
                            const until = new Date();
                            until.setMonth(until.getMonth() + 1);
                            login({ ...user, isPremium: true, premiumUntil: until.toISOString() });
                        }
                        alert('You are now premium!');
                    } catch (e) {
                        console.error(e);
                        alert('Verification failed');
                    }
                },
                theme: { color: "#000000" }
            };
            if (!window.Razorpay) {
                await new Promise((resolve, reject) => {
                    const script = document.createElement('script');
                    script.src = "https://checkout.razorpay.com/v1/checkout.js";
                    script.onload = resolve;
                    script.onerror = () => reject(new Error('Razorpay SDK failed to load'));
                    document.body.appendChild(script);
                });
            }
            const rz = new window.Razorpay(options);
            rz.open();
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
                                {!user?.isPremium && (
                                    <div className="px-2 py-1.5">
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            className="flex w-full bg-yellow-200 text-black"
                                            onClick={startPremiumCheckout}
                                            disabled={buying}
                                        >
                                            {buying ? 'Processing…' : 'Go Premium'}
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
        </>
    );
};

export default Sidebar;
