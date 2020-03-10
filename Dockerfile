FROM node:13.10.1-buster

EXPOSE 8080
WORKDIR /fido2020

COPY package.json /fido2020
RUN npm install

COPY . /fido2020

CMD ["npm", "start"]
