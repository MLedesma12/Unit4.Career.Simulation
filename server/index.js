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
  authenticate,
  findUserWithToken,
  createUserAndGenerateToken,
} = require("./db");

const express = require("express");
const app = express();

app.use(express.json());
app.use(require("morgan")("dev"));

const isLoggedIn = async (req, res, next) => {
  try {
    req.user = await findUserWithToken(req.headers.authorization);
    next();
  } catch (ex) {
    next(ex);
  }
};

app.post("/api/auth/login", async (req, res, next) => {
  try {
    res.send(await authenticate(req.body));
  } catch (ex) {
    next(ex);
  }
});

app.post("/api/auth/register", async (req, res, next) => {
  try {
    res.send(await createUserAndGenerateToken(req.body));
  } catch (ex) {
    next(ex);
  }
});

app.get("/api/auth/me", isLoggedIn, (req, res, next) => {
  try {
    res.send(req.user);
  } catch (ex) {
    next(ex);
  }
});

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

app.get("/api/restaurants/:id/reviews", async (req, res, next) => {
  try {
    const SQL = `
            SELECT * FROM reviews
            WHERE restaurant_id=$1;`;

    const response = await client.query(SQL, [req.params.id]);
    res.send(response.rows[0]);
  } catch (err) {
    console.error("Couldnt find reviews: ", err);
  }
});

app.post("/api/restaurants/:id/reviews", isLoggedIn, async (req, res, next) => {
  try {
    if (req.user.id !== req.params.id) {
      const error = Error("not authorized");
      error.status = 401;
      throw error;
    }
    res.status(201).send(
      await createReview({
        user_id: req.params.id,
        restaurant_id: req.body.restaurant_id,
      })
    );
  } catch (ex) {
    next(ex);
  }
});

app.get("/api/reviews/me", isLoggedIn, async (req, res, next) => {
  try {
    const SQL = `
            SELECT * FROM reviews
            WHERE restaurant_id=$1;`;

    const response = await client.query(SQL, [req.params.id]);
    res.send(response.rows[0]);
  } catch (err) {
    console.error("Couldnt find review: ", err);
  }
});

app.put(
  "/api/users/:id/reviews/:reviewId",
  isLoggedIn,
  async (req, res, next) => {
    try {
      const SQL = `
      UPDATE users
      SET username=$1, reviewId=$2, updated_at= now()
      WHERE id=$3 RETURNING *
    `;
      const response = await client.query(SQL, [
        req.body.username,
        req.body.reviewId,
        req.params.id,
      ]);
      res.send(response.rows[0]);
    } catch (ex) {
      next(ex);
    }
  }
);

app.post(
  "/api/restaurants/:id/reviews/:reviewId/comments",
  isLoggedIn,
  async (req, res, next) => {
    try {
      if (req.user.id !== req.params.id) {
        const error = Error("not authorized");
        error.status = 401;
        throw error;
      }
      res.status(201).send(
        await fetchComments({
          user_id: req.params.id,
          restaurant_id: req.body.restaurant_id,
        })
      );
    } catch (ex) {
      next(ex);
    }
  }
);

app.get("/api/comments/me", isLoggedIn, async (req, res, next) => {
  try {
    const SQL = `
            SELECT * FROM comments
            WHERE comment_text=$1;`;

    const response = await client.query(SQL, [req.params.id]);
    res.send(response.rows[0]);
  } catch (err) {
    console.error("Couldnt find comment: ", err);
  }
});

app.put(
  "/api/users/:id/comments/:commentId",
  isLoggedIn,
  async (req, res, next) => {
    try {
      const SQL = `
      UPDATE users
      SET username=$1, commentId=$2, updated_at= now()
      WHERE id=$3 RETURNING *
    `;
      const response = await client.query(SQL, [
        req.body.username,
        req.body.commentId,
        req.params.id,
      ]);
      res.send(response.rows[0]);
    } catch (ex) {
      next(ex);
    }
  }
);

