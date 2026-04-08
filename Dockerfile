FROM ubuntu:22.04
ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y \
    openjdk-21-jdk python3-pip supervisor curl maven && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY . .

RUN pip3 install --no-cache-dir --break-system-packages -r apps/worker/requirements.txt

WORKDIR /app/apps/orchestrator
RUN mvn clean package -DskipTests

WORKDIR /app
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf
EXPOSE 7860
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]