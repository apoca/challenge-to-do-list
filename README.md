# challenge-to-do-list# Challenge To-Do List

[![Build Status](https://github.com/apoca/challenge-to-do-list/actions/workflows/deployment.yml/badge.svg)](https://github.com/apoca/challenge-to-do-list/actions)

This project is a To-Do List application built as a challenge. It provides a RESTful API for managing to-do items with CRUD operations. The application is built using Node.js and integrates with a PostgreSQL database.

## Table of Contents

- [challenge-to-do-list# Challenge To-Do List](#challenge-to-do-list-challenge-to-do-list)
  - [Table of Contents](#table-of-contents)
    - [Folder Structure](#folder-structure)
  - [Installation](#installation)
  - [Usage](#usage)
  - [API Endpoints](#api-endpoints)
    - [Authentication](#authentication)
    - [To-Do Items](#to-do-items)
    - [Users](#users)
  - [Environment Variables](#environment-variables)
  - [Docker Compose](#docker-compose)
  - [Testing](#testing)
  - [Linting](#linting)
  - [License](#license)

### Folder Structure

- `src/`: Contains the source code of the application.
  - `middlewares/`: Middlewares for authentication and other functionalities.
  - `config/`: Application configurations, including database setup.
  - `migration/`: Database migration files.
  - `auth/`: Authentication-related functionalities.
  - `types/`: TypeScript types and interfaces.
  - `users/`: User-related functionalities.
  - `todos/`: To-Do item-related functionalities.
- `tests/`: Contains the automated tests for the application.
- `.github/workflows/`: CI/CD configurations using GitHub Actions.

## Installation

1. Clone the repository:

    ```sh
    git clone https://github.com/apoca/challenge-to-do-list.git
    cd challenge-to-do-list
    ```

2. Install dependencies:

    ```sh
    npm install
    ```

3. Create a `.env` file based on the [.env.example](.env.example) file and configure your environment variables.

4. Create a PostgreSQL database and run the migrations:

    ```sh
    npm run migration:run
    ```

5. If you want to generate a new migration, use the following command:

    ```sh
    npm run migration:generate ./src/migrations/challenge-initial-tables
    ```

6. If you want to revert the last migration, use the following command:

    ```sh
    npm run migration:revert
    ```

## Usage

1. Start the development server:

    ```sh
    npm run dev
    ```

    or

    ```sh
    npm run dev:watch
    ````

2. The server will start on `http://localhost:3000`.
3. You can now make requests to the API using **swagger** `http://localhost:3000/docs` or Postman.

## API Endpoints

### Authentication

- **POST /auth/register**: Register a new user
- **POST /auth/login**: Login a user

### To-Do Items

- **GET /todos**: Get all to-do items (admin only or own to-do items)
- **POST /todos**: Create a new to-do item (admin only or own to-do items)
- **GET /todos/:id**: Get a to-do item by ID (admin only or own to-do item)
- **PUT /todos/:id**: Update a to-do item by ID (admin only or own to-do item)
- **DELETE /todos/:id**: Delete a to-do item by ID (admin only or own to-do item)

### Users

- **POST /users/**: Create a new user (admin only)
- **GET /users/:id**: Get a user by ID (admin only or own user)
- **PUT /users/:id**: Update a user by ID (admin only or own user)
- **DELETE /users/:id**: Delete a user by ID (admin only)
- **GET /users**: Get all users (admin only)

## Environment Variables

The following environment variables need to be set in your [.env](.env.example) file:

- `DB_HOST`: Database host
- `DB_PORT`: Database port
- `DB_NAME`: Database name
- `DB_USER`: Database user
- `DB_PASS`: Database password
- `JWT_SECRET`: Secret key for JWT

## Docker Compose

You can also run the application using Docker Compose. To do so, run the following command:

```sh
NODE_ENV=development docker-compose up
```

or production:

```sh
NODE_ENV=production docker-compose up   
```

## Testing

To run tests, use the following command:

```sh
npm run test
```

## Linting

To run linting, use the following command:

```sh
npm run lint
```

## License

This project is licensed under the MIT License. See the LICENSE file for details.
