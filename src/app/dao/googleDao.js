const { pool } = require("../../../config/database");

//소셜 계정이 있는지 체크
async function socialIdCheck(socialId) {
  const connection = await pool.getConnection(async (conn) => conn);
  try {
    const socialIdCheckQuery = `select userIdx from User where status = 1 and socialId = ? and userStrategy = 'google';`;
    const socialIdCheckParams = [socialId];
    const [socialIdCheckRows] = await connection.query(socialIdCheckQuery, socialIdCheckParams);
    connection.release();
    return socialIdCheckRows;
  } catch (err) {
    logger.error(`socialIdCheck DB error\n: ${err.message}`);
    connection.release();
    return { isSuccess: false, code: 4000, message: "socialIdCheck DB error" };
  }
}

//소셜로그인에 넣을 userIdx 가져오기
async function selectLatestUserIdx(socialId) {
  const connection = await pool.getConnection(async (conn) => conn);
  try {
    const selectLatestUserIdxQuery = `
      SELECT userIdx FROM User WHERE status = 1 and
       socialId = ? and userStrategy = 'google' limit 1;
    `;
    const selectLatestUserIdxParams = [socialId];
    const [selectLatestUserIdxRows] = await connection.query(selectLatestUserIdxQuery, selectLatestUserIdxParams);
    // console.log(selectLatestUserIdxRows[0].userIdx);
    connection.release();
    return selectLatestUserIdxRows;
  } catch (err) {
    console.log(err);
    connection.release();
    return {
      isSuccess: false,
      code: 4000,
      message: "selectLatestUserIdx DB error",
    };
  }
}

//소셜로그인에 넣을 userIdx 가져오기
async function insertGoogleUser(socialId, userEmail) {
  const connection = await pool.getConnection(async (conn) => conn);
  try {
    const insertGoogleUserQuery = `INSERT User(userStrategy, socialId, userEmail) VALUES('google', ?, ?);`;
    const insertGoogleUserParams = [socialId, userEmail];
    const [insertGoogleUserRows] = await connection.query(insertGoogleUserQuery, insertGoogleUserParams);
    connection.release();
    return insertGoogleUserRows;
  } catch (err) {
    console.log(err);
    connection.release();
    return {
      isSuccess: false,
      code: 4000,
      message: "insertGoogleUser DB error",
    };
  }
}

//유저정보추가(프로필/닉네임)
async function updateUserInfo(userNickname, userProfileImgUrl, userIdx, userCategoryIdx, userDetailCategoryIdx) {
  const connection = await pool.getConnection(async (conn) => conn);
  try {
    const updateUserInfoQuery = `
    update User 
    set userNickname = ?, userProfileImgUrl = ?, userCategoryIdx = ?, userDetailCategoryIdx = ?
    where userIdx = ?;
    `;
    const updateUserInfoParams = [userNickname, userProfileImgUrl, userCategoryIdx, userDetailCategoryIdx, userIdx];
    await connection.query(updateUserInfoQuery, updateUserInfoParams);
    connection.release();
    return { isSuccess: true };
  } catch (err) {
    console.log(err);
    connection.release();
    return { isSuccess: false, code: 4000, message: "updateUserInfo DB error" };
  }
}

//활성화된 유저인덱스인지 체크
async function userCheck(userIdx) {
  const connection = await pool.getConnection(async (conn) => conn);
  try {
    const userCheckQuery = `select userIdx from User where userIdx = ? and status = 1;`;
    const userCheckParams = [userIdx];
    const [userCheckRows] = await connection.query(userCheckQuery, userCheckParams);
    connection.release();
    return userCheckRows;
  } catch (err) {
    logger.error(`userCheck DB Connection error\n: ${err.message}`);
    connection.release();
    return { isSuccess: false, code: 4000, message: "userCheck DB error" };
  }
}

async function insertFolderDetail(insertFolderDetailParams) {
  const connection = await pool.getConnection(async (conn) => conn);
  try {
    const insertFolderQuery = `
            INSERT INTO FolderDetail(userIdx, categoryIdx, detailCategoryIdx, folderName, folderType)
            VALUES (?, ?, ?, ?, ?);
        `;
    const [insertFolderDetailRow] = await connection.query(insertFolderQuery, insertFolderDetailParams);
    return insertFolderDetailRow;
  } catch (err) {
    connection.release();
    return {
      isSuccess: false,
      code: 4000,
      message: "insertFolderDetail DB error",
    };
  }
}

async function insertFolderTag(folderIdx, folderName) {
  const connection = await pool.getConnection(async (conn) => conn);
  try {
    const insertFolderTagQuery = `
          INSERT INTO FolderTag(folderIdx, tagName)
          VALUES (?, ?);
      `;
    const insertFolderTagParams = [folderIdx, folderName];
    const [insertFolderTagRow] = await connection.query(insertFolderTagQuery, insertFolderTagParams);
    return insertFolderTagRow;
  } catch (err) {
    connection.release();
    return {
      isSuccess: false,
      code: 4000,
      message: "insertFolderTag DB error",
    };
  }
}

async function selectFirstFolderIdx(userIdx) {
  const connection = await pool.getConnection(async (conn) => conn);
  try {
    const selectFirstFolderIdxQuery = `
      select folderIdx from FolderDetail where userIdx = ? and status = 1 order by createdAt asc limit 1;
      `;
    const selectFirstFolderIdxParams = [userIdx];
    const [selectFirstFolderIdxRow] = await connection.query(selectFirstFolderIdxQuery, selectFirstFolderIdxParams);
    return selectFirstFolderIdxRow;
  } catch (err) {
    connection.release();
    return {
      isSuccess: false,
      code: 4000,
      message: "selectFirstFolderIdx DB error",
    };
  }
}

// 유저 닉네임 체크
async function userNicknameCheck(userIdx, userNickname) {
  const connection = await pool.getConnection(async (conn) => conn);
  const userNicknameCheckQuery = `
  SELECT userNickname 
  FROM User 
  WHERE status = 1 and userIdx != ? and userNickname = ?;
`;
  const userNicknameCheckParams = [userIdx, userNickname];
  const [userNicknameCheckRow] = await connection.query(userNicknameCheckQuery, userNicknameCheckParams);
  connection.release();
  return userNicknameCheckRow;
}

module.exports = {
  socialIdCheck,
  selectLatestUserIdx,
  insertGoogleUser,
  updateUserInfo,
  userCheck,
  insertFolderDetail,
  insertFolderTag,
  selectFirstFolderIdx,
  userNicknameCheck,
};
