const connection = require("../db_init");
const calendarController = require("express").Router();

// calendar part
// insert
calendarController.post("/loadCalendar", (req, res) => {
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
calendarController.get("/getCalendarData", (req, res) => {
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
calendarController.post("/deleteCalendarData", (req, res) => {
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

module.exports = calendarController;
