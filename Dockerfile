FROM node:22-slim

# 1. Instala dependencias necesarias
RUN apt-get update && \
    apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \ 
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# 2. Instala yt-dlp como usuario root temporalmente
RUN python3 -m pip install --user --break-system-packages yt-dlp && \
    mv /root/.local/bin/yt-dlp /usr/local/bin/yt-dlp

# Configura entorno
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Crea directorios para archivos temporales
RUN mkdir -p ./downloads && mkdir -p ./uploads

# Expone el puerto y ejecuta la API
EXPOSE 3000
CMD ["node", "app.js"]

# Retornando Dockerfile