const express = require(`express`);
const router = express.Router();

// Import controllers
const { UserController, MailController } = require("../controllers");

const authenticationToken = require("./../middleware/auth");

// USER ROUTES
// +
router.post(`/register`, UserController.register);
// +
router.post(`/login`, UserController.login);
// +
router.get(`/current`, authenticationToken, UserController.current);

router.get(`/users/all`, UserController.getUsersAll);
router.get(`/users/:id`, UserController.getUserById);

router.put(`/users/:id`, UserController.updateUser);
router.delete(`/delete`, UserController.deleteUser);

// POSTS ROUTES
router.post(`/create-mails`, MailController.createMail);
// +
router.get(`/mails`, authenticationToken, MailController.getAllMails);
// +
router.get(`/my-mails`, authenticationToken, MailController.getAllMyMails);

router.get(`/mail/:id`, MailController.getAllMailById);

module.exports = router;
