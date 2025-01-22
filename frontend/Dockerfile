FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .
#Substituir depois por uma porta em um arquivo .env FRONTEND_PORT=3000 por exemplo.

EXPOSE 3000 

CMD ["npm", "run", "dev", "--", "-H", "0.0.0.0", "-p", "3000"]
