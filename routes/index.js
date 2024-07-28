const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const iconv = require("iconv-lite");
const { UserController, MailController } = require("../controllers");
const authenticationToken = require("./../middleware/auth");

const uploadsDestination = "uploads";

const storage = multer.diskStorage({
  destination: uploadsDestination,
  filename: (req, file, cb) => {
    const decodedName = iconv.decode(
      Buffer.from(file.originalname, "binary"),
      "utf8"
    );
    const timestampedName = `${Date.now()}-${decodedName}`;
    cb(null, timestampedName);
  },
});

const upload = multer({ storage: storage });

router.post("/register", UserController.register);
router.post("/login", UserController.login);
router.get("/current", authenticationToken, UserController.current);
router.put("/update-user", authenticationToken, UserController.updateUser);

router.post(
  "/create-mails",
  authenticationToken,
  upload.single("file"),
  MailController.createMail
);
router.get("/my-mails", authenticationToken, MailController.getAllMyMails);
router.get("/mails", authenticationToken, MailController.getAllMails);
router.delete(
  "/delete-mails/:id",
  authenticationToken,
  MailController.deleteAllMailsByUserId
);

router.get("/users", UserController.getAllUsers);
router.get("/users/:id", UserController.getUserById);
router.delete("/users-delete/:id", UserController.deleteUserById);

module.exports = router;
