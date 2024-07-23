const express = require(`express`);
const router = express.Router();

// Import controllers
const { UserController, MailController } = require("../controllers");

const authenticationToken = require("./../middleware/auth");

// gotowo
router.post(`/register`, UserController.register);
router.post(`/login`, UserController.login);
router.get(`/current`, authenticationToken, UserController.current);
router.post(`/create-mails`, authenticationToken, MailController.createMail);
router.get(`/my-mails`, authenticationToken, MailController.getAllMyMails);

// NE gotowo
router.get(`/mails`, authenticationToken, MailController.getAllMails);
router.get(`/mail/:id`, MailController.getAllMailById);
router.get(`/users/all`, UserController.getUsersAll);
router.get(`/users/:id`, UserController.getUserById);
router.put(`/update-user`, authenticationToken, UserController.updateUser);
router.delete(`/delete`, UserController.deleteUser);
module.exports = router;
