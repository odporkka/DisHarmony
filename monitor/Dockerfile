FROM node:alpine

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json .
RUN npm install

COPY src ./src
COPY public ./public

EXPOSE 3000

CMD ["npm", "start"]