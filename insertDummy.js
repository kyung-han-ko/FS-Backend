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

// insertDummy.js

const insertDummyData = async ({ userId, userName, title, content }) =>
  await new Promise((resolve) => {
    const insertSql =
      "INSERT INTO user_board (userid, name, title, text) VALUES (?, ?, ?, ?)";
    const values = [userId, userName, title, content];
    connection.query(insertSql, values, (err, result) => {
      if (err) {
        console.log(err);
        return resolve(false);
      }

      console.log("success", result);
      return resolve(true);
    });
  });

const execTrigger = async () => {
  const users = [
    { userId: 235, userName: "고경한" },
    { userId: 249, userName: "박인수 와 이순범" },
    { userId: 252, userName: "운동하고싶다" },
  ];

  const length = 279;
  const testArr = Array.from({ length }, (_, index) => ({
    ...users[(index + 1) % users.length],
    title: `test-title-${index}`,
    content: `test-content-${index}`,
  }));
  const triggerResult = await Promise.all(
    testArr.map((data) => insertDummyData(data))
  );
  console.log({ triggerResult });
  return true;
};

execTrigger();
