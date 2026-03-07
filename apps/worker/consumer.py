import pika
import json
import asyncio
from reviewer import get_ai_review
from messenger import send_ai_feedback
from vectorizer import get_code_embedding
from database import query_similar_reviews, upsert_review

def process_job(ch, method, properties, body, results_channel):

    try:
        data = json.loads(body)
        print("\n" + "="*30)
        print("New job received!")
        repo_id = data.get('repoId')
        commit_sha = data.get('commitSha')

        print(f"Repo ID: {repo_id}")
        print(f"Commit: {commit_sha}")

        # Files to ignore (don't waste AI tokens on these)
        IGNORE_LIST = ['package-lock.json', 'yarn.lock', 'pom.xml', '.gitignore', '.log']

        # We will collect all file reviews into this string
        full_commit_context = ""

        files = data.get('files', [])
        for file_map in files:
            file_name = file_map.get('file', 'Unknown')
            patch_data = file_map.get('patch')

            # skip if no patch data
            if not patch_data or any(file_name.endswith(ext) for ext in IGNORE_LIST):
                print(f" -> Skipping {file_name} (No changes or ignored)")
                continue

            print(f" -> Processing {file_name}...")

            file_context = f"\nFILE: {file_name}\nDIFF:\n{patch_data}\n"
            full_commit_context += file_context

        # sned to ai only if we have something
        if full_commit_context:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)

            vector = loop.run_until_complete(get_code_embedding(full_commit_context))

            past_reviews = []
            if vector:
                past_reviews = query_similar_reviews(vector, top_k=3)
                print(f"Found {len(past_reviews)} similar past reviews in Pinecone.")

            print("Step 2: Sending to Gemini for review...")
            ai_response = get_ai_review(full_commit_context, past_reviews)

            if vector and ai_response:
                metadata = ai_response.model_dump()
                metadata["repo_id"] = str(repo_id)
                upsert_review(commit_sha, vector, metadata)

            send_ai_feedback(repo_id, commit_sha, ai_response, results_channel)
            # send the ai response back to java

        else:
            print("No significant code changes to review.")

        # delivery_tag = unique_id assigned to message by rabbit, method.delivery_tag is where pika stores that id
        ch.basic_ack(delivery_tag=method.delivery_tag)
        print("Job acknowledged.")

    except Exception as e:
        print(f"Error processing job: {e}")

    print("="*30 + "\n")


def start_worker():

    # connection to RabbitMQ assuming its on localhost with default credentials
    # blocking = it will wait and hold the thread until a message is received
    connection = pika.BlockingConnection(pika.ConnectionParameters(host='localhost'))

    # we work with the channel and not the connection directly,
    # the channel is the medium through which we send and receive messages
    consume_channel = connection.channel()

    # declaring the queue which should exactly match the one named in java
    # use durable = true because java file does so
    consume_channel.queue_declare(queue='orchestrator-queue', durable=True)

    # only give the worker one message at a time. dont give another one until the current message gets acked
    consume_channel.basic_qos(prefetch_count=1)

    # separate channel for publishing results
    results_channel = connection.channel()
    results_channel.queue_declare(queue='results-queue', durable=True)
    results_channel.basic_qos(prefetch_count=1)

    consume_channel.basic_consume( # consume messages
        queue = "orchestrator-queue",
        on_message_callback=lambda ch, method, properties, body:
            process_job(ch, method, properties, body, results_channel),

        # ack = acknowledgement, we set it to false because we want it to resend the message in case of a crash
        auto_ack = False
    )

    # log message
    print("python worker is waiting for messages...")

    #starts an infinite loop that waits for messages and calls the callback function when a message is received
    consume_channel.start_consuming()
