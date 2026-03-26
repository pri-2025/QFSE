FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Generate Prisma client
COPY prisma ./prisma
RUN npx prisma generate

# Copy source
COPY . .

# Build TypeScript
RUN npm run build

EXPOSE 3001

CMD ["node", "dist/index.js"]
