//MySql 연결 프롬프트로 변경을 안해서 mysql2로 설치했음
const mysql = require("mysql2");
const connection = mysql.createPool({
  // mysql 접속 설정 // 크리에이트 풀로 변경해서 진행했음. mysql2의 장점이자 단점임
  host: "localhost",
  port: "3306",
  user: "root",
  password: "-Kkhrudgks0102",
  database: "test",
  keepAliveInitialDelay: 10000,
  enableKeepAlive: true,
});

// mysql과 연결 , 안되서 2로 시행함 됐음
// 크립토
const crypto = require("crypto");

//익스프레스 , 노드메일러 , 레디스 코드
// 설정값에 대해서는 디폴트라 굳이 외울 필요는 없음

const express = require("express");
const app = express();
const cors = require("cors");
const session = require("express-session");
const nodemailer = require("nodemailer");
const fileStore = require("session-file-store")(session); //11월15일 고친거
const redis = require("redis");
const redisport = 6379;
const getRedisClient = require("./redisclient");

const RandomNumber = function (min, max) {
  const ranNum = Math.floor(Math.random() * (max - min + 1)) + min;
  return ranNum;
};

//SOP라는 정책 동일출처 원칙
// 공통 미들웨어 등록

app.use(cors({ credentials: true, origin: ["http://127.0.0.1:5500"] }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: "12345",
    resave: true,
    saveUninitialized: true,
    store: new fileStore(), //11월15일 고친거
    cookie: {
      maxAge: 677777,
    },
  })
);

app.get("/a", function (req, res) {
  res.json({ data: "예시" });
});

//이메일 인증버튼에 대한 데이터 교류 , 레디스로 새롭게 개편했음
//어싱크 어웨이트로 개편했음

