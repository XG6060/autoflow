FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY tsconfig.json ./
COPY prisma ./prisma
COPY src ./src
RUN npm run db:generate
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./
COPY runner-linux ./engine-bin/runner
RUN chmod +x ./engine-bin/runner

ENV NODE_ENV=production
ENV PORT=3001
ENV ENGINE_PATH=/app/engine-bin/runner

EXPOSE 3001

CMD ["sh", "-c", "npx prisma db push --skip-generate && node dist/server.js"]
