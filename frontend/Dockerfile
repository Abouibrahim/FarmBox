FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Start command (will be overridden in docker-compose for dev)
CMD ["npm", "run", "dev"]
