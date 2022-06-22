const { pool } = require("../../config/database");
const { logger } = require("../../config/winston");

const folderDao = require("../dao/folderDao");
const { userCheck, likeCheck } = require("../dao/likeDao");
const { PythonShell } = require("python-shell");

// 나의 폴더 조회
exports.selectMyFolder = async function (req, res) {
  const { userIdx } = req.verifiedToken;
  const { page, limit, filter } = req.query;

  const [userCheckResult] = await userCheck(userIdx);
  if (!userCheckResult)
    return res.json({
      isSuccess: false,
      code: 2010,
      message: "비활성화되어 있거나 탈퇴된 회원입니다.",
    });

  if (!page) {
    return res.json({
      isSuccess: false,
      code: 2008,
      message: "page를 입력하세요",
    });
  }

  if (!limit) {
    return res.json({
      isSuccess: false,
      code: 2009,
      message: "limit를 입력하세요",
    });
  }

  if (!filter) {
    return res.json({
      isSuccess: false,
      code: 2006,
      message: "filter를 입력하세요",
    });
  }

  if (!(Number(filter) >= 1 && Number(filter) <= 4)) {
    return res.json({
      isSuccess: false,
      code: 2007,
      message: "filter는 1, 2, 3, 4 중 하나입니다.",
    });
  }

  try {
    let selectMyFolderRow = ``;
    const pageStart = Number(page) * Number(limit);
    if (Number(filter) === 1) selectMyFolderRow = await folderDao.selectMyFolder1(userIdx, pageStart, Number(limit));
    if (Number(filter) === 2) selectMyFolderRow = await folderDao.selectMyFolder2(userIdx, pageStart, Number(limit));
    if (Number(filter) === 3) selectMyFolderRow = await folderDao.selectMyFolder3(userIdx, pageStart, Number(limit));
    if (Number(filter) === 4) selectMyFolderRow = await folderDao.selectMyFolder4(userIdx, pageStart, Number(limit));

    return res.json({
      isSuccess: true,
      code: 1000,
      message: "폴더 조회(나의 가리비) 성공",
      result: selectMyFolderRow,
    });
  } catch (err) {
    logger.error(`App - selectMyFolder Query error\n: ${err.message}`);
    return res.status(500).send(`Error: ${err.message}`);
  }
};

// 사용자 폴더 조회
exports.selectUserFolder = async function (req, res) {
  const { userIdx } = req.verifiedToken;
  const targetUserIdx = req.params.userIdx;
  const { page, limit } = req.query;

  const [userCheckResult] = await userCheck(userIdx);
  if (!userCheckResult)
    return res.json({
      isSuccess: false,
      code: 2010,
      message: "비활성화되어 있거나 탈퇴된 회원입니다.",
    });

  if (!page) {
    return res.json({
      isSuccess: false,
      code: 2008,
      message: "page를 입력하세요",
    });
  }

  if (!limit) {
    return res.json({
      isSuccess: false,
      code: 2009,
      message: "limit를 입력하세요",
    });
  }

  try {
    const pageStart = Number(page) * Number(limit);
    const selectUserFolderRow = await folderDao.selectUserFolder(targetUserIdx, pageStart, Number(limit));
    for (let i = 0; i < selectUserFolderRow.length; i++) {
      const likeStatusRow = await likeCheck(userIdx, selectUserFolderRow[i].folderIdx);
      if (likeStatusRow.length > 0) {
        selectUserFolderRow[i].likeStatus = likeStatusRow[0].status;
      } else {
        selectUserFolderRow[i].likeStatus = 0;
      }
    }
    return res.json({
      isSuccess: true,
      code: 1000,
      message: "사용자 링크달조회 성공",
      result: selectUserFolderRow,
    });
  } catch (err) {
    logger.error(`App - selectUserFolder Query error\n: ${err.message}`);
    return res.json({
      isSuccess: true,
      code: 4000,
      message: "사용자 링크달조회 실패",
    });
  }
};

