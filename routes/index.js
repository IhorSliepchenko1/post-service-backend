const express = require(`express`);
const router = express.Router();

// Import controllers
const { UserController, MailController } = require("../controllers");

const authenticationToken = require("./../middleware/auth");

// gotowo
router.post(`/register`, UserController.register);
router.post(`/login`, UserController.login);
router.get(`/current`, authenticationToken, UserController.current);
router.put(`/update-user`, authenticationToken, UserController.updateUser);

router.post(`/create-mails`, authenticationToken, MailController.createMail);
router.get(`/my-mails`, authenticationToken, MailController.getAllMyMails);
router.get(`/mails`, authenticationToken, MailController.getAllMails);

// NE gotowo
router.get(`/users`, UserController.getAllUsers);
router.get(`/users/:id`, UserController.getUserById);

module.exports = router;
