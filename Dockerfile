FROM ubuntu:22.04

# 1. System setup (Added 'maven' to the install list)
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y \
    openjdk-21-jdk python3-pip nodejs npm supervisor curl maven && \
    rm -rf /var/lib/apt/lists/*

# 2. App Setup
WORKDIR /app
COPY . .

# 3. Build Spring Backend (Using global 'mvn' instead of './mvnw')
WORKDIR /app/apps/orchestrator
RUN mvn clean package -DskipTests

# 4. Build Next.js Frontend
WORKDIR /app/apps/argus-frontend
RUN npm install && npm run build

# 5. Final Prep
WORKDIR /app
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# HF Spaces uses 7860
EXPOSE 7860

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]