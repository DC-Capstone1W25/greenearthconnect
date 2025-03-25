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

# Copy the entire repository into the container
COPY . .

# Install all dependencies using the root package.json (workspaces)
RUN npm install --legacy-peer-deps

# Build the frontend
WORKDIR /app/frontend
RUN npm run build

# (Optional) If you need to copy the frontend build into the backend folder so your server can serve it,
# you can uncomment the next line. Alternatively, ensure your backend's server.js knows to serve files from /app/frontend/build.
# RUN cp -R build ../backend/build

# Install backend Node dependencies (this may be already done via workspaces, but to be safe)
WORKDIR /app/backend
RUN npm install --legacy-peer-deps

# Expose the port your backend uses (assumed to be 5000)
EXPOSE 5000

# Start the backend server
CMD ["npm", "start"]
