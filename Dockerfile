FROM node:carbon@sha256:6d6c00a85a9859339f38eeace91b1f5554e7c7cf1165d3517cff991bf798ee2f
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
# RUN npm install --only=production
COPY . .
EXPOSE 3000
CMD [ "npm", "start" ]
