## Fastify API with TypeScript, SQLite, and Knex
<img src="https://i.morioh.com/200530/56d89189.jpg" alt="Banner" height="200" />

### Overview
This project is an API for managing meals and users. It supports CRUD operations, tracking meal streaks, and getting the total number of meals by user. The API uses Fastify for speed, TypeScript for type safety, SQLite for the database, and Knex for query building.
Note that the project does not currently use authentication nor authorization. Please refer to the TODOS-example.md file as a guide to complete the project requirements.

### Features
- **SQLite Database**: Store data locally with SQLite.
- **Knex Query Builder**: Write clean SQL queries with Knex.
- **Mock Data**: Use Faker.js for generating mock data.
- **End-to-End Testing**: Test all endpoints with Vitest.

### Learning Objectives
- **Fastify Framework**: Building efficient and fast APIs.
- **TypeScript Integration**: Enhancing code quality and maintainability.
- **Database Management**: Using SQLite and Knex for data persistence.
- **Mock Data Generation**: Utilizing Faker.js to create test data.
- **End-to-End Testing**: Implementing comprehensive tests with Vitest.

### How to Run
1. **Clone the repository**:

    ```bash
    git clone https://github.com/rafaelrmb/dailydiet_api.git
    cd dailydiet_api
    ```

2. **Install dependencies**:

    ```bash
    npm install
    ```

3. **Run database migrations**:

    ```bash
    npx knex migrate:latest
    ```

4. **Start the server**:

    ```bash
    npm run dev
    ```

### Endpoints

#### Meals Table
- **GET - /meals**
    - List all meals.
    
- **POST - /meals**
    - Create a new meal.

- **GET - /meals/:id**
    - List a meal by `id`.

- **DELETE - /meals/:id**
    - Delete a meal by `id`.

- **PUT - /meals/:id**
    - Edit a meal by `id`.

- **GET - /meals/streak**
    - Show user's meals streak.

- **GET - /meals/totals**
    - Show total number of meals by user.
    - Show total number of meals on diet.
    - Show total number of meals off diet.

#### Users Table
- **GET - /users**
    - List all users.

- **GET - /users/:id**
    - List a user by `id`.

- **POST - /users**
    - Create a new user.

---
