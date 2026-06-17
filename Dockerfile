# Use the official Node.js 20 Alpine image for a small footprint
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install only production dependencies to keep the image size small
RUN npm ci --only=production

# Copy the rest of the application source code
COPY . .

# Set environment variables (can be overridden at runtime)
ENV PORT=8000
ENV NODE_ENV=production

# Expose the port the app runs on
EXPOSE 8000

# Start the application
CMD ["node", "index.js"]
