const { pool } = require("../../../config/database");
const { logger } = require("../../../config/winston");

const reportDao = require("../dao/reportDao");
const { userCheck } = require("../dao/linkDao");

// 신고하기
exports.addReport = async function (req, res) {
  const { userIdx } = req.verifiedToken;
  const [userCheckResult] = await userCheck(userIdx);
  const { folderIdx } = req.body;

  if (!userCheckResult)
    return res.json({
      isSuccess: false,
      code: 2010,
      message: "비활성화되어 있거나 탈퇴된 회원입니다.",
    });

  if (!folderIdx) {
    return res.json({
      isSuccess: false,
      code: 2000,
      message: "folderIdx를 입력하세요.",
    });
  }

  if (typeof folderIdx !== "number") {
    return res.json({
      isSuccess: false,
      code: 2001,
      message: "folderIdx는 정수입니다.",
    });
  }
  try {
    const insertReportRow = await reportDao.insertReport(userIdx, folderIdx);
    return res.json({
      reportIdx: insertReportRow.insertId,
      isSuccess: true,
      code: 1000,
      message: "신고하기 성공",
    });
  } catch (err) {
    logger.error(`App - addReport Query error\n: ${err.message}`);
    return res.json({
      isSuccess: false,
      code: 4000,
      message: "신고하기 실패",
    });
  }
};

// 신고 보기(관리자용)
exports.selectReport = async function (req, res) {
  const { folderIdx } = req.params;
  try {
    const selectReportRow = await reportDao.selectReport(folderIdx);
    return res.json({
      isSuccess: true,
      code: 1000,
      message: "신고보기 성공",
      result: selectReportRow,
    });
  } catch (err) {
    logger.error(`App - selectReport Query error\n: ${err.message}`);
    return res.json({
      isSuccess: false,
      code: 4000,
      message: "신고보기 실패",
    });
  }
};
