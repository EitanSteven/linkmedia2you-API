FROM node:22-slim

# Instala dependencias con limpieza automática
RUN apt-get update && \
    apt-get install -y \
    curl \
    python3 \
    ffmpeg \
    && apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Configura usuario no-root primero
RUN useradd -m appuser && mkdir -p /app && chown -R appuser:appuser /app
USER appuser
WORKDIR /app

# Copia solo lo necesario para aprovechar caché
COPY package*.json ./
RUN npm install --omit=dev

# Copia el resto del código y cookies
COPY . .
COPY --chown=appuser:appuser ./cookies /app/cookies

# Crea directorios con permisos explícitos
RUN mkdir -p downloads uploads && \
    chmod 755 cookies/cookies.txt

EXPOSE 3000
CMD ["node", "app.js"]