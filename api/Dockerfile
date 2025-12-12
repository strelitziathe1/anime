FROM node:20-bullseye-slim

WORKDIR /usr/src/app

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .

RUN npm run build

EXPOSE 4000
CMD ["node", "dist/main.js"]