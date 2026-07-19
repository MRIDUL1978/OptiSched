# Start with linux environment that  has Node.js pre installed 
FROM node:20-bullseye

# Install the C++ compiler(g++) inside the linux container
RUN apt-get update && apt-get install -y g++

# Set the working directory inside the container
WORKDIR /app

# Copy the package files and install the dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application code into the container
COPY . .

# Compile the c++ engine for linux
RUN g++ main.cpp -O2 -o engine_linux

# Build the Next.js application
RUN npm run build

# Expose the port that the application will run on
EXPOSE 3000

# Start the application
CMD ["npm", "start"]