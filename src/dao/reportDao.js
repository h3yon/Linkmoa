const { pool } = require("../../config/database");

async function insertReport(userIdx, folderIdx) {
  const connection = await pool.getConnection(async (conn) => conn);
  const insertReportQuery = `
            INSERT INTO Report(userIdx, folderIdx)
            VALUES (?, ?);
        `;
  const insertReportParams = [userIdx, folderIdx];
  const [insertReportRow] = await connection.query(insertReportQuery, insertReportParams);
  connection.release();
  return insertReportRow;
}

async function selectReport(folderIdx) {
  const connection = await pool.getConnection(async (conn) => conn);
  const selectReportQuery = `
  SELECT folderIdx, count(*) as reportCount
  FROM Report
  GROUP BY folderIdx;
        `;
  const selectReportParams = [folderIdx];
  const [selectReportRow] = await connection.query(selectReportQuery, selectReportParams);
  connection.release();
  return selectReportRow;
}

module.exports = {
  insertReport,
  selectReport,
};
