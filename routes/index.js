const express = require(`express`);
const router = express.Router();

// Import controllers
const { UserController, MailController } = require("../controllers");

const authenticationToken = require("./../middleware/auth");

// USER ROUTES
router.post(`/register`, UserController.register);
router.post(`/login`, UserController.login);
router.get(`/users/all`, authenticationToken, UserController.getUsersAll);
router.get(`/users/:id`, authenticationToken, UserController.getUserById);
router.put(`/users/:id`, authenticationToken, UserController.updateUser);

// POSTS ROUTES
router.post(`/create-mails`, authenticationToken, MailController.createMail);
router.get(`/mails/:id`, authenticationToken, MailController.getAllMails);
router.get(`/mail/:id`, authenticationToken, MailController.getAllMailById);

module.exports = router;
