FROM node:22-slim

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=7860

COPY package*.json ./
RUN npm ci --omit=dev

COPY server.js ./
COPY public ./public

# Drop root: run as the unprivileged built-in "node" user (defense in depth)
USER node

EXPOSE 7860

CMD ["npm", "start"]