// 폴더 상세조회
exports.selectFolderDetail = async function (req, res) {
  const { folderIdx } = req.params;
  const { userIdx } = req.verifiedToken;

  const [userCheckResult] = await userCheck(userIdx);
  if (!userCheckResult)
    return res.json({
      isSuccess: false,
      code: 2010,
      message: "비활성화되어 있거나 탈퇴된 회원입니다.",
    });

  try {
    const [selectFolderDetailDetailRow] = await folderDao.selectFolderDetail(folderIdx);
    if (!selectFolderDetailDetailRow) {
      return res.json({
        isSuccess: false,
        code: 4000,
        message: "folderIdx에 존재하는 folder가 없습니다.",
      });
    }

    const selectFolderLinkRow = await folderDao.selectFolderLink(folderIdx);
    const selectFolderTagRow = await folderDao.selectFolderTag(folderIdx);
    const likeCheckRows = await likeCheck(userIdx, folderIdx);
    if (likeCheckRows.length > 0) {
      selectFolderDetailDetailRow.likeStatus = likeCheckRows[0].status;
    } else {
      selectFolderDetailDetailRow.likeStatus = 0;
    }

    selectFolderDetailDetailRow.hashTagList = selectFolderTagRow;
    selectFolderDetailDetailRow.linkList = selectFolderLinkRow;
    return res.json({
      isSuccess: true,
      code: 1000,
      message: "폴더 상세조회 성공",
      result: selectFolderDetailDetailRow,
    });
  } catch (err) {
    logger.error(`App - selectFolderDetail Query error\n: ${err.message}`);
    return res.status(500).send(`Error: ${err.message}`);
  }
};

// 폴더 생성
exports.insertFolder = async function (req, res) {
  const { userIdx } = req.verifiedToken;
  const { folderName, hashTagList, categoryIdx, detailCategoryIdx, folderType } = req.body;

  const conn = await pool.getConnection();
  const [userCheckResult] = await userCheck(userIdx);
  if (!userCheckResult)
    return res.json({
      isSuccess: false,
      code: 2010,
      message: "비활성화되어 있거나 탈퇴된 회원입니다.",
    });

  if (!folderName) {
    return res.json({
      isSuccess: false,
      code: 2000,
      message: "folderName을 입력하세요.",
    });
  }

  if (!(typeof folderName == "string" && folderName.length <= 30)) {
    return res.json({
      isSuccess: false,
      code: 2001,
      message: "folderName은 30자 이하 문자열입니다.",
    });
  }

  if (hashTagList) {
    for (let i = 0; i < hashTagList.length; i++) {
      if (!(typeof hashTagList[i] == "string" && hashTagList[i].length <= 20)) {
        return res.json({
          isSuccess: false,
          code: 2002,
          message: "hashTag는 20자 이하 문자열입니다.",
        });
      }
    }
  }

  if (!folderType) {
    return res.json({
      isSuccess: false,
      code: 2003,
      message: "folderType을 입력하세요.",
    });
  }

  if (!(folderType === "public" || folderType === "private")) {
    return res.json({
      isSuccess: false,
      code: 2004,
      message: "folderType은 public 아니면 private입니다.",
    });
  }
  if (folderType === "public") {
    if (!categoryIdx) {
      return res.json({
        isSuccess: false,
        code: 2005,
        message: "categoryIdx을 입력하세요.",
      });
    }

    if (!/[1-5]/.test(categoryIdx)) {
      return res.json({
        isSuccess: false,
        code: 2006,
        message: "categoryIdx는 1-5 사이의 정수입니다.",
      });
    }

    if (categoryIdx !== 5) {
      if (!detailCategoryIdx) {
        return res.json({
          isSuccess: false,
          code: 2007,
          message: "detailCategoryIdx를 입력하세요.",
        });
      }

      if (!/[1-5]/.test(detailCategoryIdx)) {
        return res.json({
          isSuccess: false,
          code: 2008,
          message: "detailCategoryIdx는 1-30 사이의 정수입니다.",
        });
      }
    }
  } else {
    if (categoryIdx) {
      if (!/[1-5]/.test(categoryIdx)) {
        return res.json({
          isSuccess: false,
          code: 2006,
          message: "categoryIdx는 1-5 사이의 정수입니다.",
        });
      }
    }
    if (detailCategoryIdx) {
      if (!/[1-5]/.test(detailCategoryIdx)) {
        return res.json({
          isSuccess: false,
          code: 2008,
          message: "detailCategoryIdx는 1-30 사이의 정수입니다.",
        });
      }
    }
  }

  try {
    await conn.beginTransaction();
    const insertFolderDetailParams = [userIdx, categoryIdx, detailCategoryIdx, folderName, folderType];
    const insertFolderDetailRow = await folderDao.insertFolderDetail(conn, insertFolderDetailParams);
    if (insertFolderDetailRow.length === 0) {
      return res.json({
        isSuccess: false,
        code: 4000,
        message: "폴더 생성 실패",
      });
    }
    const folderIdx = insertFolderDetailRow.insertId;
    for (let i = 0; i < hashTagList.length; i++) {
      await folderDao.insertFolderTag(conn, folderIdx, hashTagList[i]);
    }

    await conn.commit();
    return res.json({
      folderIdx: folderIdx,
      isSuccess: true,
      code: 1000,
      message: "폴더 생성 성공",
    });
  } catch (err) {
    await conn.rollback();
    logger.error(`App - insertFolder Query error\n: ${err.message}`);
    return res.status(500).send(`Error: ${err.message}`);
  } finally {
    conn.release();
  }
};

