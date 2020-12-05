FROM node:alpine

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json .
RUN npm install

COPY src ./src
COPY public ./public
COPY server.js ./server.js
COPY webpack.config.js ./webpack.config.js

EXPOSE 3000

CMD ["npm", "start"]