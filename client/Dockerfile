FROM node:alpine

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json .
RUN npm install

COPY src ./src
COPY public ./public

ENV PORT=3001
EXPOSE 3001

CMD ["npm", "start"]
