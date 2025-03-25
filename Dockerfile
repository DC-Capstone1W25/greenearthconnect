# Use a Python base image that also allows installation of Node.js
FROM python:3.10-slim

# Install system dependencies and Node.js (using Node 18)
RUN apt-get update && apt-get install -y \
    curl \
    gnupg \
    build-essential \
 && curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
 && apt-get install -y nodejs \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /app

# Copy the entire repository into the container (excluding files in .dockerignore)
COPY . .

# Install Python dependencies for the backend
RUN pip install --no-cache-dir -r backend/requirements.txt

# Install all Node dependencies (using root package.json and workspaces)
RUN npm install --legacy-peer-deps

# Build the frontend
WORKDIR /app/frontend
RUN npm run build

# Return to the backend folder and (re)install backend Node dependencies (if necessary)
WORKDIR /app/backend
RUN npm install --legacy-peer-deps

# Expose the port your backend uses (assumed to be 5000)
EXPOSE 5000

# Start the backend server (ensure backend's start script runs server)
CMD ["npm", "start"]
