<<<<<<< HEAD
# Use an official Node.js runtime as a base image
FROM node:14

# Set the working directory in the container
WORKDIR /usr/src/index

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install Node.js dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Expose the port that the app runs on
EXPOSE 3001

# Command to run the application
=======
# Use an official Node.js runtime as a base image
FROM node:14

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install Node.js dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Expose the port that the app runs on
EXPOSE 3000

# Command to run the application
>>>>>>> 8776e0fb22ff8ef80961229e3ed14113ad2b6326
CMD ["node", "index.js"]