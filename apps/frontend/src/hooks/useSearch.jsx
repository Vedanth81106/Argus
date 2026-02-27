import {useEffect, useState} from "react";

export default function useSearch(query, type, username){

    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if(type === 'users' && (!query || query.length < 2)){
            setResults([]);
            return;
        }

        const delayDebounceFunction = setTimeout(async () => {
            setIsLoading(true);
            try {
                const endpoint = type === 'users'
                    ? `http://localhost:8080/api/users/${encodeURIComponent(query)}`
                    : `http://localhost:8080/api/users/${username}/repos`

                const response = await fetch(endpoint);
                const data = await response.json();
                if(response.ok){
                    setResults(data);
                } else {
                    setResults([]);
                }
            } catch(error) {
                console.error("Search failed:", error);
                setResults([]);
            } finally {
                setIsLoading(false);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFunction);
    }, [query, type, username]);

    return {results, isLoading};
}