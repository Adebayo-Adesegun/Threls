# Threls

Threls is a project designed to provide a robust and scalable backend solution. This README outlines the setup process, dependencies, features, and API endpoints. It also highlights the use of MongoDB replica sets for transactions and Swagger for API documentation.

## Table of Contents

- [Threls](#threls)
  - [Table of Contents](#table-of-contents)
  - [Setup](#setup)
  - [Dependencies](#dependencies)
  - [Features](#features)
  - [Documentation](#documentation)
  - [Notes](#notes)

## Setup

1. Clone the repository:

    ```bash
    git clone <repository-url>
    ```bash

2. Install dependencies:

    ```bash
    npm install
    ```

3. Set up environment variables:
    copy the `.env.example` and create `.env` file in the root directory and configure environment variables:

    ```
    cp .env.example .env

    ```

4. **Configure MongoDB and MongoDB Replica Set**:
    To enable transactions, you must set up a MongoDB and MongoDB replica set locally.

    install mongodb-communitynusing brew

    ```
    brew services stop mongodb-community
    ```

   (For Intel Macs, use `/usr/local/etc/mongod.conf instead.`)
    ---

    Open the MongoDB config file in a text editor:

    ```
    nano /opt/homebrew/etc/mongod.conf

    ```

    Find the replication: section and add or modify it as follows:

    ```
    replication:
        replSetName: "rs0"

    ```

    Save the file (Ctrl + X, then Y, then Enter)

    Restart MongoDB with Replica Set Enabled

    ```
    brew services restart mongodb-community

    ```

    Initialize the Replica Set

    ```
    mongosh
    ```

    Run the following command inside mongosh:

    ```
    rs.initiate()
    ```

    You should see an output similar to:

    ```
        {

        info2: 'no configuration specified. Using a default configuration for the set',
        me: '127.0.0.1:27017',
        ok: 1,
        '$clusterTime': {
            clusterTime: Timestamp({ t: 1743232789, i: 1 }),
            signature: {
            hash: Binary.createFromBase64('AAAAAAAAAAAAAAAAAAAAAAAAAAA=', 0),
            keyId: Long('0')
            }
        },
        operationTime: Timestamp({ t: 1743232789, i: 1 })
        }
    ```

5. Start the server:

    ```bash
    npm start
    ```

## Dependencies

- **Node.js**: JavaScript runtime environment.
- **Express**: Web framework for Node.js.
- **Mongoose**: MongoDB object modeling tool.
- **MongoDB**: NoSQL database.
- **Swagger**: API documentation tool.
- **jsonwebtoken**: For authentication and authorization.
- **dotenv**: For managing environment variables.

## Features

- **User Authentication**: Secure user login and registration using JWT.
- **Role and Access managedment** Secure routes based on user roles.
- **Transaction Support**: Enabled by MongoDB replica sets.
- **CRUD Operations**: Create, read, update, and delete resources.
- **API Documentation**: Interactive API documentation using Swagger.

## Documentation

Swagger is used to document the API. Once the server is running, you can access the Swagger UI at:

```
http://localhost:<PORT>/api-docs
```

This provides an interactive interface to explore and test the API endpoints.

## Notes

- Ensure MongoDB is running with a properly configured replica set to enable transactions.
- Use the Swagger UI to test and understand the API.
