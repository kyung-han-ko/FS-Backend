const nodemailer = require("nodemailer");
 
const transport = nodemailer.createTransport({
  service: "Naver",
  host: "smtp.naver.com",
  port: 587,
  // secure: true,
  auth: {
    user: "rudgks0102@naver.com",
    pass: "1q2w3e4r##",
  }
  // tls: { rejectUnauthorized: false },
});

const message = {
  from: "rudgks0102@naver.com",
  to: "rudgks0102@gmail.com",
  subject: "제목없음",
  text: "FUCK",
};
 
transport.sendMail(message, (err, info) => {
  if (err) {
    console.error("err", err);
    return;
  }
 
  console.log("ok", info);
});