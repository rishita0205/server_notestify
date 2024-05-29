const express = require("express");
const router = express.Router();
const User = require("../Models/User");
const bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");
var fetchuser = require("../Middleware/fetchuser");
const { body, validationResult } = require("express-validator");
const JWT_SECRET = "GETAGOODPLACEMTASSOONASPOSSIBLE";
router.post(
  "/createuser",
  [
    body("name", "Enter a name of Minimum length 3").isLength({ min: 4 }),

// First Parameter of above line means validation should be applied to the "name" field of the request body. The second parameter is an optional error message that will be sent if the validation fails. In this case, it's indicating that the user should enter a name with a minimum length of 4 characters.

    body("password", "Enter a password of Minimum length 5").isLength({
      min: 5,
    }),
    body("email", "Enter a valid Email").isEmail(),
  ],
  async (req, res) => {
    let success = false;
    const errors = validationResult(req);
// The validationResult() function is used to retrieve the results of the validation that was performed on the request body using the middleware provided by the express-validator package. 
    if (!errors.isEmpty()) {
      return res.status(201).json({ success, errors: errors.array() });
    }

    try {
      
      let user = await User.findOne({ email: req.body.email });

      if (user)
        return res
          .status(201)
          .json({
            success,
            error: "Sorry, a User already exists with this Email Id",
          });

      const salt = await bcrypt.genSalt(10);
      const secpass = await bcrypt.hash(req.body.password, salt);

      user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: secpass,
      });

      const data = {
        user: {
          id: user.id,
        },
      };

      const authtoken = jwt.sign(data, JWT_SECRET);
      success = true;
      //   console.log(jwtData)

      res.json({ success, authtoken });
    } catch (err) {
      console.log(err);
      res.status(500).send(err);
    }
  }
);

router.post(
  "/login",
  [
    body("email", "Enter a valid email").isEmail(),
    body("password", "Password cannot be blank").exists(),
  ],
  async (req, res) => {
    let success = false;
    // If there are errors, return Bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success, errors: errors.array() });
    }

    const { email, password } = req.body;
    try {
      let user = await User.findOne({ email });
      if (!user) {
        success = false;
        return res
          .status(400)
          .json({
            success,
            error: "Please try to login with correct credentials",
          });
      }

      const passwordCompare = await bcrypt.compare(password, user.password);
      success = false;
      if (!passwordCompare) {
        return res
          .status(400)
          .json({
            success,
            error: "Please try to login with correct credentials",
          });
      }

      const data = {
        user: {
          id: user.id,
        },
      };
      const authtoken = jwt.sign(data, JWT_SECRET);
      success = true;
      res.json({ success, authtoken });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server Error");
    }
  }
);

// ROUTE 3: Get loggedin User Details using: POST "/api/auth/getuser". Login required
router.post("/getuser", fetchuser, async (req, res) => {
  //passing middleware fetchuser
  try {
    const userID = req.user.id;
    const user = await User.findById(userID).select("-password"); //selecting all things except the password
    res.send(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});
module.exports = router;
