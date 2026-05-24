# Stage 1: сборка React-приложения
FROM node:18-alpine AS client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# Stage 2: сервер + статика
FROM node:18-alpine
WORKDIR /app
COPY server/package*.json ./
RUN npm install --omit=dev
COPY server/ ./
COPY --from=client-builder /app/client/dist ./public
EXPOSE 3000
CMD ["node", "server.js"]
