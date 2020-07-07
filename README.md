

# Database Setup

- If you are using Docker I would reccomend building the MySQL docker container from the `docker.compose.yml` script in the repository
  - The Docker container will auto run the sql file generating the schema for the database

- If you are running on an existing Docker container or with a MySQL database, run the sql file using the command `mysql -u (user) -p (password) (database) < /PATH/TO/SQL/FILE/schema.sql` to initalize the schema

# Application Setup

- Git clone the repository 

- `cd` into the cloned repository and run the command `npm run install:all` to install npm packages for both the server and client

- Create a `.env` file with the environment variable 
  - ```DATABASE_URL=(Replace with MySQL Database URL used in Database Setup)```

# Running Locally

## Development
- To run both Server and Client in development mode run the command `npm run dev`
- Server and Client can run independently with their or npm commands
  - `npm run dev:server`
  - `npm run dev:client`

## Production
- To run both Application in production mode run the command `npm run start`
- This command will build both server and client and execute using node with the environment file
