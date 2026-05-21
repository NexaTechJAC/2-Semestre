FROM node:20-alpine AS dev
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY prisma ./prisma
COPY prisma.config.js ./
RUN npx prisma generate
EXPOSE 3000
CMD ["npm", "run", "dev"]