app.post("/post", async function (req, res) {
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

//이메일 인증번호 확인버튼에 대해서 데이터 교류

app.post("/emailCheck", async (req, res) => {
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

//최종 가입하기 버튼 눌렀을 때 나오는 앱 포스트

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
app.post("/checkName", (req, res) => {
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
app.post("/emailCheck", (req, res) => {
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
require("dotenv").config();
const SECRET_KEY = process.env.SECRET_KEY;

app.post("/login", (req, res) => {
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

// calendar part
// insert
app.post("/loadCalendar", (req, res) => {
  const data = req.body;
  console.log("넘어온 내용:", data);

  const insertSql =
    "INSERT INTO user_calendar (owner, eventTitle, todayFood, kcalToday, fitToday, kcalFit, tomorrowFood, tomorrowFit, currentYM) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
  const values = [
    data.userId,
    data.eventTitle,
    data.todayFood,
    data.kcalToday,
    data.fitToday,
    data.kcalFit,
    data.tomorrowFood,
    data.tomorrowFit,
    data.clientClickData,
  ];

  connection.query(insertSql, values, (err, rows) => {
    if (err) {
      console.error("error:", err);
      res.json({ success: false, result: "데이터 입력 fail" });
    } else {
      console.log("데이터 입력 success");
      res.json({ success: true, result: "데이터 입력 success" });
    }
  });
});

//select
app.get("/getCalendarData", (req, res) => {
  const currentYM = req.query.currentYM;
  const userId = req.query.userId;
  const selectSql =
    'SELECT * FROM user_calendar WHERE DATE_FORMAT(currentYM, "%Y-%m") = ? AND owner = ?';
  const values = [currentYM, userId];

  connection.query(selectSql, values, (err, rows) => {
    if (err) {
      console.error("에러:", err);
      res.json({ success: false, result: "데이터 조회 실패" });
    } else {
      console.log("데이터 조회 success");
      res.json({ success: true, result: rows });
      console.log("check currentYM", values);
    }
  });
});

// delete
app.post("/deleteCalendarData", (req, res) => {
  const eventId = req.body.eventId;
  console.log(eventId);

  const deleteSql = "DELETE FROM user_calendar WHERE eventId = ?";
  const values = [eventId];

  connection.query(deleteSql, values, (err, result) => {
    if (err) {
      console.error("에러:", err);
      res.json({ success: false, result: "데이터 삭제 실패" });
    } else {
      console.log("데이터 삭제 success");
      res.json({ success: true, result: "데이터 삭제 success" });
    }
  });
});

/* */

//게시판 작성

app.post("/boardSubmit", (req, res) => {
  const userId = req.body.UserId;
  const userName = req.body.UserName;
  const title = req.body.title;
  const content = req.body.content;

  const insertSql =
    "INSERT INTO user_board (userid, name, title, text) VALUES (?, ?, ?, ?)";
  const values = [userId, userName, title, content];

  connection.query(insertSql, values, (err, result) => {
    if (err) {
      console.error("에러:", err);
      res.json({ success: false, result: "데이터 전송 실패" });
    } else {
      console.log("데이터 삭제 success");
      res.json({ success: true, result: "데이터 전송 success" });
    }
  });
});

// 게시판 첫 화면로직 + 넘버링 정렬 + 리미트해서 첫화면에 10개씩 띄우고 시작페이지 정했음

app.get("/getBoardData", (req, res) => {
  const currentData = req.query.currentData;
  const pageSize = req.query.pageSize;
  const offset = (currentData - 1) * pageSize;
  //offset은 데이터를 특정한 위치부터 가져오는데 사용함. 페이지별로 분할하고 원하는 데이터를 가져올수있는 쿼리어임
  const selectSql = `SELECT name, title, createdAt, boardid, look FROM user_board ORDER BY createdAt DESC LIMIT ${pageSize} OFFSET ${offset}`;

  connection.query(selectSql, (err, result) => {
    if (err) {
      console.error("에러:", err);
      res.json({ success: false });
    } else {
      console.log("데이터 조회 success");
      res.json({ success: true, result });
    }
  });
});

// 페이지 네이션 기능 시작 , 게시판 게시물 수 조회부터

app.get("/getAllPost", (req, res) => {
  const countSql = "SELECT COUNT(*) AS allPost FROM user_board";

  connection.query(countSql, (err, result) => {
    if (err) {
      console.error("에러:", err);
      res.json({ success: false, result: "false" });
    } else {
      const allPost = result[0].allPost;
      res.json({ success: true, allPost });
    }
  });
});

// 조회수별로 정렬하는 기능

app.get("/lookAllPosts", (req, res) => {
  const currentLook = req.query.currentLook;
  const pageSize = 10;
  const offset = (currentLook - 1) * pageSize;

  const countSql = `SELECT COUNT(*) AS allPost FROM user_board`;
  const lookSql = `SELECT * FROM user_board ORDER BY look DESC LIMIT ${pageSize} OFFSET ${offset}`;

  connection.query(countSql, (err, countResult) => {
    if (err) {
      console.error(err, "err");
      res.json({ success: false });
    } else {
      const allPost = countResult[0].allPost;
      const allPages = Math.ceil(allPost / pageSize);

      connection.query(lookSql, (err, lookResult) => {
        if (err) {
          console.error("err", err);
          res.json({ success: false });
        } else {
          console.log("조회수 순서대로 정렬");
          res.json({ success: true, result: lookResult, allPages });
        }
      });
    }
  });
});
// 검색기능
// 검색기능에 대해서 공부할범위 , 2월15일부터 17일까지의 분량임

app.get("/searchPosts", (req, res) => {
  const keyword = req.query.keyword;
  const currentPage = req.query.currentPage;
  const pageSize = 10;
  const offset = (currentPage - 1) * pageSize;

  const countSql = `SELECT COUNT(*) AS allPost FROM user_board WHERE name LIKE '%${keyword}%' OR title LIKE '%${keyword}%'`;
  const searchSql = `SELECT name, title, createdAt, boardid, look FROM user_board WHERE name LIKE '%${keyword}%' OR title LIKE '%${keyword}%' ORDER BY createdAt DESC LIMIT ${pageSize} OFFSET ${offset}`;

  connection.query(countSql, (err, countResult) => {
    if (err) {
      console.error(err, "err");
      res.json({ success: false });
    } else {
      const allPost = countResult[0].allPost;
      const allPages = Math.ceil(allPost / pageSize);

      connection.query(searchSql, (err, searchResult) => {
        if (err) {
          console.error(err, "err");
          res.json({ success: false });
        } else {
          console.log("검색된 자료만 불러왔다");
          res.json({ success: true, result: searchResult, allPages });
        }
      });
    }
  });
});

// 검색기능에 대해서 공부할범위 , 2월15일부터 17일까지의 분량임

// 조회수 증가

app.get("/increaseLook", (req, res) => {
  const boardId = req.query.boardid;
  const increaseLookSql =
    "UPDATE user_board SET look = look + 1 WHERE boardid = ?";
  connection.query(increaseLookSql, [boardId], (err, result) => {
    if (err) {
      console.error("조회수 업데이트 에러:", err);
      res.json({ success: false, result: "failed" });
    } else {
      res.json({ success: true, result: "success" });
    }
  });
});

// 게시판 들어갔을때 보여주는 view

app.get("/getBoardText", (req, res) => {
  const boardId = req.query.boardid;
  const selectSql = "SELECT * FROM user_board WHERE boardid = ?";
  connection.query(selectSql, [boardId], (err, result) => {
    if (err) {
      res.json({ success: false, result: "failed" });
    } else {
      res.json({ success: true, result: result });
    }
  });
});

// 게시판 삭제 로직임

app.post("/deleteBoard", (req, res) => {
  const boardId = req.query.boardid;
  const deleteQuery = "DELETE FROM user_board WHERE boardid = ?";
  connection.query(deleteQuery, [boardId], (error, result) => {
    if (error) {
      console.error("게시판 삭제 오류:", error);
      res.json({ success: false });
    } else {
      res.json({ success: true, result: result });
      console.log(boardId);
    }
  });
});

app.get("/modifyBoard", (req, res) => {
  const boardId = req.query.boardid;
  const selectSql = "SELECT * FROM user_board WHERE boardid = ?";
  connection.query(selectSql, [boardId], (err, result) => {
    if (err) {
      res.json({ success: false, result: "failed" });
    } else {
      res.json({ success: true, result: result });
    }
  });
});

// 수정된 글을 업데이트하는 로직
app.post("/updateBoard", (req, res) => {
  const boardId = req.query.boardid;
  const updatedTitle = req.body.title;
  const updatedText = req.body.text;
  const updateQuery =
    "UPDATE user_board SET title = ?, text = ? WHERE boardid = ?";

  connection.query(
    updateQuery,
    [updatedTitle, updatedText, boardId],
    (error, result) => {
      if (error) {
        console.error("게시판 수정 오류:", error);
        res.json({ success: false });
      } else {
        res.json({ success: true, result: result });
      }
    }
  );
});

// 댓글 작성하는 로직

app.post("/insertReply", (req, res) => {
  const userId = req.body.UserId;
  const boardId = req.query.boardid;
  const userName = req.body.UserName;
  const text = req.body.text;
  const insertQuery =
    "INSERT INTO user_reply (boardid, name, text, userid) VALUES (?, ?, ?, ?)";
  const values = [boardId, userName, text, userId];

  connection.query(insertQuery, values, (err, result) => {
    if (err) {
      console.error("에러:", err);
      res.json({ success: false, result: "데이터 전송 failed" });
    } else {
      console.log("데이터 삽입 success");
      res.json({ success: true, result: "데이터 전송 success" });
    }
  });
});

// 뷰탭 들어가자마자 댓글 불러오는 로직

app.get("/getUserReply", (req, res) => {
  const boardId = req.query.boardid;
  const selectQuery = "SELECT * FROM user_reply WHERE boardid = ?";

  connection.query(selectQuery, [boardId], (err, result) => {
    if (err) {
      console.error("에러:", err);
      res.json({ success: false, result: "댓글 가져오기 실패" });
    } else {
      res.json({ success: true, result: result });
    }
  });
});

app.post("/deleteUserReply", (req, res) => {
  const replyId = req.query.replyid;
  const deleteQuery = "DELETE FROM user_reply WHERE replyid = ?";

  connection.query(deleteQuery, [replyId], (err, result) => {
    if (err) {
      console.error("에러:", err);
      res.json({ success: false, result: "댓글 삭제 실패" });
    } else {
      res.json({ success: true, result: "댓글이 성공적으로 삭제되었습니다." });
    }
  });
});

app.get("/getUserModifyReply", (req, res) => {
  const replyId = req.query.replyid;
  const editSql = "SELECT * FROM user_reply WHERE replyid = ?";
  connection.query(editSql, [replyId], (err, result) => {
    if (err) {
      res.json({ success: false, result: "failed" });
    } else {
      res.json({ success: true, result: result });
    }
  });
});

app.post("/modifyUserReply", (req, res) => {
  const modifyText = req.body.text;
  const replyId = req.query.replyid;
  const modifyQuery = "UPDATE user_reply SET text = ? WHERE replyid = ?";

  connection.query(modifyQuery, [modifyText, replyId], (error, result) => {
    if (error) {
      console.error("게시판 수정 오류:", error);
      res.json({ success: false });
    } else {
      res.json({ success: true, result: result });
    }
  });
});
