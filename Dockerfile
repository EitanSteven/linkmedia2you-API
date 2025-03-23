FROM node:20-alpine

# Instalar dependencias necesarias
RUN apk add --no-cache \
    python3 \
    ffmpeg \
    curl \
    && wget -O /usr/local/bin/yt-dlp https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp \
    && chmod a+rx /usr/local/bin/yt-dlp

WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .

CMD ["node", "app.js"]