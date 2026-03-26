FROM node:20-alpine

# Install curl for healthcheck
RUN apk add --no-cache curl

WORKDIR /app

# 1. Install ALL deps (including dev — need tsx for seed)
COPY package*.json ./
RUN npm ci

# 2. Generate Prisma client
COPY prisma ./prisma
RUN npx prisma generate

# 3. Copy source and build
COPY . .
RUN npm run build

# 4. Compile seed to JS too (so entrypoint can run it without tsx)
RUN node -e "try { require('./dist/prisma/seed.js') } catch(e) {}" 2>/dev/null || true

EXPOSE 3001

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
