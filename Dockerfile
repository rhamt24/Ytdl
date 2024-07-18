FROM node:14

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN mkdir -p downloads

EXPOSE 3000
CMD ["node", "index.js"]
