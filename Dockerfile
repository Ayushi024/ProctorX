# Use Node.js 14 as the base image
FROM node:14.2.0

# Set working directory
WORKDIR /app

# Copy package files for the root
COPY package*.json ./

# Install root-level dependencies
RUN npm install 

# Copy the entire application
COPY . .

RUN cd client

RUN npm install --legacy-peer-deps

RUN npm run build

RUN cd ..

# Expose the port
EXPOSE 3001

EXPOSE 3000

# Start the server
CMD ["npm","run", "dev"]
