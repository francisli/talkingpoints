FROM node:12

# Set an env variable for the location of the app files
ENV APP_HOME=/opt/node/app

# update path to include any installed node module executables
RUN echo "export PATH=$APP_HOME/node_modules/.bin:\$PATH\n" >> /root/.bashrc

# Create a directory for the server app to run from
RUN mkdir -p $APP_HOME

# Add the project files into the app directory and set as working directory
ADD . $APP_HOME
WORKDIR $APP_HOME

RUN npm install && \
    npm run build
