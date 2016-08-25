FROM node

WORKDIR /app

COPY package.json /app/
RUN npm install

COPY server.js /app/

CMD /app/server.js

EXPOSE 8090
