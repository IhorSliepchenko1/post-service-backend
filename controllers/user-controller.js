const { prisma } = require(`../prisma/prisma-clients`);
const bcrypt = require(`bcryptjs`);
const jwt = require(`jsonwebtoken`);
const dotenv = require(`dotenv`);

dotenv.config();

const UserController = {
  register: async (req, res) => {
    const { email, password, name, adminToken, token } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: `Все поля обязательны!` });
    }

    if (password.length < 6) {
      return res
        .status(401)
        .json({ error: `Длинна пароля должна быть более 6 символов !` });
    }

    try {
      const existingUser = await prisma.user.findUnique({ where: { email } });

      if (existingUser) {
        return res.status(400).json({ error: `Пользователь уже существует` });
      }

      const adminStatus =
        (await adminToken) === process.env.ADMIN_KEY ? true : false;

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          admin: adminStatus,
          token,
        },
      });

      res.json(user);
    } catch (error) {
      console.error(`Error in register`, error);
      res.status(500).json({ error: `Internal Server Error` });
    }
  },
  login: async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: `Все поля обязательны!` });
    }

    try {
      const user = await prisma.user.findUnique({ where: { email } });

      if (!user) {
        return res.status(404).json({ error: `Неверный логин или пароль` });
      }

      const validPass = await bcrypt.compare(password, user.password);

      if (!validPass) {
        return res.status(404).json({ error: `Неверный логин или пароль` });
      }

      const token = jwt.sign({ userId: user.id }, process.env.SECRET_KEY);

      res.json({ token, userId: user.id });
    } catch (error) {
      console.error(`Login error`, error);
      res.status(500).json({ error: `Internal Server Error` });
    }
  },
  current: async (req, res) => {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: `params is required` });
    }

    try {
      const user = await prisma.user.findUnique({
        where: { id },
      });

      if (!user) {
        return res.status(400).json({ error: `Пользователь не найден` });
      }
      res.json(user);
    } catch (error) {
      console.error(`Get current error`, error);
      res.status(500).json({ error: `Entarnal server Error` });
    }
  },
  updateUser: async (req, res) => {
    const { email, token, name, userId, password } = req.body;

    try {
      const hashedPassword =
        password !== "" ? await bcrypt.hash(password, 10) : undefined;

      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          email: email || undefined,
          token: token || undefined,
          name: name || undefined,
          password: hashedPassword,
        },
      });

      res.json(user);
    } catch (error) {
      console.error(`Update user error`, error);
      res.status(500).json({ error: `Entarnal server Error` });
    }
  },
  getAllUsers: async (req, res) => {
    const { id } = req.query;

    if (!id) {
      return res.status(404).json({ error: `Пользователь не обнаружен` });
    }

    const limit = req.query._limit ? parseInt(req.query._limit) : undefined;
    const page = req.query._page ? parseInt(req.query._page) : 1;
    const skip = limit ? (page - 1) * limit : undefined;

    try {
      const user = await prisma.user.findUnique({
        where: { id },
      });

      const { admin } = user;

      if (!admin) {
        return res
          .status(403)
          .json({ error: `Недостаточно прав для просмотра писем` });
      }

      const users = await prisma.user.findMany({
        orderBy: {
          createdAt: "desc",
        },
        take: limit,
        skip: skip,
      });

      const userAll = await prisma.user.findMany({
        orderBy: {
          createdAt: "desc",
        },
      });

      res.json({ users, countUsers: userAll.length });
    } catch (error) {
      console.error(`get all mails error`, error);
      res.status(500).json({ error: `Internal Server Error` });
    }
  },
  getUserById: async (req, res) => {
    const { id } = req.params;

    try {
      const user = await prisma.user.findUnique({
        where: { id },
      });

      if (!user) {
        return res.status(404).json({ error: `Пользователь не найден` });
      }

      const mails = await prisma.mails.findMany({ where: { authorId: id } });

      user.count = mails.length;

      res.json(user);
    } catch (error) {
      console.error(`Get Current Error`, error);

      res.status(500).json({ error: `Internal Server Error` });
    }
  },
  deleteUserById: async (req, res) => {
    const { id } = req.params;

    if (!id) {
      return res.status(404).json({ error: `Пользователь не найден!` });
    }

    try {
      await prisma.user.delete({ where: { id } });

      res.json({ message: `user ${id} deleted` });
    } catch (error) {
      console.error(`Error deleting comment`, error);
      res.status(500).json({ error: `Internal Server Error` });
    }
  },
};

module.exports = UserController;
