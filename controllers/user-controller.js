const { prisma } = require(`../prisma/prisma-clients`);
const bcrypt = require(`bcryptjs`);
const jwt = require(`jsonwebtoken`);
const dotenv = require(`dotenv`);
dotenv.config();

const UserController = {
  register: async (req, res) => {
    const { email, password, name, adminToken, token } = req.body;

    if (password.length < 6) {
      return res
        .status(401)
        .json({ error: `Длинна пароля должна быть более 6 символов !` });
    }
    if (!email || !password) {
      return res.status(400).json({ error: `Все поля обязательны!` });
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
    if (!req.headers) {
      return res.status(400).json({ error: `header is required` });
    }

    try {
      const user = await prisma.user.findUnique({
        where: { id: req.headers[`userid`] },
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
    const { id } = req.params;
    const { email, token, name } = req.body;

    if (id !== req.user.userId) {
      return res.status(403).json({ error: `нет доступа` });
    }

    try {
      if (email) {
        const existingUser = await prisma.user.findFirst({
          where: { email },
        });

        if (existingUser && existingUser.id !== id) {
          return res
            .status(400)
            .json({ error: `Пользователь с таким email уже существует` });
        }
      }

      const user = await prisma.user.update({
        where: { id },
        data: {
          email: email || undefined,
          token: token || undefined,
          name: name || undefined,
        },
      });

      res.json(user);
    } catch (error) {
      console.error(`Update user error`, error);
      res.status(500).json({ error: `Entarnal server Error` });
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

      res.json(user);
    } catch (error) {
      console.error(`Get Current Error`, error);

      res.status(500).json({ error: `Internal Server Error` });
    }
  },
  getUsersAll: async (req, res) => {
    try {
      const users = await prisma.user.findMany();
      res.json(users);
    } catch (error) {
      console.error(`Get All Users Error`, error);
      res.status(500).json({ error: `Internal Server Error` });
    }
  },
  deleteUser: async (req, res) => {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ error: `Пользователь не найден!` });
    }

    try {
      const deleteUser = await prisma.user.deleteMany({
        where: { id },
      });

      res.json(deleteUser);
    } catch (error) {
      console.error(`Error delete User!`, error);
      res.status(500).json({ error: `Internal Server Error` });
    }
  },
};

module.exports = UserController;
