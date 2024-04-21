# Use a lightweight Node.js base image
FROM node:alpine AS builder

# Set working directory
WORKDIR /app

COPY package*.json .
COPY main.js .
COPY index.html .

RUN mkdir -p components
RUN mkdir -p assets
COPY ./components ./components
COPY ./assets ./assets

# Install dependencies
RUN npm install --production

# Use Nginx base image
FROM nginx:alpine

# Copy built files from the previous stage
COPY --from=builder /app /usr/share/nginx/html
COPY --from=builder /app/components /usr/share/nginx/html/components

