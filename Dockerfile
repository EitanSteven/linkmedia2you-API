FROM node:22-slim

# 1. Instala dependencias como root
RUN apt-get update && \
    apt-get install -y \
    curl \
    python3 \
    ffmpeg \
    && apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# 2. Configura usuario y directorio
WORKDIR /app
RUN chown -R node:node /app

# 3. Copia archivos con permisos correctos ANTES de cambiar de usuario
COPY --chown=node:node package*.json ./

# 4. Instala dependencias como root temporalmente
RUN npm install --omit=dev

# 5. Cambia a usuario no-root
USER node

# 6. Copia el resto del código
COPY --chown=node:node . .

# 7. Configura cookies y directorios
RUN mkdir -p cookies downloads uploads && \
    chmod 755 cookies

COPY --chown=node:node ./cookies /app/cookies

EXPOSE 3000
CMD ["node", "app.js"]