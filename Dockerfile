FROM node:20-alpine

# Instalar dependencias principales
RUN apk add --no-cache \
    python3 \
    ffmpeg \
    chromium \
    && wget -O /usr/local/bin/yt-dlp https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp \
    && chmod a+rx /usr/local/bin/yt-dlp

# Configurar entorno
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .

# Crear directorios necesarios
RUN mkdir -p /app/{cookies,downloads,uploads} \
    && chown -R node:node /app

USER node

EXPOSE 3000
CMD ["node", "app.js"]