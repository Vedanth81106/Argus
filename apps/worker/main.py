import pika
import json
import os
import threading
from fastapi import FastAPI
from dotenv import load_dotenv
from reviewer import get_ai_review

load_dotenv()

app = FastAPI(title = "Argus AI worker")

def process_job(ch, method, properties, body):
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

            # extract added/removed lines
            added = [line[1:] for line in patch_data.split('\n') if line.startswith('+')]
            removed = [line[1:] for line in patch_data.split('\n') if line.startswith('-')]

            file_context = f"\nFILE: {file_name}\nDIFF:\n{patch_data}\n"
            full_commit_context += file_context

        # sned to ai only if we have something
        if full_commit_context:
            print("Sending to Gemini for review...")
            ai_response = get_ai_review(full_commit_context)
            print(f"AI Feedback:\n{ai_response}")

        else:
            print("No significant code changes to review.")

        # delivery_tag = unique_id assigned to message by rabbit, method.delivery_tag is where pika stores that id
        ch.basic_ack(delivery_tag=method.delivery_tag)
        print("Job acknowledged.")

    except Exception as e:
        print(f"Error processing job: {e}")

    print("="*30 + "\n")

def start_consumer():

    # connection to RabbitMQ assuming its on localhost with default credentials
    # blocking = it will wait and hold the thread until a message is received
    connection = pika.BlockingConnection(pika.ConnectionParameters(host='localhost'))
    # we work with the channel and not the connection directly,
    # the channel is the medium through which we send and receive messages
    channel = connection.channel()

    # declaring the queue which should exactly match the one named in java
    # use durable = true because java file does so
    channel.queue_declare(queue='orchestrator-queue', durable=True)

    # only give the worker one message at a time.
    #dont give another one until the current message gets acked
    channel.basic_qos(prefetch_count=1)

    channel.basic_consume( # consume messages
        queue = "orchestrator-queue",
        on_message_callback = process_job,

        # ack = acknowledgement, we set it to false because we want it to resend the message in case of a crash
        auto_ack = False
    )
    
    # log message
    print("python worker is waiting for messages...")

    #starts an infinite loop that waits for messages and calls the callback function when a message is received
    channel.start_consuming()


# auto run this function when the app starts
@app.on_event("startup")
async def startup_event():

    # we run start_consumer method in a separate thread
    # because it is an infinite loop and will block normal execution
    thread = threading.Thread(target=start_consumer, daemon = True) # daemon true = thread stops when server/app stops
    thread.start()

@app.get("/health")
def health_check():
    return {"status": "ok"}