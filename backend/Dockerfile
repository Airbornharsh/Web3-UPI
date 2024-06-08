FROM node:20

WORKDIR /usr/src/app

COPY package.json ./
COPY yarn.lock ./

RUN npm install -g nodemon

RUN yarn

COPY . .

EXPOSE 8000

CMD ["yarn", "docker:dev"]
