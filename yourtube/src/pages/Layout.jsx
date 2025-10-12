import { Outlet } from "react-router";
import Header from '../componects/Header.jsx';
import Sidebar from '../componects/Sidebar.jsx';

const Layout = () => {
    return (
        <div className="min-h-screen bg-white text-black flex flex-col">
            <Header />
            <div className="flex flex-1">
                {/* Sidebar with fixed width */}
                <div className="h-full">
                    <Sidebar />
                </div>
                {/* Content area takes the remaining space */}
                <div className="flex-1 overflow-auto p-4">
                    <Outlet /> {/* This changes over based on the routes */}
                </div>
            </div>
        </div>
    );
}

export default Layout;
