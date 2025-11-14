FROM node:22-alpine

WORKDIR client
COPY package.json package-lock.json .
RUN npm install
COPY . .
EXPOSE 5173

CMD [ "npm", "run", "dev:docker" ]