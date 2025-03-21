FROM node:22-slim

# 1. Instala dependencias necesarias (agregar curl)
RUN apt-get update && \
    apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    ffmpeg \
    curl \ 
    && rm -rf /var/lib/apt/lists/*

# 2. Instala yt-dlp
RUN python3 -m pip install --user --break-system-packages yt-dlp && \
    mv /root/.local/bin/yt-dlp /usr/local/bin/yt-dlp

# Configura entorno
WORKDIR /app

# 3. Copia solo lo necesario en orden óptimo
COPY package*.json ./
RUN npm install

# Copia cookies ANTES que el código fuente
COPY ./cookies /app/cookies
COPY . .

# 4. Corrige permisos y crea directorios
RUN mkdir -p ./downloads ./uploads && \
    chmod 755 ./cookies/cookies.txt && \
    chown -R node:node /app

USER node  # Ejecutar como usuario no-root

EXPOSE 3000
CMD ["node", "app.js"]