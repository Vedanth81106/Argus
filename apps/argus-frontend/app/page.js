"use client";
import Home from "@/views/Home";
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const router = useRouter();

  return (
      <div className={"min-h-screen bg-background font-raleway selection:bg-blue-500/30 animate-in fade-in duration-700"}>
        <Home onStart={() => {router.push('/dashboard')}} />
      </div>

  );
}