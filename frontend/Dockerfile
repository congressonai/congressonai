# Use a Node.js image
FROM node:23.3.0

# Set working directory
WORKDIR /usr/src/app/frontend

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

RUN npm install -g serve

# Expose the port the app runs on
EXPOSE 5173

CMD ["serve", "-s", "dist", "-l", "5173"]