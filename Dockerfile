# Use a Python base image that also allows installation of Node.js
FROM python:3.10-slim

# Declare build args for environment variables you need at build time
ARG REACT_APP_GRAPHQL_URI

# Set them as ENV so that create-react-app can see them
ENV REACT_APP_GRAPHQL_URI=$REACT_APP_GRAPHQL_URI

RUN apt-get update && apt-get install -y curl gnupg build-essential \
  && curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
  && apt-get install -y nodejs \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY . .

RUN pip install --no-cache-dir -r backend/requirements.txt

# Now that REACT_APP_GRAPHQL_URI is an ENV variable,
# create-react-app will see it at build time
RUN npm install --legacy-peer-deps
WORKDIR /app/frontend
RUN npm run build

WORKDIR /app/backend
RUN npm install --legacy-peer-deps

EXPOSE 5000
CMD ["npm", "start"]
