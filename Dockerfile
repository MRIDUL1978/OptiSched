1. Start with linux environment that  has Node.js pre installed 
FROM node:20-bullseye

2. Install the C++ compiler(g++) inside the linux container
RUN apt-get update && apt-get install -y g++

3. Set the working directory inside the container
WORKDIR /app

4. Copy the package files and install the dependencies
COPY package*.json ./
RUN npm install

5. Copy the rest of the application code into the container
COPY . .

6. Compile the c++ engine for linux
RUN g++ main.cpp -O2 -o engine_linux

7. Build the Next.js application
RUN npm run build

8. Expose the port that the application will run on
EXPOSE 3000

9. Start the application
CMD ["npm", "start"]