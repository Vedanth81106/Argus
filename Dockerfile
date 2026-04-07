FROM ubuntu:22.04

# 1. System setup
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y \
    openjdk-21-jdk python3-pip nodejs npm \
    postgresql-14 rabbitmq-server supervisor curl && \
    rm -rf /var/lib/apt/lists/*

# 2. Database Init (Using your Secret Names)
USER postgres
RUN /etc/init.d/postgresql start && \
    psql --command "CREATE USER ${DB_USER} WITH SUPERUSER PASSWORD '${DB_PASSWORD}';" && \
    createdb -O ${DB_USER} neondb
USER root

# 3. App Setup
WORKDIR /app
COPY . .

# 4. Build Spring
WORKDIR /app/apps/orchestrator
RUN ./mvnw clean package -DskipTests

# 5. Build Frontend
WORKDIR /app/apps/argus-frontend
RUN npm install && npm run build

# 6. Final Prep
WORKDIR /app
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# HF Spaces usually exposes port 7860
EXPOSE 7860
CMD ["/usr/bin/supervisord"]