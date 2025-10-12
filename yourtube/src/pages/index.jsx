import { Suspense } from "react";
import CategoryTabs from "../componects/CategoryTabs";
import Videogrid from "../componects/Videogrid";

export default function Home() {
    return (
        <main className="flex-1 p-4">
            <CategoryTabs />
            <Videogrid></Videogrid>
            {/* <Suspense fallback={<div>Loading Videos...</div>}></Suspense> */}
        </main>
    );
}