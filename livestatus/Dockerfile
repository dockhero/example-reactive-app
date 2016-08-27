FROM node

WORKDIR /app

COPY package.json /app/
RUN npm install

COPY *.js /app/

CMD /app/server.js

EXPOSE 8090