// 폴더 수정
exports.updateFolder = async function (req, res) {
  const { userIdx } = req.verifiedToken;
  const { folderIdx } = req.params;
  const { folderName, hashTagList, categoryIdx, detailCategoryIdx, folderType } = req.body;

  const conn = await pool.getConnection();

  const [userCheckResult] = await userCheck(userIdx);
  if (!userCheckResult)
    return res.json({
      isSuccess: false,
      code: 2010,
      message: "비활성화되어 있거나 탈퇴된 회원입니다.",
    });

  if (!folderName) {
    return res.json({
      isSuccess: false,
      code: 2000,
      message: "folderName을 입력하세요.",
    });
  }

  if (!(typeof folderName == "string" && folderName.length <= 30)) {
    return res.json({
      isSuccess: false,
      code: 2001,
      message: "folderName은 30자 이하 문자열입니다.",
    });
  }

  if (hashTagList) {
    for (let i = 0; i < hashTagList.length; i++) {
      if (!(typeof hashTagList[i] == "string" && hashTagList[i].length <= 20)) {
        return res.json({
          isSuccess: false,
          code: 2002,
          message: "hashTag는 20자 이하 문자열입니다.",
        });
      }
    }
  }

  if (!folderType) {
    return res.json({
      isSuccess: false,
      code: 2003,
      message: "folderType을 입력하세요.",
    });
  }

  if (!(folderType === "public" || folderType === "private")) {
    return res.json({
      isSuccess: false,
      code: 2004,
      message: "folderType은 public 아니면 private입니다.",
    });
  }
  if (folderType === "public") {
    if (!categoryIdx) {
      return res.json({
        isSuccess: false,
        code: 2005,
        message: "categoryIdx을 입력하세요.",
      });
    }

    if (!/[1-5]/.test(categoryIdx)) {
      return res.json({
        isSuccess: false,
        code: 2006,
        message: "categoryIdx는 1-5 사이의 정수입니다.",
      });
    }
    if (categoryIdx !== 5) {
      if (!detailCategoryIdx) {
        return res.json({
          isSuccess: false,
          code: 2007,
          message: "detailCategoryIdx를 입력하세요.",
        });
      }

      if (!/[1-5]/.test(detailCategoryIdx)) {
        return res.json({
          isSuccess: false,
          code: 2008,
          message: "detailCategoryIdx는 1-30 사이의 정수입니다.",
        });
      }
    }
  } else {
    if (categoryIdx) {
      if (!/[1-5]/.test(categoryIdx)) {
        return res.json({
          isSuccess: false,
          code: 2006,
          message: "categoryIdx는 1-5 사이의 정수입니다.",
        });
      }
    }
    if (detailCategoryIdx) {
      if (!/[1-5]/.test(detailCategoryIdx)) {
        return res.json({
          isSuccess: false,
          code: 2008,
          message: "detailCategoryIdx는 1-30 사이의 정수입니다.",
        });
      }
    }
  }

  try {
    const updateFolderDetailParams = [categoryIdx, detailCategoryIdx, folderName, folderType, folderIdx];
    await folderDao.updateFolderDetail(conn, updateFolderDetailParams);

    await folderDao.deleteFolderTag(conn, folderIdx);
    for (let i = 0; i < hashTagList.length; i++) {
      await folderDao.insertFolderTag(conn, folderIdx, hashTagList[i]);
    }

    await conn.commit();
    return res.json({
      isSuccess: true,
      code: 1000,
      message: "폴더 수정 성공",
    });
  } catch (err) {
    await conn.rollback();
    logger.error(`App - updateFolder Query error\n: ${err.message}`);
    return res.status(500).send(`Error: ${err.message}`);
  } finally {
    conn.release();
  }
};

