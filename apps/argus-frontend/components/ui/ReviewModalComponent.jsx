"use client";

import { useEffect, useState, useRef } from "react";

export default function ReviewModalComponent({ commitSha, repoId }) {

    const [review, setReview] = useState(null);
    const [loading, setLoading] = useState(true);
    const eventSourceRef = useRef(null);

    useEffect(() => {
        let active = true;

        const fetchReview = async () => {
            try {
                // check if already exists
                const check = await fetch(`/api/reviews/${commitSha}`);
                if (check.ok) {
                    const data = await check.json();
                    if (!active) return;
                    setReview(data);
                    setLoading(false);
                    return;
                }

                // trigger audit
                await fetch(`/api/repos/${repoId}/audit/${commitSha}`, { method: "POST" });

                // small delay so backend registers listener
                await new Promise(r => setTimeout(r, 300));

                // listen for completion
                eventSourceRef.current = new EventSource(`http://localhost:8080/api/stream/reviews/${commitSha}`);

                eventSourceRef.current.onmessage = (event) => {
                    if (!active) return;
                    const data = JSON.parse(event.data);
                    setReview(data);
                    setLoading(false);
                    eventSourceRef.current.close();
                };

                eventSourceRef.current.onerror = (err) => {
                    console.error("SSE error:", err);
                    eventSourceRef.current.close();
                    if (active) setLoading(false);
                };

            } catch (error) {
                console.error("Failed to initiate audit:", error);
                if (active) setLoading(false);
            }
        };

        fetchReview();

        return () => {
            active = false;
            eventSourceRef.current?.close();
        };

    }, [commitSha, repoId]);

    if (loading) return <div className="animate-pulse p-6">Analyzing commit...</div>;
    if (!review) return <div className="p-6 text-red-400">Review not found</div>;

    return (
        <div className="space-y-6 p-6 text-sm">
            <h2 className="text-xl font-semibold">
                Score: <span className="text-primary">{review.score}</span>
            </h2>

            <section>
                <h3 className="font-semibold">Summary</h3>
                <p className="text-muted-foreground">{review.summary}</p>
            </section>

            <section>
                <h3 className="font-semibold">Security</h3>
                <p>{review.securityVulnerabilities}</p>
            </section>

            <section>
                <h3 className="font-semibold">Logic Issues</h3>
                <p>{review.logicErrors}</p>
            </section>

            <section>
                <h3 className="font-semibold">Performance</h3>
                <p>{review.performanceBottlenecks}</p>
            </section>
        </div>
    );
}