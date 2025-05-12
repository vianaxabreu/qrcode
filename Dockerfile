# node
FROM node:18

# copy app
WORKDIR /app

#COPY requirements.txt ./
#RUN pip install -r requirements.txt

COPY ./app .
RUN npm install express googleapis body-parser

# Expose port 80 to make the app accessible
# docker run -d -p HOST_PORT:CONTAINER_PORT nginx
EXPOSE 8080

# Start Nginx to serve the app
CMD ["node", "server.js"]
