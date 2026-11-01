# Node-RED + simulador (F2 / F4)
# Servidor HTTP simple de la API en lugar de flujos de Node-RED.
FROM node:24-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install --omit=dev

COPY . .

ENV NODE_ENV=production

CMD ["node", "start.js"]
