# Use a lightweight Node.js base image
FROM node:alpine AS builder

# Set working directory
WORKDIR /app

COPY package*.json .
COPY index.html .
COPY main.js .
COPY finisher-header.es5.min.js .

RUN rm -rf ./components
RUN rm -rf ./assets
RUN mkdir -p components
RUN mkdir -p assets

COPY ./components/ ./components/
COPY ./assets/ ./assets/

# Install dependencies
RUN npm install --production

# Use Nginx base image
FROM nginx:alpine

# Copy built files from the previous stage
COPY --from=builder /app /usr/share/nginx/html
COPY --from=builder /app/components /usr/share/nginx/html/components
COPY --from=builder /app/assets /usr/share/nginx/html/assets
