# Build stage to compile Typescript
FROM node:16 AS build

# Create and sets working directory
WORKDIR /usr/src/app

# Copy package definition and dependency list
COPY package*.json tsconfig.json ./
# Install dependencies
RUN npm install

# Copy source codes
COPY ./src ./src

# Build from source code
RUN npm run build



# Running stage
FROM node:16 AS production
ENV NODE_ENV=production

# Create and sets working directory
WORKDIR /usr/src/app

# Copy package definition and dependency list
COPY package*.json ./
# Install dependencies
RUN npm install --production

# Copy compiled codes
COPY --from=build /usr/src/app/build ./build
COPY ./data ./data

# Opens port
#EXPOSE 3000

# Runs node as non-root
USER node
CMD [ "node", "build/main.js" ]
