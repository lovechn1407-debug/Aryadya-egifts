# Node 20 with build tools needed for Baileys native dependencies
FROM node:20-slim

# Install build tools for native module compilation
RUN apt-get update && apt-get install -y \
    git \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./

# Use --legacy-peer-deps to avoid peer dependency conflicts
RUN npm install --legacy-peer-deps

COPY . .

EXPOSE 3001

CMD ["npm", "start"]
