"use client"

import { useParams } from "next/navigation";
import RepoHistory from "@/views/RepoHistory";

export default function HistoryPage() {
    const params = useParams();
    const repoId = params.id;

    return (
        <div className="min-h-screen bg-background font-sans">
            <RepoHistory repoId={repoId} />
        </div>
    );
}