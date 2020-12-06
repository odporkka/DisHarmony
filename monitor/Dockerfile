FROM node:alpine

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json .
RUN npm install
COPY src /usr/src/app/src

ENV PORT=3000
EXPOSE 3000

CMD ["npm", "start"]
