FROM node:22-slim

# Instala dependencias esenciales
RUN apt-get update && \
    apt-get install -y \
    python3 \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Instala yt-dlp
RUN python3 -m pip install --upgrade yt-dlp

# Configura entorno
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Copia cookies manuales
COPY cookies /app/cookies

# Script para validar formato
RUN echo '#!/bin/bash\n\
    if ! head -n 1 /app/cookies/cookies.txt | grep -q "HTTP Cookie File"; then\n\
    echo "ERROR: Formato incorrecto de cookies.txt" >&2\n\
    exit 1\n\
    fi\n\
    node app.js' > entrypoint.sh && \
    chmod +x entrypoint.sh

CMD ["./entrypoint.sh"]