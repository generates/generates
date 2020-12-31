FROM node:15.4-buster

ENV NODE_ENV production

RUN mkdir /opt/app
WORKDIR /opt/app

COPY yarn.lock .
COPY package.json .
RUN yarn

COPY index.js .

CMD ["node", "index.js"]
