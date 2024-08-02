const { prisma } = require(`../prisma/prisma-clients`);
const nodemailer = require(`nodemailer`);

const MailController = {
  createMail: async (req, res) => {
    const { from, to, subject, content, name, token, authorId } = req.body;
    const file = req.file;

    if (!from || !token || !to) {
      return res.status(400).json({ error: "Все поля обязательны!" });
    }

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
      attachments: file ? [{ path: file.path }] : [],
    };

    transporter.sendMail(mailOptions, async (error, info) => {
      if (error) {
        return res.status(500).json({ error: "Неверный email или token" });
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
              pdfUrl: file ? file.filename : undefined,
            },
          });

          res.json(mails);
        } catch (error) {
          console.error("Ошибка базы данных", error);
          res.status(500).json({ error: "Ошибка базы данных" });
        }
      }
    });
  },
  getAllMyMails: async (req, res) => {
    const { id } = req.query;

    if (!id) {
      return res.status(404).json({ error: `Пользователь не обнаружен` });
    }

    const limit = req.query._limit ? parseInt(req.query._limit) : undefined;
    const page = req.query._page ? parseInt(req.query._page) : 1;
    const skip = limit ? (page - 1) * limit : undefined;

    try {
      const mail = await prisma.mails.findMany({
        where: {
          authorId: id,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: limit,
        skip: skip,
      });

      const mailLength = await prisma.mails.findMany({
        where: {
          authorId: id,
        },
      });

      const myMails = mail.filter((item) => item.authorId === id);
      const myMailsLength = mailLength.filter((item) => item.authorId === id);

      res.json({ mails: myMails, limit: myMailsLength.length });
    } catch (error) {
      console.error(`get all mails error`, error);
      res.status(500).json({ error: `Internal Server Error` });
    }
  },
  getAllMails: async (req, res) => {
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

      const mails = await prisma.mails.findMany({
        orderBy: {
          createdAt: "desc",
        },
        take: limit,
        skip: skip,
      });

      const mailsAll = await prisma.mails.findMany({
        orderBy: {
          createdAt: "desc",
        },
      });

      res.json({ mails: mails, limit: mailsAll.length });
    } catch (error) {
      console.error(`get all mails error`, error);
      res.status(500).json({ error: `Internal Server Error` });
    }
  },
  deleteAllMailsByUserId: async (req, res) => {
    const { id } = req.params;

    if (!id) {
      return res.status(404).json({ error: `Пользователь не найден!` });
    }

    try {
      const mails = await prisma.mails.findMany({ where: { authorId: id } });

      for (let i = 0; i < mails.length; i++) {
        await prisma.mails.delete({ where: { id: mails[i].id } });
      }

      res.json(mails);
    } catch (error) {
      console.error(`Error deleting comment`, error);
      res.status(500).json({ error: `Internal Server Error` });
    }
  },
};

module.exports = MailController;
