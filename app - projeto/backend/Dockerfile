FROM node:20-alpine AS dev
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma
RUN npm install
COPY . .
RUN npx prisma generate
CMD ["npm", "run", "dev"]

FROM node:20-alpine AS prod
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma
RUN npm install --omit=dev
COPY . .
RUN npx prisma generate
RUN npm run build
CMD ["npm", "run", "start"]