// 폴더 삭제
exports.deleteFolder = async function (req, res) {
  const { userIdx } = req.verifiedToken;
  const { folderIdx } = req.params;

  const conn = await pool.getConnection();

  const [userCheckResult] = await userCheck(userIdx);
  if (!userCheckResult)
    return res.json({
      isSuccess: false,
      code: 2010,
      message: "비활성화되어 있거나 탈퇴된 회원입니다.",
    });

  try {
    await conn.beginTransaction();

    const selectFolderDetailRows = await folderDao.selectFolderDetail(folderIdx);
    if (selectFolderDetailRows.length === 0) {
      return res.json({
        isSuccess: false,
        code: 2000,
        message: "folderIdx에 존재하는 folder가 없습니다.",
      });
    }
    if (selectFolderDetailRows[0].userIdx !== userIdx) {
      return res.json({
        isSuccess: false,
        code: 2001,
        message: "권한이 없습니다.",
      });
    }

    await folderDao.deleteFolderByStatus(conn, folderIdx);
    await folderDao.deleteFolderTag(conn, folderIdx);
    await folderDao.deleteLinkByStatus(conn, folderIdx);

    await conn.commit();
    return res.json({
      isSuccess: true,
      code: 1000,
      message: "폴더 삭제 성공",
    });
  } catch (err) {
    await conn.rollback();
    logger.error(`App - deleteFolder Query error\n: ${err.message}`);
    return res.status(500).send(`Error: ${err.message}`);
  } finally {
    conn.release();
  }
};

/* 이 부분 추가 */
exports.getTopFolder = async function (req, res) {
  const token = req.verifiedToken;

  try {
    const [userCheckResult] = await userCheck(token.userIdx);
    if (!userCheckResult)
      return res.json({
        isSuccess: false,
        code: 2010,
        message: "비활성화되어 있거나 탈퇴된 회원입니다",
      });
    const getTopFolderResult = await folderDao.selectTopFolder(token.userIdx);
    if (getTopFolderResult.isSuccess == false) return res.json(getTopFolderResult);
    if (!getTopFolderResult || getTopFolderResult.length < 1)
      return res.json({
        isSuccess: true,
        code: 2001,
        userIdx: token.userIdx,
        message: "탑텐 링크달이 존재하지 않습니다",
      });
    return res.json({
      isSuccess: true,
      code: 1000,
      userIdx: token.userIdx,
      message: "탑텐 링크달 조회 성공",
      result: getTopFolderResult,
    });
  } catch (err) {
    logger.error(`getTopFolder error\n: ${JSON.stringify(err)}`);
    return res.json({
      isSuccess: false,
      code: 2000,
      userIdx: token.userIdx,
      message: "탑텐 링크달 조회 실패",
    });
  }
};

