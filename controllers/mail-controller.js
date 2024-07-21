const { prisma } = require(`../prisma/prisma-clients`);
const nodemailer = require(`nodemailer`);

const MailController = {
  createMail: async (req, res) => {
    const { from, to, subject, content, name, token, authorId } = req.body;

    if (!from || !token || !to) {
      return res.status(400).json({ error: `Все поля обязательны!` });
    }

    // Create a transporter object
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: from,
        pass: token,
      },
    });

    const mailOptions = {
      from: `${name} <${from}>`,
      to: to,
      subject: subject,
      text: content,
    };

    transporter.sendMail(mailOptions, async (error, info) => {
      if (error) {
        return res.status(500).json({ error: `Неверный email или token` });
      } else {
        try {
          const mails = await prisma.mails.create({
            data: {
              from,
              to,
              subject,
              content,
              name,
              authorId,
            },
          });

          res.json(mails);
        } catch (error) {
          res.json(mails);
          console.error(`Ошибка базы данных`, error);
          res.status(500).json({ error: `Ошибка базы данных` });
        }
      }
    });
  },
  getAllMails: async (req, res) => {
    const userId = req.headers[`userid`];
    console.log(JSON.stringify(req.headers));
    if (!userId) {
      return res.status(404).json({ error: `Пользователь не обнаружен` });
    }

    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      const { admin } = user;

      if (!admin) {
        return res.status(403).json({ error: `Недостаточно прав!` });
      }

      const mails = await prisma.mails.findMany({
        orderBy: {
          createdAt: "desc",
        },
      });

      res.json(mails);
    } catch (error) {
      console.error(`get all mails error`, error);
      res.status(500).json({ error: `Internal Server Error` });
    }
  },

  getAllMyMails: async (req, res) => {
    const userId = req.headers["userid"];

    if (!userId) {
      return res.status(404).json({ error: "Пользователь не обнаружен" });
    }

    try {
      const myMails = await prisma.mails.findMany({
        where: {
          authorId: userId,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      res.json(myMails);
    } catch (error) {
      console.error("get all mails error", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
  getAllMailById: async (req, res) => {
    const { id } = req.params;
    const authorId = req.user.userId;

    try {
      const mail = await prisma.mails.findUnique({
        where: { id },
      });

      if (!mail) {
        return res.status(404).json({ error: `Письмо не найден` });
      }

      if (mail.authorId !== authorId) {
        return res
          .status(403)
          .json({ error: `Недостаточно прав для просмотра письма` });
      }

      res.json(mail);
    } catch (error) {
      console.error(`get post by id error`, error);
      res.status(500).json({ error: `Internal Server Error` });
    }
  },
};

module.exports = MailController;
