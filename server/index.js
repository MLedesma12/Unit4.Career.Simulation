const {
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
} = require("./db");

const express = require("express");
const app = express();

app.use(express.json());
app.use(require("morgan")("dev"));

app.get("/api/restaurants", async (req, res, next) => {
  try {
    res.send(await fetchRestaurants());
  } catch (ex) {
    next(ex);
  }
});

app.get("/api/restaurants/:id", async (req, res, next) => {
  try {
    const SQL = `
            SELECT * FROM restaurants
            WHERE id=$1;`;

    const response = await client.query(SQL, [req.params.id]);
    res.send(response.rows[0]);
  } catch (err) {
    console.error("Couldnt find restaurant: ", err);
  }
});

const init = async () => {
  await createTables();
  console.log("created tables");

  const [mario, noel, sammie, aviana, bizzybees, logans, texasroadhouse] =
    await Promise.all([
      createUser({ name: "mario" }),
      createUser({ name: "noel" }),
      createUser({ name: "sammie" }),
      createUser({ name: "aviana" }),
      createRestaurant({ name: "bizzybees" }),
      createRestaurant({ name: "logans" }),
      createRestaurant({ name: "texasroadhouse" }),
    ]);

  console.log(await fetchUsers());
  console.log(await fetchRestaurants());

  const [review, review2] = await Promise.all([
    createReview({
      user_id: mario.id,
      restaurant_id: logans.id,
      review_text: "Fantastic steaks!",
      date: "02/14/2024",
    }),
    createReview({
      user_id: mario.id,
      restaurant_id: texasroadhouse.id,
      review_text: "The rolls are addicting!",
      date: "02/28/2024",
    }),
  ]);

  const allReviews = async () => {
    let reviews = await fetchReviews();
    console.log("Reviews: ", reviews);
  };
  allReviews();

  await deleteReview({
    id: review.id,
    user_id: review.user_id,
  });

  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`listening on port ${port}`);
    // console.log(`curl localhost:${port}/api/customers`);
    // console.log(`curl localhost:${port}/api/restaurants`);
    // console.log(`curl localhost:${port}/api/reservations`);
    // console.log(
    //   `curl -X DELETE localhost:${port}/api/customers/${mario.id}/reservations/${reservation2.id}`
    // );
    // console.log(
    //   `curl -X POST localhost:${port}/api/customers/${mario.id}/reservations/ -d '{"restaurant_id":"${logans.id}", "party_count", "date": "02/15/2025"}' -H "Content-Type:application/json"`
    // );
  });
};

init();
