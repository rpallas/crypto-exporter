FROM node:carbon@sha256:26e4c77f9f797c3993780943239fa79419f011dd93ae4e0097089e2145aeaa24
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
# RUN npm install --only=production
COPY . .
EXPOSE 3000
CMD [ "npm", "start" ]
