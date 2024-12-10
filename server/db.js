const pg = require("pg");
const client = new pg.Client(
  process.env.DATABASE_URL ||
    "postgres://mario:password12@localhost:5432/37a_career_simulation"
);

const uuid = require("uuid");
const {
  createUser,
  fetchUsers,
} = require("../../37a_career_simulation/server/db");
const createTables = async () => {
  await client.connect();
  const SQL = `
        DROP TABLE IF EXISTS comments;
        DROP TABLE IF EXISTS reviews;
        DROP TABLE IF EXISTS restaurants;
        DROP TABLE IF EXISTS users;
        
        
        CREATE TABLE users (
            id UUID PRIMARY KEY,
            name VARCHAR(50) NOT NULL UNIQUE
        );
        CREATE TABLE restaurants (
            id UUID PRIMARY KEY,
            name VARCHAR(50) NOT NULL UNIQUE
        );
        CREATE TABLE reviews (
            id UUID PRIMARY KEY,
            date DATE NOT NULL,
            restaurant_id UUID REFERENCES restaurants NOT NULL,
            user_id UUID REFERENCES users NOT NULL,
            review_text VARCHAR(300) NOT NULL
        );
        CREATE TABLE comments (
            id UUID PRIMARY KEY,
            user_id UUID REFERENCES users NOT NULL,
            review_id UUID REFERENCES reviews NOT NULL,
            comment_text VARCHAR(300) NOT NULL 
        );
    `;

  await client.query(SQL);
};

const createUser = async (name) => {
  const SQL = `
        INSERT INTO users(id, name) VALUES($1, $2) RETURNING *
      `;
  const response = await client.query(SQL, [uuid.v4(), name]);
  return response.rows[0];
};

const createRestaurant = async (name) => {
  const SQL = `
        INSERT INTO restaurants(id, name) VALUES($1, $2) RETURNING *
      `;
  const response = await client.query(SQL, [uuid.v4(), name]);
  return response.rows[0];
};

const fetchUsers = async () => {
  const SQL = `
    SELECT *
    FROM users
      `;
  const response = await client.query(SQL);
  return response.rows;
};

const fetchRestaurants = async () => {
  const SQL = `
    SELECT *
    FROM restaurants
      `;
  const response = await client.query(SQL);
  return response.rows;
};

module.exports = {
  client,
  createTables,
  //   createUser,
  //   createRestaurant,
  //   fetchUsers,
  //   fetchRestaurants,
  //   createReview,
  //   fetchReviews,
  //   createComment,
  //   fetchComments,
  //   destroyComment,
};
