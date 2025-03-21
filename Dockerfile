# Usa Node.js 22 como base
FROM node:22-slim

# Instala dependencias críticas
RUN apt-get update && \
    apt-get install -y \
    python3 \
    python3-pip \
    ffmpeg \
    curl \
    libnss3 \
    libgbm1 \
    libasound2 \
    xvfb \
    && rm -rf /var/lib/apt/lists/*

# Instala yt-dlp + Chrome para extraer cookies
RUN pip3 install --upgrade yt-dlp && \
    curl -sSL https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb -o chrome.deb && \
    apt-get install -y ./chrome.deb && \
    rm chrome.deb

# Configura un usuario no-root y directorios
RUN useradd -m appuser && \
    mkdir -p /app/{downloads,cookies} && \
    chown -R appuser:appuser /app

WORKDIR /app

# Copia solo lo necesario
COPY package*.json ./
RUN npm install
COPY . .

# Script para extraer cookies de Chrome automáticamente
RUN echo '#!/bin/bash\n\
    xvfb-run yt-dlp --cookies-from-browser chrome:temp --cookies /app/cookies/cookies.txt --ignore-errors\n\
    node app.js' > entrypoint.sh && \
    chmod +x entrypoint.sh

USER appuser

EXPOSE 3000
CMD ["./entrypoint.sh"]