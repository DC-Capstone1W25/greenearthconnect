# Python base image that also allows installation of Node.js
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

# Copy the entire repository into the container (minus what’s excluded by .dockerignore)
COPY . .

#  Python requirements.txt for backend:
RUN pip install --no-cache-dir -r backend/requirements.txt

# Install all Node dependencies at the root package.json)
RUN npm install --legacy-peer-deps

# Build the frontend
WORKDIR /app/frontend
RUN npm run build

# Return to the backend folder and install dependencies again if needed
WORKDIR /app/backend
RUN npm install --legacy-peer-deps

# Expose the port your backend uses
EXPOSE 5000

# Start the backend server
CMD ["npm", "start"]
