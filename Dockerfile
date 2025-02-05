FROM node:20.18.0

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install -g pm2 && npm install

COPY . .

ENV NODE_ENV=production

EXPOSE 8000

CMD ["pm2-runtime", "start", "app.js", "--name", "backend"]
