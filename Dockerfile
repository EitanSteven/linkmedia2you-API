FROM node:22-slim

# 1. Instalar dependencias del sistema incluyendo FFmpeg
RUN apt-get update && \
    apt-get install -y \
    curl \
    python3 \
    chromium \
    ffmpeg \
    && apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# 2. Instalar yt-dlp
RUN curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp && \
    chmod a+rx /usr/local/bin/yt-dlp

# 3. Configurar entorno para Puppeteer
WORKDIR /app
RUN chown -R node:node /app
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# 4. Copiar e instalar dependencias de Node
COPY --chown=node:node package*.json ./
RUN npm install --omit=dev

# 5. Configurar usuario no-root
USER node

# 6. Copiar código de la aplicación
COPY --chown=node:node . .

# 7. Crear directorios necesarios
RUN mkdir -p cookies downloads uploads

EXPOSE 3000
CMD ["node", "app.js"]