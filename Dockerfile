# Stage 1: Install dependencies for development
FROM node:20-alpine AS development
WORKDIR /usr/src/app
COPY package.json package-lock.json tsconfig.json ./

# Install all node_modules, including dev dependencies
RUN npm install

# Stage 2: Build the app for development
FROM development AS build-dev
ARG NODE_ENV=dev
ARG PORT=3000

ENV NODE_ENV=${NODE_ENV}
ENV PORT=${PORT}

WORKDIR /usr/src/app
COPY . .
# Expose port for development
EXPOSE ${PORT}

# Copy development entrypoint and grant execution permissions 
COPY entrypoint.dev.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Start the application in watch mode using the entrypoint script
ENTRYPOINT ["/entrypoint.sh"]

# Stage 3: Install dependencies for production
FROM node:20-alpine AS production-deps
WORKDIR /usr/src/app
COPY package.json package-lock.json tsconfig.json ./
# Install only production dependencies
RUN npm install --production --no-audit --legacy-peer-deps

# Stage 4: Build the app for production
FROM production-deps AS build-prod
WORKDIR /usr/src/app
COPY --from=production-deps /usr/src/app/node_modules ./node_modules
COPY src ./src
COPY package.json package-lock.json tsconfig.json ./
RUN npm run build

# Stage 5: Build the production image with minimal footprint
FROM node:20-alpine AS production
# Install curl to make healthcheck requests
RUN apk add --no-cache curl

ARG NODE_ENV=prod
ARG PORT=3000

ENV NODE_ENV=${NODE_ENV}
ENV PORT=${PORT}
WORKDIR /usr/src/app

# Copy only the necessary production files
COPY --from=build-prod /usr/src/app/dist ./dist
COPY --from=build-prod /usr/src/app/node_modules ./node_modules
COPY package.json package-lock.json .npmrc tsconfig.json ./

EXPOSE ${PORT}

# Start the application in production mode using the entrypoint script
COPY entrypoint.prod.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]