# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci

COPY . .

# Generate Prisma clients for both Master and Tenant
RUN npx prisma generate --schema=./prisma/master.prisma
RUN npx prisma generate --schema=./prisma/tenant.prisma

# Build the NestJS app
RUN npm run build

# Stage 2: Production
FROM node:20-alpine AS production

WORKDIR /usr/src/app

COPY package*.json ./

# Only install production dependencies
RUN npm ci --omit=dev

# Copy built application and generated clients from builder
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/src/generated ./src/generated
COPY --from=builder /usr/src/app/prisma ./prisma

ENV NODE_ENV=production

EXPOSE 8888

CMD ["npm", "run", "start:prod"]
