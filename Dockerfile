FROM ubuntu:22.04

# 1. System setup (Only Java, Python, Node, and Supervisor)
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y \
    openjdk-21-jdk python3-pip nodejs npm supervisor curl && \
    rm -rf /var/lib/apt/lists/*

# 2. App Setup
WORKDIR /app
COPY . .

# 3. Build Spring Backend
WORKDIR /app/apps/orchestrator
# Fix permissions for the maven wrapper
RUN chmod +x mvnw && ./mvnw clean package -DskipTests

# 4. Build Next.js Frontend
WORKDIR /app/apps/argus-frontend
RUN npm install && npm run build

# 5. Final Prep
WORKDIR /app
# Ensure supervisor config is moved to the right spot
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# HF Spaces uses 7860
EXPOSE 7860

# We point directly to our config file
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]