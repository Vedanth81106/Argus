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

                // check if it exists in the db first
                const check = await fetch(`/api/reviews/${commitSha}`);
                if (check.ok) {
                    const data = await check.json();
                    if (!active) return;

                    // if AI is done reviewing, show it and then return
                    if (data.score > 0) {
                        setReview(data);
                        setLoading(false);
                        return;
                    }
                    setReview(data);
                }

                // wait for sometime and then start listening (so that java has time to open the tunnel)
                await new Promise(resolve => setTimeout(resolve, 500));
                if (!active) return;

                console.log("Opening SSE for SHA:", commitSha);
                const sse = new EventSource(`http://localhost:8080/api/stream/reviews/${commitSha}`);
                eventSourceRef.current = sse;

                // listen for the event
                sse.addEventListener("review-result", (event) => {
                    if (!active) return;
                    console.log("🎯 AI Result Received via SSE!");
                    const data = JSON.parse(event.data);

                    setReview(data);
                    setLoading(false);
                    sse.close();
                });

                sse.onerror = (err) => {
                    console.error("SSE error occurred:", err);
                    if (eventSourceRef.current) {
                        eventSourceRef.current.close();
                    }
                };

            } catch (error) {
                console.error("Failed to initiate audit UI:", error);
            }
        };

        fetchReview();

        return () => {
            active = false;
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
            }
        };
    }, [commitSha, repoId]);

    // UI
    if (loading) return <div className="animate-pulse p-6">Analyzing commit...</div>;
    if (!review) return <div className="p-6 text-red-400">Review not found</div>;

    return (
        <div className="space-y-6 p-6 text-sm">
            <h2 className="text-xl font-semibold">
                Score: <span className="text-primary">{review.score}/10</span>
            </h2>

            <section>
                <h3 className="font-semibold">Summary</h3>
                <p className="text-muted-foreground">{review.summary}</p>
            </section>

            <section>
                <h3 className="font-semibold text-red-400">Security</h3>
                <p>{review.securityVulnerabilities || "No issues found."}</p>
            </section>

            <section>
                <h3 className="font-semibold text-amber-400">Logic Issues</h3>
                <p>{review.logicErrors || "No issues found."}</p>
            </section>

            <section>
                <h3 className="font-semibold text-blue-400">Performance</h3>
                <p>{review.performanceBottlenecks || "No bottlenecks found."}</p>
            </section>
        </div>
    );
}