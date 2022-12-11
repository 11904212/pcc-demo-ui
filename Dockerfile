# source https://www.indellient.com/blog/how-to-dockerize-an-angular-application-with-nginx/

# Stage 1: Build
FROM node:16 as build

# Copy and install all required dependencies
WORKDIR /usr/local/app
COPY package.json package-lock.json /usr/local/app/
RUN npm install

# Copy source and build app
COPY ./ /usr/local/app/
RUN npm run build


# Stage 2: Serve app
FROM nginx:1.23

# Copy the app from build stage
COPY --from=build /usr/local/app/dist/pcc-demo-ui /usr/share/nginx/html
EXPOSE 80