exports.searchFolder = async function (req, res) {
  const token = req.verifiedToken;
  let searchWord = req.query.word;
  const { page, limit, isMyFolders } = req.query;

  if (!page) {
    return res.json({
      isSuccess: false,
      code: 2011,
      message: "page를 입력하세요",
    });
  }

  if (!searchWord || searchWord.length < 1) {
    searchWord = null;
  }

  if (!limit) {
    return res.json({
      isSuccess: false,
      code: 2012,
      message: "limit를 입력하세요",
    });
  }
  if (isMyFolders && !isNaN(isMyFolders) == false) {
    return res.json({
      isSuccess: false,
      code: 2003,
      message: "잘못된 기준 번호입니다",
    });
  }
  try {
    const [userCheckResult] = await userCheck(token.userIdx);
    const pageStart = Number(page) * Number(limit);
    if (!userCheckResult)
      return res.json({
        isSuccess: false,
        code: 2010,
        message: "비활성화되어 있거나 탈퇴된 회원입니다",
      });
    if (isMyFolders == 1) {
      const myFolderCount = await folderDao.selectMyFolderCount(searchWord, token.userIdx);
      if (myFolderCount.isSuccess == false) return res.json(myFolderCount);

      const searchMyFolderResult = await folderDao.selectMySearchFolder(
        token.userIdx,
        searchWord,
        pageStart,
        Number(limit)
      );
      if (searchMyFolderResult.isSuccess == false) return res.json(searchMyFolderResult);
      return res.json({
        isSuccess: true,
        code: 1000,
        userIdx: token.userIdx,
        message: "폴더 검색 성공",
        resultCount: myFolderCount[0].folderCount,
        result: searchMyFolderResult,
      });
    }

    const folderCount = await folderDao.selectFolderCount(searchWord);
    if (folderCount.isSuccess == false) return res.json(folderCount);

    const searchFolderResult = await folderDao.selectSearchFolder(token.userIdx, searchWord, pageStart, Number(limit));
    if (searchFolderResult.isSuccess == false) return res.json(searchFolderResult);
    if (!searchFolderResult || searchFolderResult.length < 1) {
      return res.json({
        isSuccess: false,
        code: 2001,
        userIdx: token.userIdx,
        message: "검색 결과가 없습니다",
        resultCount: folderCount[0].folderCount,
        result: [],
      });
    }

    return res.json({
      isSuccess: true,
      code: 1000,
      userIdx: token.userIdx,
      message: "폴더 검색 성공",
      resultCount: folderCount[0].folderCount,
      result: searchFolderResult,
    });
  } catch (err) {
    logger.error(`searchFolder error\n: ${JSON.stringify(err)}`);
    return res.json({
      isSuccess: false,
      code: 2000,
      userIdx: token.userIdx,
      message: "폴더 검색 실패",
    });
  }
};

exports.todayFolder = async function (req, res) {
  const token = req.verifiedToken;

  try {
    const [userCheckResult] = await userCheck(token.userIdx);
    if (!userCheckResult)
      return res.json({
        isSuccess: false,
        code: 2010,
        message: "비활성화되어 있거나 탈퇴된 회원입니다",
      });

    const likeFolderResult = await folderDao.selectLikeFolder(token.userIdx);
    if (!likeFolderResult || likeFolderResult.length < 1) {
      //유저의 좋아요 정보가 없을 때 제일 인기 있는 폴더를 노출
      const topFolderResult = await folderDao.selectTopOneFolder(token.userIdx);
      if (topFolderResult.isSuccess == false) return res.json(topFolderResult);
      return res.json({
        isSuccess: true,
        code: 1000,
        userIdx: token.userIdx,
        message: "오늘의 추천 링크달 조회 성공",
        result: topFolderResult,
      });
    }
    // //좋아요 정보가 있을 때
    let options = {
      mode: "text",
      pythonPath: "python3",
      pythonOptions: ["-u"],
      scriptPath: "",
      args: [likeFolderResult[0].folderName],
      encoding: "utf8",
    };

    async function firstTodayFolder(userIdx) {
      return new Promise((resolve, reject) => {
        const firstFolderInfoRows = folderDao.selectTodayFolder(userIdx);
        resolve(firstFolderInfoRows);
      });
    }

    async function folderInfo(userIdx, folderName) {
      return new Promise((resolve, reject) => {
        const folderInfoRows = folderDao.selectFolderInfo(userIdx, folderName);
        resolve(folderInfoRows);
      });
    }

    PythonShell.run(
      // "/Users/h3yon/Desktop/matrix_factorization.py",
      "src/controllers/recommend/recommend.py",
      options,
      async function (err, results) {
        if (err || results.length < 1 || !results) {
          //기존 추천 방법 contents based
          topFolderRows = await firstTodayFolder(token.userIdx);
          if (topFolderRows.isSuccess == false) return res.json(topFolderRows);
          return res.json({
            isSuccess: true,
            code: 1000,
            userIdx: token.userIdx,
            message: "오늘의 추천 링크달 조회 성공",
            result: topFolderRows,
          });
        } else {
          //results에서 랜덤하게 하나 뽑아야 함.
          console.log(results);
          const todayFolderResult = await folderInfo(token.userIdx, results[0]);
          return res.json({
            isSuccess: true,
            code: 1000,
            userIdx: token.userIdx,
            message: "오늘의 추천 링크달 조회 성공",
            result: todayFolderResult,
          });
        }
      }
    );
  } catch (err) {
    console.log(err);
    return res.json({
      isSuccess: false,
      code: 2000,
      userIdx: token.userIdx,
      message: "오늘의 추천 링크달 조회 실패",
    });
  }
};