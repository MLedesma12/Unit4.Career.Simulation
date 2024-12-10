const pg = require("pg");
const client = new pg.Client(
  process.env.DATABASE_URL ||
    "postgres://mario:password12@localhost:5432/37a_career_simulation"
);

const uuid = require("uuid");
// const {
//   createUser,
//   fetchUsers,
// } = require("../../37a_career_simulation/server/db");
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

const createReview = async ({ restaurant_id, user_id, review_text, date }) => {
  const SQL = `
        INSERT INTO reviews(id, restaurant_id, user_id, review_text, date) VALUES($1, $2, $3, $4, $5) RETURNING *
      `;
  const response = await client.query(SQL, [
    uuid.v4(),
    restaurant_id,
    user_id,
    review_text,
    date,
  ]);
  return response.rows[0];
};

const fetchReviews = async () => {
  const SQL = `
    SELECT * FROM reviews;
    `;
  const reviews = await client.query(SQL);
  return reviews.rows[0];
};

const deleteReview = async ({ id, review_text }) => {
  console.log(id, review_text);
  const SQL = `
            DELETE FROM reviews
            WHERE id = $1 AND review_text=$2
        `;
  await client.query(SQL, [id, review_text]);
};

const createComment = async ({ user_id, review_id, comment_text }) => {
  const SQL = `
        INSERT INTO reservations(id, user_id, review_id, comment_text) VALUES($1, $2, $3, $4) RETURNING *
      `;
  const response = await client.query(SQL, [
    uuid.v4(),
    user_id,
    review_id,
    comment_text,
  ]);
  return response.rows[0];
};

const fetchComments = async () => {
  const SQL = `
    SELECT * FROM comments;
    `;
  const comments = await client.query(SQL);
  return comments.rows[0];
};

const deleteComment = async ({ id, comment_text }) => {
  console.log(id, comment_text);
  const SQL = `
          DELETE FROM comments
          WHERE id = $1 AND comment_text=$2
      `;
  await client.query(SQL, [id, comment_text]);
};

module.exports = {
  client,
  createTables,
  createUser,
  createRestaurant,
  fetchUsers,
  fetchRestaurants,
  createReview,
  fetchReviews,
  deleteReview,
  createComment,
  fetchComments,
  deleteComment,
};