app.get("/api/restaurants/:id/reviews/:reviewId", async (req, res, next) => {
  try {
    const SQL = `
            SELECT * FROM reviews
            WHERE restaurant_id=$1 AND id=$2;`;

    const response = await client.query(SQL, [
      req.params.id,
      req.params.reviewId,
    ]);
    res.send(response.rows[0]);
  } catch (err) {
    console.error("Couldnt find review: ", err);
  }
});

app.delete(
  "/api/users/:user_id/reviews/:reviewId",
  isLoggedIn,
  async (req, res, next) => {
    try {
      if (req.user.id !== req.params.user_id) {
        const error = Error("not authorized");
        error.status = 401;
        throw error;
      }
      await deleteReview({ user_id: req.params.user_id, id: req.params.id });
      res.sendStatus(204);
    } catch (ex) {
      next(ex);
    }
  }
);

app.delete(
  "/api/users/:user_id/comments/:commentId",
  isLoggedIn,
  async (req, res, next) => {
    try {
      if (req.user.id !== req.params.user_id) {
        const error = Error("not authorized");
        error.status = 401;
        throw error;
      }
      await deleteComment({ user_id: req.params.user_id, id: req.params.id });
      res.sendStatus(204);
    } catch (ex) {
      next(ex);
    }
  }
);

const init = async () => {
  await createTables();
  console.log("created tables");

  const [mario, noel, sammie, aviana, bizzybees, logans, texasroadhouse] =
    await Promise.all([
      createUser({ username: "mario", password: "December12" }),
      createUser({ username: "noel", password: "March13" }),
      createUser({ username: "sammie", password: "May23" }),
      createUser({ username: "aviana", password: "June7" }),
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
      score: "4/5",
      date: "02/14/2024",
    }),
    createReview({
      user_id: mario.id,
      restaurant_id: texasroadhouse.id,
      review_text: "The rolls are addicting!",
      score: "5/5",
      date: "02/28/2024",
    }),
    createReview({
      user_id: noel.id,
      restaurant_id: logans.id,
      review_text: "The steaks are pretty good!",
      score: "4/5",
      date: "02/24/2024",
    }),
    createReview({
      user_id: noel.id,
      restaurant_id: bizzybees.id,
      review_text: "I love their burgers!",
      score: "5/5",
      date: "02/13/2024",
    }),
    createReview({
      user_id: sammie.id,
      restaurant_id: texasroadhouse.id,
      review_text: "Their steaks are the best!",
      score: "5/5",
      date: "02/4/2024",
    }),
    createReview({
      user_id: sammie.id,
      restaurant_id: bizzybees.id,
      review_text: "I really like their soup!",
      score: "4/5",
      date: "02/16/2024",
    }),
    createReview({
      user_id: aviana.id,
      restaurant_id: logans.id,
      review_text: "Really good bread!",
      score: "5/5",
      date: "02/11/2024",
    }),
    createReview({
      user_id: aviana.id,
      restaurant_id: bizzybees.id,
      review_text: "Good grilled cheese!",
      score: "5/5",
      date: "02/19/2024",
    }),
  ]);

  createComment({
    user_id: mario.id,
    review_id: review.id,
    comment_text: "totally agree!",
  });

  createComment({
    user_id: mario.id,
    review_id: review.id,
    comment_text: "absolutely!",
  });

  createComment({
    user_id: noel.id,
    review_id: review.id,
    comment_text: "definitely!",
  });

  createComment({
    user_id: noel.id,
    review_id: review.id,
    comment_text: "I beg to differ!",
  });

  createComment({
    user_id: sammie.id,
    review_id: review.id,
    comment_text: "they really are!",
  });

  createComment({
    user_id: sammie.id,
    review_id: review.id,
    comment_text: "I think so!",
  });

  createComment({
    user_id: aviana.id,
    review_id: review.id,
    comment_text: "yesssss!",
  });

  createComment({
    user_id: aviana.id,
    review_id: review.id,
    comment_text: "the best!",
  });

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
