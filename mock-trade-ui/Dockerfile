FROM node:20

WORKDIR /app

COPY package.json yarn.lock ./

# Install dependencies using Yarn
RUN yarn install

COPY . .

EXPOSE 5173

CMD ["yarn", "dev", "--host"]