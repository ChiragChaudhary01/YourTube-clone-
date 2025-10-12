import { Suspense } from "react";
import { useLocation } from "react-router-dom"
import SearchResult from "../componects/SearchResult";

const Search = () => {
    const { search } = useLocation();
    const q = new URLSearchParams(search).get("q");
    console.log(q);
    return (
        <div>
            <div>
                {q && (
                    <div className="px-4 pt-2">
                        <h1>Search result for "{q}"</h1>
                    </div>
                )}
                <Suspense fallback={<div>Loading</div>}>
                    <SearchResult query={q || ""} />
                </Suspense>
            </div>
        </div>
    )
}

export default Search
