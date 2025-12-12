FROM node:20-bullseye

RUN apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install -y \
  ffmpeg \
  clamav \
  clamav-daemon \
  clamav-freshclam \
  curl \
  && rm -rf /var/lib/apt/lists/*

# Update clamav DB (best effort)
RUN freshclam || true

WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci || true

COPY . .

# Worker runs with system ffmpeg & clamdscan available
CMD ["node", "worker.js"]