# Usa Node.js 22 como base
FROM node:22-slim

# Instala dependencias del sistema (Python, FFmpeg)
RUN apt-get update && \
    apt-get install -y \
    python3 \
    python-is-python3 \
    ffmpeg \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Instala yt-dlp globalmente
RUN curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp && \
    chmod a+rx /usr/local/bin/yt-dlp

# Configura el entorno de trabajo
WORKDIR /app

# Copia e instala dependencias de Node.js
COPY package*.json ./
RUN npm install

# Copia el código fuente
COPY . .

# Crea directorios para archivos temporales
RUN mkdir -p ./downloads && mkdir -p ./uploads

# Expone el puerto y ejecuta la API
EXPOSE 3000
CMD ["node", "app.js"]