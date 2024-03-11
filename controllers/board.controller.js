const connection = require("../db_init");
const boardController = require("express").Router();

boardController.post("/boardSubmit", (req, res) => {
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

boardController.get("/getBoardData", (req, res) => {
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

boardController.get("/getAllPost", (req, res) => {
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

boardController.get("/lookAllPosts", (req, res) => {
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

boardController.get("/searchPosts", (req, res) => {
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

boardController.get("/increaseLook", (req, res) => {
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

boardController.get("/getBoardText", (req, res) => {
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

boardController.post("/deleteBoard", (req, res) => {
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

boardController.get("/modifyBoard", (req, res) => {
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
boardController.post("/updateBoard", (req, res) => {
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

boardController.post("/insertReply", (req, res) => {
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

boardController.get("/getUserReply", (req, res) => {
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

boardController.post("/deleteUserReply", (req, res) => {
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

boardController.get("/getUserModifyReply", (req, res) => {
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

boardController.post("/modifyUserReply", (req, res) => {
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

module.exports = boardController;
