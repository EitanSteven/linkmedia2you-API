FROM node:22-slim

# Instala dependencias completas para Chrome headless
RUN apt-get update && \
    apt-get install -y \
    python3 \
    python3-pip \
    ffmpeg \
    curl \
    libnss3 \
    libxss1 \
    libasound2 \
    libxtst6 \
    libgtk-3-0 \
    libgbm1 \
    libx11-xcb1 \
    xvfb \
    fonts-liberation \
    dbus \
    --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

# Instala Chrome estable y yt-dlp
RUN curl -sSL https://dl.google.com/linux/linux_signing_key.pub | apt-key add - && \
    echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list && \
    apt-get update && \
    apt-get install -y google-chrome-stable && \
    pip3 install --upgrade yt-dlp

# Configura usuario y directorios
RUN useradd -m appuser && \
    mkdir -p /app/{downloads,cookies,chrome-profile} && \
    chown -R appuser:appuser /app

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Script de entrada mejorado
RUN echo '#!/bin/bash\n\
    XVFB_WHD=${XVFB_WHD:-1280x720x16}\n\
    export DISPLAY=${DISPLAY:-:99}\n\
    \n\
    # Inicia Xvfb\n\
    Xvfb $DISPLAY -ac -screen 0 $XVFB_WHD -nolisten tcp &\n\
    sleep 3\n\
    \n\
    # Crea perfil Chrome persistente y acepta términos de YouTube\n\
    google-chrome-stable --no-first-run --no-default-browser-check \\\n\
    --user-data-dir=/app/chrome-profile \\\n\
    --remote-debugging-port=9222 \\\n\
    https://www.youtube.com/ --force-device-scale-factor=1.0 \\\n\
    --window-size=1400,900 &\n\
    sleep 10\n\
    \n\
    # Extrae cookies en formato correcto\n\
    yt-dlp --cookies-from-browser chrome:/app/chrome-profile --cookies /app/cookies/cookies.txt \\\n\
    --verbose --ignore-errors --force-ipv4\n\
    \n\
    # Inicia la API\n\
    node app.js' > entrypoint.sh && \
    chmod +x entrypoint.sh

USER appuser
EXPOSE 3000
CMD ["./entrypoint.sh"]