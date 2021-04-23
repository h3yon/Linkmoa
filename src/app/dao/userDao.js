const { pool } = require("../../../config/database");

//소셜 계정이 있는지 체크
async function socialIdCheck(socialId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const socialIdCheckQuery = `
          SELECT userIdx 
          FROM User 
          WHERE status = 1 and socialId = ? and userStrategy = 'apple';`;
  const socialIdCheckParams = [socialId];
  const [socialIdCheckRows] = await connection.query(socialIdCheckQuery, socialIdCheckParams);
  connection.release();
  return socialIdCheckRows;
}

// 애플 회원 가입
async function insertAppleUser(connection, socialId, userEmail) {
  // const connection = await pool.getConnection(async (conn) => conn);
  const insertAppleUserQuery = `
          INSERT User(userStrategy, socialId, userEmail)
          VALUES ('apple', ?, ?);
          `;
  const insertAppleUserParams = [socialId, userEmail];
  const [insertAppleUserRows] = await connection.query(insertAppleUserQuery, insertAppleUserParams);
  // connection.release();
  return insertAppleUserRows;
}

// 회원 탈퇴
async function deleteUserInfo(connection, userIdx) {
  const deleteUserInfoQuery = `
            UPDATE User
            SET status = 0
            WHERE userIdx = ?
          `;
  const deleteUserInfoParams = [userIdx];
  const [deleteUserInfoRows] = await connection.query(deleteUserInfoQuery, deleteUserInfoParams);
  return deleteUserInfoRows;
}

// 탈퇴하려는 회원이 작성한 폴더
async function selectMyFolder(connection, userIdx) {
  const selectMyFolderQuery = `
  SELECT folderIdx
  FROM User U
           INNER JOIN FolderDetail F ON U.userIdx = F.userIdx
  WHERE U.userIdx = ?;
`;
  const selectMyFolderParams = [userIdx];
  const [selectMyFolderRow] = await connection.query(selectMyFolderQuery, selectMyFolderParams);
  return selectMyFolderRow;
}

// 회원정보 조회
async function selectUserInfo(userIdx) {
  const connection = await pool.getConnection(async (conn) => conn);
  const selectUserInfoQuery = `
      select userIdx,
      case when userStrategy = 'apple' then 1 else 2 end as userStrategy,
      IFNULL(userNickname, -1) as userNickname, userEmail, 
      IFNULL(userProfileImgUrl, -1) as userProfileImgUrl, 
      IFNULL(userCategoryIdx, -1) as userCategoryIdx,
      IFNULL(userDetailCategoryIdx, -1) as userDetailCategoryIdx
      from User
      where status = 1 and userIdx = ?;
          `;
  const selectUserInfoParams = [userIdx];
  const [selectUserInfoRows] = await connection.query(selectUserInfoQuery, selectUserInfoParams);
  connection.release();
  return selectUserInfoRows;
}

module.exports = {
  socialIdCheck,
  insertAppleUser,
  deleteUserInfo,
  selectMyFolder,
  selectUserInfo,
};
