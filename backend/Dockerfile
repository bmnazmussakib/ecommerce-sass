# Base image
FROM node:20-alpine AS development

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci

COPY . .

# Generate Prisma clients for both Master and Tenant
RUN npx prisma generate --schema=./prisma/master.prisma
RUN npx prisma generate --schema=./prisma/tenant.prisma

# Build the NestJS app
RUN npm run build

EXPOSE 8888

CMD ["npm", "run", "start:dev"]
