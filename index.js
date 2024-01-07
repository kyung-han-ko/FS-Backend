
//MySql 연결 프롬프트로 변경을 안해서 mysql2로 설치했음
const mysql = require('mysql2');
const connection = mysql.createPool({  // mysql 접속 설정 // 크리에이트 풀로 변경해서 진행했음. mysql2의 장점이자 단점임
  host: 'localhost',
  port: '3306',
  user: 'root',
  password: '-Kkhrudgks0102',
  database: 'test',
  keepAliveInitialDelay: 10000, 
  enableKeepAlive: true
});

// mysql과 연결 , 안되서 2로 시행함 됐음
// const connection = mysql.createConnection(conn); // DB 커넥션 생성 , 함수로 돌려버리고 getConnection방식으로 진행
// connection.getConnection(function(err,connection) {//커넥션추가
//   if (err) throw err;
//   console.log("Connected!");
//   const sql = "INSERT INTO user_list (number ,email, name, password) VALUES ?";
  
//   const values = [
//     ['1','rudgks0102@naver.com','고경한','2U4gjlyjUje1r2bK+Lg2umJozfH8pVkHnssN2nUzHEj1iJBvF3Wc8iLYq/LxErMndNaEPAJuOavMoBiCC/xvFg=='],
//     ['2','rudgks0105@naver.com','박인수','2U4gjlyjUje1r2bK+Lg2umJozfH8pVkHnssN2nUzHEj1iJBvF3Wc8iLYq/LxErMndNaEPAJuOavMoBiCC/xvFg==']
//   ];

//   connection.query(sql, [values] , function (err, result) {
//     if (err) throw err;
//     console.log("Number of records inserted: " + result.affectedRows);
//   });
//   connection.release(); // 연결 해제 realease방식으로 바꿈. pool의 특성
// });

// connection.query('SELECT * FROM user_list', (error, rows, fields) => {
// if (error){
//   console.log('error : '+error)
// }
// else
// console.log('result is: success ', rows);
// });


// 크립토
const crypto = require("crypto");

//익스프레스 , 노드메일러 , 레디스 코드
// 설정값에 대해서는 디폴트라 굳이 외울 필요는 없음

const express = require("express");
const app = express();
const cors = require('cors');
const session = require('express-session'); 
const nodemailer = require('nodemailer');
const fileStore = require('session-file-store')(session); //11월15일 고친거
const redis = require('redis');
const redisport = 6379;
const getRedisClient = require("./redisclient");

const RandomNumber = function (min, max){
  const ranNum = Math.floor(Math.random()*(max-min+1)) + min;
  return ranNum;
}


//SOP라는 정책 동일출처 원칙
// 공통 미들웨어 등록

app.use(cors({credentials : true, origin : ["http://127.0.0.1:5500"]}))
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(session({
  secret: '12345',
  resave: true,
  saveUninitialized: true,
  store: new fileStore(), //11월15일 고친거
  cookie: {
    maxAge: 677777
  }
}));

app.get("/a", function(req, res){
        res.json({data: "예시"});
})

//이메일 인증버튼에 대한 데이터 교류 , 레디스로 새롭게 개편했음
//어싱크 어웨이트로 개편했음

app.post('/post', async function(req, res){
    const email = req.body.email; 
    const number = RandomNumber(111111,999999)
     
        const transporter = nodemailer.createTransport({
          service: 'Naver',
          port: 587,
          // secure: true,
          host: "smtp.naver.com",
          auth: {
              user: "rudgks0102@naver.com",
              pass: "1q2w3e4r##",
          }
        });

        const mailOptions = {
          from: "rudgks0102@naver.com",    
          to: email ,  
          subject: 'Fitness Station에서 소중한 고객님께 인증번호를 보내드립니다',
          text: "우측에 표시되는 숫자를 입력해주세요 : " + number
        };
      
        transporter.sendMail(mailOptions, async function(error, info){
          if (error) {
            console.log(error);
          }
          else {
            console.log('이메일 발송 완료: ' + info.response);
            const redisClient = await getRedisClient()
            await redisClient.set("emailCheck", number); //11월15일 고친거
          }
        });
        res.json({
          result : "receive data"
        })
      })
      
      //이메일 인증번호 확인버튼에 대해서 데이터 교류

  app.post('/emailCheck', async (req, res) => {
      const emailNumber = req.body.emailNumber;
      const redisClient = await getRedisClient();
      console.log(redisClient);
      const savedEmailNumber = await redisClient.get("emailCheck")
      console.log(emailNumber, savedEmailNumber)
      if (emailNumber === savedEmailNumber) {
          res.json({
           success : true, savedEmailNumber
          })
      } else {
        res.json({
          success : false
        })
      }
  })
app.listen(8080, function(){
        console.log("express Running on 8080.")
});

