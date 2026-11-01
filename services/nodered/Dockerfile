# Node-RED + simulador (F2 / F4)
# En Render: un solo contenedor con dos procesos (Node-RED + simulador).
FROM nodered/node-red:3

USER root
RUN npm install --omit=dev --no-audit --no-fund

USER node-red

WORKDIR /data

COPY --chown=node-red:node-red . /data/

ENV NODE_ENV=production

CMD ["node", "start.js"]
