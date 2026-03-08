import pika
import json

def send_ai_feedback(repo_id, commit_sha, review_data, channel):

    result_payload = {
        "score": review_data.get("score", 0),
        "summary": review_data.get("summary", "No summary provided"),
        "repoId": repo_id,
        "commitSha": commit_sha,
        "logicErrors": review_data.get("logic_errors", "None"),
        "performanceBottlenecks": review_data.get("performance_bottlenecks", "None"),
        "securityVulnerabilities": review_data.get("security_vulnerabilities", "None")
    }

    channel.basic_publish(
        exchange='',
        routing_key='results-queue',
        body=json.dumps(result_payload),
        properties=pika.BasicProperties(
            delivery_mode=2,  # make message persistent
        )
    )

    print(f"Sent AI feedback for repo {repo_id}, commit {commit_sha} to results-queue.")