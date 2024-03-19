require("dotenv").config();
// const mysql = require("mysql2");
// console.log(process.env.MYSQL_HOST);
// console.log(process.env.MYSQL_PORT);
// const connection = mysql.createPool({
//   // host: process.env.MYSQL_HOST,
//   // port: process.env.MYSQL_PORT,
//   host: "localhost",
//   port: "3306",
//   user: process.env.MYSQL_USER,
//   password: process.env.MYSQL_PASSWORD,
//   database: process.env.MYSQL_DATABASE,
//   keepAliveInitialDelay: 10000,
//   enableKeepAlive: true,
// });
const crypto = require("crypto");

const express = require("express");
const app = express();
const cors = require("cors");
const session = require("express-session");
const nodemailer = require("nodemailer");
const fileStore = require("session-file-store")(session); //11월15일 고친거
const redis = require("redis");
const redisport = 6379;
const getRedisClient = require("./redisclient");
const connection = require("./db_init");
const RandomNumber = function (min, max) {
  const ranNum = Math.floor(Math.random() * (max - min + 1)) + min;
  return ranNum;
};

//SOP라는 정책 동일출처 원칙
// 공통 미들웨어 등록

app.use(cors({ credentials: true, origin: ["http://127.0.0.1:5500"] }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(
//   session({
//     secret: "12345",
//     resave: true,
//     saveUninitialized: true,
//     store: new fileStore(), //11월15일 고친거
//     cookie: {
//       maxAge: 677777,
//     },
//   })
// );

app.get("/a", function (req, res) {
  res.json({ data: "예시" });
});

const userController = require("./controllers/user.controller");
const boardController = require("./controllers/board.controller");
const calendarController = require("./controllers/calendar.controller");

app.use("/api/user", userController);
app.use("/api/board", boardController);
app.use("/api/calendar", calendarController);

// app.post("/post", async function (req, res) {
//   const email = req.body.email;
//   const number = RandomNumber(111111, 999999);

//   const transporter = nodemailer.createTransport({
//     service: "Naver",
//     port: 587,
//     // secure: true,
//     host: "smtp.naver.com",
//     auth: {
//       user: "rudgks0102@naver.com",
//       pass: "1q2w3e4r##",
//     },
//   });

//   const mailOptions = {
//     from: "rudgks0102@naver.com",
//     to: email,
//     subject: "Fitness Station에서 소중한 고객님께 인증번호를 보내드립니다",
//     text: "우측에 표시되는 숫자를 입력해주세요 : " + number,
//   };

//   transporter.sendMail(mailOptions, async function (error, info) {
//     if (error) {
//       console.log(error);
//     } else {
//       console.log("이메일 발송 완료: " + info.response);
//       const redisClient = await getRedisClient();
//       await redisClient.set("emailCheck", number); //11월15일 고친거
//     }
//   });
//   res.json({
//     result: "receive data",
//   });
// });

// 이메일 인증번호 확인버튼에 대해서 데이터 교류

app.post("/api/emailCheck", async (req, res) => {
  const emailNumber = req.body.emailNumber;
  const redisClient = await getRedisClient();
  console.log(redisClient);
  const savedEmailNumber = await redisClient.get("emailCheck");
  console.log(emailNumber, savedEmailNumber);
  if (emailNumber === savedEmailNumber) {
    res.json({
      success: true,
      savedEmailNumber,
    });
  } else {
    res.json({
      success: false,
    });
  }
});
app.listen(8080, function () {
  console.log("express Running on 8080.");
});

// 최종 가입하기 버튼 눌렀을 때 나오는 앱 포스트
app.post("/signup", (req, res) => {
  const email = req.body.email;
  const name = req.body.name;
  const password1 = req.body.password1;
  const password2 = req.body.password2;
  const emailNumber = req.body.emailNumber;

  crypto.pbkdf2(
    password1,
    "secret", // 12월 4일 수정된 코드
    100,
    64,
    "sha512",
    (err, key) => {
      console.log("암호화된 비밀번호 : ", key.toString("base64"));
      connection.getConnection(function (err, connection) {
        if (err) throw err;
        console.log("crypto success");

        if (email && name && password1 && password2 && emailNumber) {
          connection.query(
            "SELECT email FROM user_list WHERE email=?",
            email,
            function (err, emailRows) {
              if (err) throw err;

              if (Array.isArray(emailRows) && emailRows.length) {
                // 이메일 중복
                console.log("중복된 이메일이 있습니다");
                res.json({ success: false });
              } else {
                // 닉네임 중복 확인(UQ쓰려고바꿈)
                connection.query(
                  "SELECT name FROM user_list WHERE name=?",
                  name,
                  function (err, nameRows) {
                    if (err) throw err;

                    if (Array.isArray(nameRows) && nameRows.length) {
                      // 중복된 닉네임이 이미 존재하는 경우
                      console.log("중복된 닉네임이 있습니다");
                      res.json({ nickname: false });
                    } else if (password1 !== password2) {
                      // 비밀번호와 비밀번호 확인이 일치하지 않는 경우
                      console.log(
                        "비밀번호와 비밀번호 확인이 일치하지 않습니다"
                      );
                      res.json({ test: false });
                    } else {
                      // 모든 조건을 통과한 경우 가입 진행
                      const sql =
                        "INSERT INTO user_list (email, name, password) VALUES (?,?,?)";
                      const values = [email, name, key.toString("base64")];
                      connection.query(sql, values, function (err, result) {
                        if (err) throw err;
                        console.log("회원가입 성공");
                        console.log(
                          "DB추가된 인원 수: " + result.affectedRows + "명"
                        );
                        res.json({ success: true });
                      });
                    }
                  }
                );
              }
            }
          );
        } else {
          // 입력하지 않은 정보가 있는 경우
          console.log("입력하지 않은 정보가 있습니다");
          res.json({ result: false });
        }

        connection.release();
      });
    }
  );
});

// 닉네임 중복검사
app.post("/api/checkName", (req, res) => {
  const nameCheck = req.body.name;

  connection.getConnection(function (err, connection) {
    if (err) throw err;

    // 닉네임 중복 확인 쿼리
    connection.query(
      "SELECT name FROM user_list WHERE name=?",
      nameCheck,
      function (err, rows) {
        if (err) throw err;

        if (Array.isArray(rows) && rows.length) {
          // 중복된 닉네임이 이미 존재하는 경우
          res.json({ nickname: false });
        } else {
          // 중복되지 않은 경우
          res.json({ nickname: true });
        }
      }
    );

    connection.release();
  });
});

// 이메일 중복검사
app.post("/api/emailCheck", (req, res) => {
  const emailCheck = req.body.email;

  connection.getConnection(function (err, connection) {
    if (err) throw err;

    // 이메일 중복 확인 쿼리
    connection.query(
      "SELECT email FROM user_list WHERE email=?",
      emailCheck,
      function (err, rows) {
        if (err) throw err;

        if (Array.isArray(rows) && rows.length) {
          // 중복된 이메일이 이미 존재하는 경우
          res.json({ success: false });
        } else {
          // 중복되지 않은 경우
          res.json({ success: true });
        }
      }
    );

    connection.release();
  });
});
//로그인 페이지

const jwt = require("jsonwebtoken");
const { off } = require("process");
// const secret_key = 'MY-SECRET-KEY';
const SECRET_KEY = process.env.SECRET_KEY;

app.post("/api/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  connection.query(
    "select * from user_list where email=?",
    email,
    (err, rows) => {
      if (err) {
        throw err;
      } else if (rows.length > 0) {
        console.log(rows);
        console.log("success");

        crypto.pbkdf2(
          password,
          "secret", //12월 4일 수정된 코드
          100,
          64,
          "sha512",
          (err, key) => {
            console.log("암호화된 비밀번호 : ", key.toString("base64"));
            if (key.toString("base64") === rows[0].password) {
              const savingToken = jwt.sign({ sub: "rudgks0102" }, SECRET_KEY);
              console.log("토큰 : ", savingToken);
              // const decoded_data = jwt.verify(savingToken, SECRET_KEY);
              // console.log(decoded_data)

              //1월 23일 수정 매우 중요 반드시 복습
              //로컬 스토리지에 자체적으로 아이디값을 저장하는 방법 로그인 로직이랑 확인해야함
              const userId = rows[0].userId;
              const userName = rows[0].name;
              res.json({ success: true, token: savingToken, userId, userName });
            } else {
              res.json({ success: false });
            }
          }
        );
      } else {
        console.log("입력되지 않은 정보가 있습니다");
        res.json({ result: true });
      }
    }
  );
});
