# Use a lightweight Node.js base image
FROM node:alpine AS builder

# Set working directory
WORKDIR /app

COPY package*.json .
COPY main.js .
COPY index.html .

RUN rm -rf ./components
RUN rm -rf ./assets
RUN mkdir -p components
RUN mkdir -p assets
RUN mkdir -p assets/css
RUN mkdir -p assets/img

COPY ./components ./components
COPY ./assets/css ./assets/css
COPY ./assets/img ./assets/img

# Install dependencies
RUN npm install --production

# Use Nginx base image
FROM nginx:alpine

# Copy built files from the previous stage
COPY --from=builder /app /usr/share/nginx/html
COPY --from=builder /app/components /usr/share/nginx/html/components

