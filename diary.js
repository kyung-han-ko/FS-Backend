document.addEventListener("DOMContentLoaded", function () {
  let currentPage = 1; // 메인 페이지를 1로 ㅣㅈ정했음
  const pageSize = 10; // 페이지당 게시물 수는 10개로 제한
  const pageGroupSize = 10; // 페이지 그룹도 10개 .. 10번까지 나오고 옆에 누르면 11번임

  function fetchData(page = 1) {
    fetch(`http://localhost:8080/getAllPost`, {
      method: "get",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      mode: "cors",
    })
      .then(function (res) {
        return res.json();
      })
      .then(function (res) {
        if (res.success) {
          const allPost = res.allPost;
          const allPages = Math.ceil(allPost / pageSize);
          // Math.ceil은 전체 게시물에서 내가 지정한 사이즈만큼 나누는걸 의미함
          currentPage = page; // 현재 페이지 업데이트 무조건 해줘야함. 안하면 안넘어감
          // 페이지 이동할때마다 현재 페이지 정보를 업데이트 해줘야함
          displayPagination(allPages);
          fetchPageData(page);
        } else {
          console.log("전체 게시물 수를 가져오는 데 실패했습니다.");
        }
      })
      .catch(function (err) {
        console.error("에러:", err);
      });
  }

  function fetchPageData(page) {
    fetch(
      `http://localhost:8080/getBoardData?page=${page}&pageSize=${pageSize}`,
      {
        method: "get",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        mode: "cors",
      }
    )
      .then(function (res) {
        return res.json();
      })
      .then(function (res) {
        if (res.success) {
          deletePastData(); // 기존 데이터 삭제
          displayData(res.result); // 새로운 데이터 표시
        } else {
          console.log("데이터 가져오기 실패");
        }
      })
      .catch(function (err) {
        console.error("에러:", err);
      });
  }

  function displayPagination(allPages) {
    const pagenation = document.getElementById("pagenation");

    // 기존 페이지 버튼 삭제
    pagenation.innerHTML = "";

    // 이전 버튼 생성
    const prevButton = document.createElement("button");
    prevButton.textContent = "◀";
    prevButton.addEventListener("click", function () {
      if (currentPage > 1) {
        fetchData(currentPage - 1);
      }
    });
    pagenation.appendChild(prevButton);

    // 현재 페이지 그룹의 시작 페이지 계산
    const startPage =
      Math.floor((currentPage - 1) / pageGroupSize) * pageGroupSize + 1;
    //소수점을 버리기 위해서 매스 플로어를 형성

    // 페이지 그룹의 크기만큼 페이지 버튼 생성
    const endPage = Math.min(startPage + pageGroupSize - 1, allPages);
    // 매스 민은 주어진 숫자중 가장 작은걸 표현함
    for (let i = startPage; i <= endPage; i++) {
      const pageButton = document.createElement("button");
      pageButton.classList.add("Num");
      pageButton.textContent = i;
      if (i === currentPage) {
        pageButton.classList.add("selected");
      }
      pageButton.addEventListener("click", function () {
        fetchData(i);
      });
      pagenation.appendChild(pageButton);
    }

    // 다음 버튼 생성
    const nextButton = document.createElement("button");
    nextButton.textContent = "▶";
    nextButton.addEventListener("click", function () {
      const nextPage = Math.min(currentPage + 1, allPages);
      fetchData(nextPage);
    });
    pagenation.appendChild(nextButton);
  }

  fetchData();
});
