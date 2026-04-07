FROM ubuntu:22.04

# 1. System setup
ENV DEBIAN_FRONTEND=noninteractive

# Install basic tools + Java + Python + Maven
RUN apt-get update && apt-get install -y \
    openjdk-21-jdk python3-pip supervisor curl maven && \
    rm -rf /var/lib/apt/lists/*

# Install Modern Node.js (v20)
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs

# 2. App Setup
WORKDIR /app
COPY . .

# Install Python dependencies (Added --break-system-packages for Ubuntu 22.04 compat)
RUN pip3 install --no-cache-dir --break-system-packages fastapi uvicorn pika requests python-dotenv

# 3. Build Spring Backend
WORKDIR /app/apps/orchestrator
RUN mvn clean package -DskipTests

# 4. Build Next.js Frontend
WORKDIR /app/apps/argus-frontend
# Ensure it builds for production
RUN npm install --legacy-peer-deps
RUN npm run build

# 5. Final Prep
WORKDIR /app
# Move the supervisor config to the correct system path
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# HF Spaces exposes 7860
EXPOSE 7860

# Start Supervisor with the specific config path
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]