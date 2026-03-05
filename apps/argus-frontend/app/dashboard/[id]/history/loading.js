export default function Loading() {
    return (
        <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center space-y-4">
            {/* A sleek, techy spinner */}
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            <p className="text-zinc-500 text-sm animate-pulse tracking-widest uppercase">
                Retrieving Commit History...
            </p>
        </div>
    );
}