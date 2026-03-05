"use client"
import Dashboard from '@/views/Dashboard';
import { useRouter } from "next/navigation";

export default function DashBoardView(){

    const router = useRouter();

    return(
        <div className="min-h-screen bg-background font-space">
            <Dashboard onBack={() => router.push('/')} />
        </div>
    );
}