//최종 가입하기 버튼 눌렀을 때 나오는 앱 포스트

app.post('/signup', (req, res) => {
  const email = req.body.email;
  const name = req.body.name;
  const password1 = req.body.password1
  const password2 = req.body.password2
  const emailNumber = req.body.emailNumber;

    crypto.pbkdf2(
       password1,
       "secret", //12월 4일 수정된 코드
      100, 
      64, 
      'sha512', 
      (err, key) => {
      console.log("암호화된 비밀번호 : ", key.toString('base64'));
      connection.getConnection(function(err,connection) {//커넥션추가
        if (err) throw err;
        console.log("crypto success");

        if (email && name && password1 && password2 && emailNumber) {

          connection.query('select email from user_list where email=?', email, function(err,rows){
              if(Array.isArray(rows) && rows.length){
                console.log('중복된 아이디가 있습니다');
                res.json({success : false});
              } else if(password1 != password2){
                console.log('비밀번호와 비밀번호 확인이 일치하지 않습니다')
                res.json({test : true})
              } 
              else {
                const sql = "INSERT INTO user_list (email, name, password) VALUES (?,?,?)";
                const values = [email,name,key.toString('base64')];
                connection.query(sql, values , function (err, result) {
                  if (err) throw err;
                  console.log("DB추가된 인원 수: " + result.affectedRows + "명");
                });
                res.json({success : true})
              } 
            });
  
      } else {
        console.log("입력하지 않은 정보가 있습니다");
        res.json({result : true})
      } 
      connection.release(); // 연결 해제 realease방식으로 바꿈. pool의 특성
    });
}); 
  
});

//로그인 페이지

const jwt = require('jsonwebtoken');
// const secret_key = 'MY-SECRET-KEY';
require('dotenv').config();
const SECRET_KEY = process.env.SECRET_KEY;

app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  connection.query('select * from user_list where email=?',email,(err, rows)=>{
    if (err) {
      throw err;
    }else if (rows.length > 0){
      console.log(rows);
      console.log("success");

        crypto.pbkdf2(
          password,
          "secret", //12월 4일 수정된 코드
          100, 
          64, 
          'sha512', 
          (err, key) => {
          console.log("암호화된 비밀번호 : ", key.toString('base64'));
          if(key.toString('base64') === rows[0].password){
            const savingToken = jwt.sign({ sub: 'rudgks0102'}, SECRET_KEY)
            console.log("토큰 : ",savingToken)
            // const decoded_data = jwt.verify(savingToken, SECRET_KEY);
            // console.log(decoded_data)
            res.json({success : true , token : savingToken});
            
          } else {
            res.json({success : false})
          }
          });
    }else {
      console.log("입력되지 않은 정보가 있습니다");
      res.json({result : true})
    }
  })
});



// const savingToken = jwt.sign({ email: rows[0].email, password: rows[0].password }, SECRET_KEY);














//Node 설치
//Express 설치를 위해서 'npm init'
//npm install express + npm install cors
//Express 셋업
// = > 코드적기
// API 생성
// => app,get(), app.post

// 123 789 21 23 는 세트


// if (email && password1 && password2) {

// connection.query('SELECT * FROM user_list WHERE email = ?', email, function(err, rows) { // DB에 같은 이름의 회원아이디가 있는지 확인

//   if (Array.isArray(rows) && rows.length) {     // DB에 같은 이름의 회원아이디가 없고, 비밀번호가 올바르게 입력된 경우 
//     const sql = "INSERT INTO user_list (email, name, password) VALUES (?,?,?)";
//     const values = [email,name,key.toString('base64')];
//     connection.query(sql, values , function (err, result) {
//       if (err) throw err;
//       console.log("Number of records inserted: " + result.affectedRows);
//     });
//   } else if (password1 != password2) {                     // 비밀번호가 올바르게 입력되지 않은 경우
//       console.log("11111");    
//   }
//   else {                                                  // DB에 같은 이름의 회원아이디가 있는 경우
//     console.log("22222");    
//   }            
// });

// } else {        // 입력되지 않은 정보가 있는 경우
// console.log("33333");
// }

// connection.query('select email from user_list where email=?', email, function(err,rows){
  //   if(Array.isArray(rows) && rows.length){
  //     console.log('false');
  //     res.json({success : false});
  //   } else {
  //     const sql = "INSERT INTO user_list (email, name, password) VALUES (?,?,?)";
  //     const values = [email,name,key.toString('base64')];
  //     connection.query(sql, values , function (err, result) {
  //       if (err) throw err;
  //       console.log("Number of records inserted: " + result.affectedRows);
  //     });
  //     connection.release(); // 연결 해제 realease방식으로 바꿈. pool의 특성
  //     res.json({success : true})
  //   }
  // });

  //     });// DB 데이터 삽입 추가됐는지 확인만 한다