FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm install prisma -g
RUN npx prisma generate
ENV PORT=3000
CMD [ "npm", "start" ]
