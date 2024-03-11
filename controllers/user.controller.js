const connection = require("../db_init");
const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors({ credentials: true, origin: ["http://127.0.0.1:5500"] }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const nodemailer = require("nodemailer");
const RandomNumber = function (min, max) {
  const ranNum = Math.floor(Math.random() * (max - min + 1)) + min;
  return ranNum;
};
const redis = require("redis");
const redisport = 6379;
const getRedisClient = require("../redisclient");

const userController = require("express").Router();

userController.post("/post", async function (req, res) {
  const email = req.body.email;
  const number = RandomNumber(111111, 999999);

  const transporter = nodemailer.createTransport({
    service: "Naver",
    port: 587,
    // secure: true,
    host: "smtp.naver.com",
    auth: {
      user: "rudgks0102@naver.com",
      pass: "1q2w3e4r##",
    },
  });

  const mailOptions = {
    from: "rudgks0102@naver.com",
    to: email,
    subject: "Fitness Station에서 소중한 고객님께 인증번호를 보내드립니다",
    text: "우측에 표시되는 숫자를 입력해주세요 : " + number,
  };

  transporter.sendMail(mailOptions, async function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("이메일 발송 완료: " + info.response);
      const redisClient = await getRedisClient();
      await redisClient.set("emailCheck", number); //11월15일 고친거
    }
  });
  res.json({
    result: "receive data",
  });
});

// userController.post("/emailCheck", async (req, res) => {
//   const emailNumber = req.body.emailNumber;
//   const redisClient = await getRedisClient();
//   console.log(redisClient);
//   const savedEmailNumber = await redisClient.get("emailCheck");
//   console.log(emailNumber, savedEmailNumber);
//   if (emailNumber === savedEmailNumber) {
//     res.json({
//       success: true,
//       savedEmailNumber,
//     });
//   } else {
//     res.json({
//       success: false,
//     });
//   }
// });
// app.listen(8080, function () {
//   console.log("express Running on 8080.");
// });

module.exports = userController;
