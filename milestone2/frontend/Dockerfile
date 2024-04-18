# Use a lightweight Node.js base image
FROM node:alpine AS builder

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy your JavaScript files
COPY index.html .
COPY main.js .
COPY ./assets ./assets
COPY ./components ./components

# Use Nginx base image
FROM nginx:alpine

# Copy built files from the previous stage
COPY --from=builder /app /usr/share/nginx/html

