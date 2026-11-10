FROM node:22-alpine
WORKDIR /app
COPY package.json ./
COPY server ./server
COPY code ./code
ENV NODE_ENV=production
EXPOSE 8787
CMD ["node", "server/server.js"]
