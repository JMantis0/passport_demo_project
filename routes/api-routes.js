// Requiring our models and passport as we've configured it
const db = require("../models");
const passport = require("../config/passport");
const isAuthenticated = require("../config/middleware/isAuthenticated");
const bcrypt = require("bcryptjs");

module.exports = function (app) {
  // Using the passport.authenticate middleware with our local strategy.
  // If the user has valid login credentials, send them to the members page.
  // Otherwise the user will be sent an error
  app.post("/api/login", passport.authenticate("local"), (req, res) => {
    console.log(req.user);
    res.json(req.user);
  });

  // Route for signing up a user. The user's password is automatically hashed and stored securely thanks to
  // how we configured our Sequelize User Model. If the user is created successfully, proceed to log the user in,
  // otherwise send back an error
  app.post("/api/signup", (req, res) => {
    db.User.create({
      email: req.body.email,
      password: req.body.password,
      recoveryQuestion: null,
      recoveryAnswer: null
    })
      .then(() => {
        res.redirect(307, "/api/login");
      })
      .catch((err) => {
        res.status(401).json(err);
      });
  });

  // Route for logging user out
  app.get("/logout", (req, res) => {
    req.logout();
    res.redirect("/");
  });

  // Route for getting some data about our user to be used client side
  app.get("/api/user_data", (req, res) => {
    if (!req.user) {
      // The user is not logged in, send back an empty object
      res.json({});
    } else {
      // Otherwise send back the user's email and id
      // Sending back a password, even a hashed password, isn't a good idea
      res.json({
        email: req.user.email,
        id: req.user.id
      });
    }
  });

  //  route to handle an update for user's password recovery info
  app.put("/api/members/passwordRecovery", isAuthenticated, (req, res) => {
    db.User.update(req.body, {
      where: {
        id: req.user.id
      }
    })
      .then(() => {
        // send success status back to client
        res.status(200).send("Password Recovery info Updated");
      })
      .catch((err) => {
        console.log("Error updating Password Recovery info", err);
        // Send Failure
        res.status(400).send("Failure");
      });
  });

  // Route helps unauthenticated user reset a password.
  // req.body contains an email account string.
  // req.body.email is used in the sequelize where condition.
  // then either a recoveryQuestion is sent back to the client
  // an exception is thrown.
  app.post("/api/passwordRecovery/accountSearch", (req, res) => {
    console.log("Inside api route /accountSearch");
    db.User.findOne({
      where: {
        email: req.body.email
      }
    })
      .then((accountIfExists) => {
        let accountExists;
        if (accountIfExists === null) {
          accountExists = false;
        } else {
          accountExists = true;
        }

        if (accountExists) {
          res.status(200).send(accountIfExists.dataValues.recoveryQuestion);
        } else {
          throw {
            msg: ` Account does not exist for ${req.body.email}`,
            class: "accountSearch"
          };
        }
      })
      .catch((err) => {
        console.log(err, "101");
        res.status(400).json(err);
      });
  });

  app.post("/api/passwordRecovery/matchAnswer", (req, res) => {
    db.User.findOne({
      where: {
        email: req.body.email
      }
    })
      .then((user) => {
        const userAnswer = req.body.recoveryAnswer;
        const correctAnswer = user.dataValues.recoveryAnswer;
        if (userAnswer === correctAnswer) {
          res.send(userAnswer === correctAnswer);
        } else {
          throw {
            msg: " Incorrect Answer",
            class: "recoveryAnswer"
          };
        }
      })
      .catch((err) => {
        res.status(400).json(err);
      });
  });

  app.post("/api/passwordRecovery/testPasswordRequirements", (req, res) => {
    //  Regular Expression must contain at least one number, one capital letter, one lowercase letter,
    //  one special character, and have length in range 9-32
    const pwRegEx = new RegExp(
      "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[+!@#$%^&*])(?=.{8,})"
    );
    console.log("135", pwRegEx, req.body.potentialPassword);
    const passwordPasses = pwRegEx.test(req.body.potentialPassword);
    console.log("137", passwordPasses);
    if (passwordPasses) {
      res.status(200).send(passwordPasses);
    } else {
      const err = {
        msg:
          " Password must have:\n    - minimum 8 characters\n    - one number\n    - one lowercase letter\n    - one uppercase letter\n    - one special-character",
        class: "newPassword"
      };
      res.status(400).json(err);
    }
  });

  app.put("/api/passwordRecovery/confirmPassword", (req, res) => {
    const match = req.body.password1 === req.body.password2;
    if (match) {
      db.User.update(
        {
          password: bcrypt.hashSync(
            req.body.password1,
            bcrypt.genSaltSync(10),
            null
          )
        },
        {
          where: {
            email: req.body.email
          }
        }
      ).then((result) => {
        console.log(result, "api routes 161");
        res.status(202).send(result);
      });
    } else {
      const err = {
        msg: " Your new passwords do not match",
        class: "passwordConfirm"
      };
      res.status(400).json(err);
    }
  });
};
