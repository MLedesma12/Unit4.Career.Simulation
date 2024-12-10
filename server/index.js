const {
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
} = require("./db");

const express = require("express");
const app = express();

app.use(express.json());
app.use(require("morgan")("dev"));

const init = async () => {
  await createTables();
  console.log("created tables");

  // const [mario, noel, sammie, aviana, bizzybees, logans, twinpeaks] =
  //   await Promise.all([
  //     createCustomer({ name: "mario" }),
  //     createCustomer({ name: "noel" }),
  //     createCustomer({ name: "sammie" }),
  //     createCustomer({ name: "aviana" }),
  //     createRestaurant({ name: "bizzybees" }),
  //     createRestaurant({ name: "logans" }),
  //     createRestaurant({ name: "twinpeaks" }),
  //   ]);

  // console.log(await fetchCustomers());
  // console.log(await fetchRestaurants());

  // const [reservation, reservation2] = await Promise.all([
  //   createReservation({
  //     customer_id: mario.id,
  //     restaurant_id: logans.id,
  //     party_count: 2,
  //     date: "02/14/2024",
  //   }),
  //   createReservation({
  //     customer_id: mario.id,
  //     restaurant_id: twinpeaks.id,
  //     party_count: 4,
  //     date: "02/28/2024",
  //   }),
  // ]);

  // const allReservations = async () => {
  //   let reservations = await fetchReservations();
  //   console.log("Reservations: ", reservations);
  // };
  // allReservations();

  // await destroyReservation({
  //   id: reservation.id,
  //   customer_id: reservation.customer_id,
  // });

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
