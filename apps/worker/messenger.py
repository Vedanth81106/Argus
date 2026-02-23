import pika
import json
import os

def send_ai_feedback(repo_id, commit_sha, ai_feedback, channel):

    result_payload = {

        "repoId": repo_id,
        "commitSha": commit_sha,
        "aiFeedback": ai_feedback
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