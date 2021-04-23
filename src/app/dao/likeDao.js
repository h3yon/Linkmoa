const {pool} = require("../../../config/database");
const {logger} = require("../../../config/winston");

//활성화된 유저인덱스인지 체크
async function userCheck(userIdx) {
  const connection = await pool.getConnection(async conn => conn);
  try {
    const userCheckQuery = `select userIdx from User where userIdx = ? and status = 1;`;
    const userCheckParams = [userIdx];
    const [userCheckRows] = await connection.query(userCheckQuery, userCheckParams);
    connection.release();
    return userCheckRows;
  } catch (err) {
    logger.error(`userCheck DB Connection error\n: ${err.message}`);
    connection.release();
    return {isSuccess: false, code: 4000, message: "userCheck DB error"};
  }
}

//폴더 타입, 활성화된 폴더인지 체크
async function folderCheck(folderIdx) {
  const connection = await pool.getConnection(async conn => conn);
  try {
    const folderCheckQuery = `select userIdx, folderType from FolderDetail where folderIdx = ? and status = 1;`;
    const folderCheckParams = [folderIdx];
    const [folderCheckRows] = await connection.query(folderCheckQuery, folderCheckParams);
    connection.release();
    return [folderCheckRows];
  } catch (err) {
    logger.error(`folderCheck DB Connection error\n: ${err.message}`);
    connection.release();
    return {isSuccess: false, code: 4000, message: "folderCheck DB error"};
  }
}

//좋아요 조회 및 좋아요 상태 가져오기
async function likeCheck(userIdx, folderIdx) {
  try {
    const connection = await pool.getConnection(async conn => conn);
    const likeCheckQuery = `
        select status from LikeFolder where userIdx = ? and folderIdx = ?;
        `;
    const likeCheckParams = [userIdx, folderIdx];
    const [likeCheckRows] = await connection.query(likeCheckQuery, likeCheckParams);
    connection.release();
    return likeCheckRows;
  } catch (err) {
    logger.error(`likeCheck DB Connection error\n: ${err.message}`);
    return {isSuccess: false, code: 4000, message: "likeCheck DB error"};
  }
}

//좋아요 추가/삭제
async function insertLike(userIdx, folderIdx, status) {
  const connection = await pool.getConnection(async conn => conn);
  try {
    const insertLikeQuery = `
          INSERT INTO LikeFolder(userIdx, folderIdx, status)
          VALUES(?, ?, ?) ON DUPLICATE KEY UPDATE status = ?;
        `;
    const insertLikeParams = [userIdx, folderIdx, status, status];
    await connection.query(insertLikeQuery, insertLikeParams);
    connection.release();
    return {isSuccess: true};
  } catch (err) {
    logger.error(`insertLike DB Connection error\n: ${err.message}`);
    connection.release();
    return {isSuccess: false, code: 4000, message: "insertLike DB error"};
  }
}

//좋아요한 폴더 조회
async function selectLike(userIdx, word, page, limit) {
  const connection = await pool.getConnection(async conn => conn);
  try {
    const selectLikeQuery = `
    select LikeFolder.userIdx,
       IFNULL(FolderDetail.categoryIdx, 0)                                         as categoryIdx,
       IFNULL(categoryName, -1)                                                    as categoryName,
       IFNULL(FolderDetail.detailCategoryIdx, 0)                                   as detailCategoryIdx,
       IFNULL(detailCategoryName, -1)                                              as detailCategoryName,
       LikeFolder.folderIdx,
       IFNULL(folderLinkCount, 0)                                                  as folderLinkCount,
       FolderDetail.folderName,
       folderType,
       IFNULL(likeFolderCount, 0)                                                  as likeFolderCount,
       IFNULL((select linkImageUrl
               where linkImageUrl is not null and Link.status = 1
               order by Link.createdAt desc
               limit 1), 'https://i.imgur.com/FTGL4iE.png')                                                       as linkImageUrl,
       LikeFolder.Status                                                           as likeStatus,
       case
           when TIMESTAMPDIFF(MINUTE, LikeFolder.updatedAt, now()) < 1
               then concat(TIMESTAMPDIFF(SECOND, LikeFolder.updatedAt, now()), '초전')
           when TIMESTAMPDIFF(HOUR, LikeFolder.updatedAt, now()) < 1
               then concat(TIMESTAMPDIFF(MINUTE, LikeFolder.updatedAt, now()), '분전')
           when TIMESTAMPDIFF(DAY, LikeFolder.updatedAt, now()) < 1
               then concat(TIMESTAMPDIFF(HOUR, LikeFolder.updatedAt, now()), '시간전')
           when TIMESTAMPDIFF(WEEK, LikeFolder.updatedAt, now()) < 1
               then concat(TIMESTAMPDIFF(DAY, LikeFolder.updatedAt, now()), '일전')
           when TIMESTAMPDIFF(MONTH, LikeFolder.updatedAt, now()) < 1
               then concat(TIMESTAMPDIFF(WEEK, LikeFolder.updatedAt, now()), '주전')
           when TIMESTAMPDIFF(YEAR, LikeFolder.updatedAt, now()) < 1
               then concat(TIMESTAMPDIFF(MONTH, LikeFolder.updatedAt, now()), '달전')
           else concat(TIMESTAMPDIFF(YEAR, LikeFolder.updatedAt, now()), '년전') end as updatedAt
    from LikeFolder
            left join FolderDetail on LikeFolder.folderIdx = FolderDetail.folderIdx
            left join Category on FolderDetail.categoryIdx = Category.categoryIdx
            left join Link on Link.folderIdx = LikeFolder.folderIdx
            left join DetailCategory on Category.categoryIdx = DetailCategory.categoryIdx
            left join (select folderIdx, count(*) as likeFolderCount
                        from LikeFolder
                        where LikeFolder.status = 1
                        group by folderIdx) LikeCnt on LikeCnt.folderIdx = FolderDetail.folderIdx
            left join (select folderIdx, count(*) as folderLinkCount
                        from Link
                        where Link.status = 1
                        group by folderIdx) LinkCnt on FolderDetail.folderIdx = LinkCnt.folderIdx
    where LikeFolder.userIdx = ?
      and folderName like concat('%', IFNULL(?, '%'), '%')
      and LikeFolder.status = 1
      and FolderDetail.status = 1
    group by folderIdx, LikeFolder.updatedAt
    order by LikeFolder.updatedAt desc
    Limit ?, ?;
      `;
    const selectLikeParams = [userIdx, word, page, limit];
    const [selectLikeRows] = await connection.query(selectLikeQuery, selectLikeParams);
    connection.release();
    return selectLikeRows;
  } catch (err) {
    logger.error(`selectLike DB error\n: ${err.message}`);
    connection.release();
    return {isSuccess: false, code: 4000, message: "selectLike DB error"};
  }
}

//좋아요한 폴더 갯수 구하기
async function selectLikeCount(userIdx, word) {
  const connection = await pool.getConnection(async conn => conn);
  try {
    const selectLikeCountQuery = `
    select IFNULL(count(*),0) as resultCount from LikeFolder
    inner join FolderDetail on LikeFolder.folderIdx = FolderDetail.folderIdx
    where LikeFolder.userIdx = ?
      and folderName like concat('%', IFNULL(?, '%'), '%')
      and LikeFolder.status = 1
      and FolderDetail.status = 1;
      `;
    const selectLikeCountParams = [userIdx, word];
    const [selectLikeCountRows] = await connection.query(selectLikeCountQuery, selectLikeCountParams);
    connection.release();
    return selectLikeCountRows;
  } catch (err) {
    logger.error(`selectLikeCount DB error\n: ${err.message}`);
    connection.release();
    return {
      isSuccess: false,
      code: 4000,
      message: "selectLikeCount DB error",
    };
  }
}

// 폴더 인덱스 최댓값
async function selectMaxFolderIdx() {
  const connection = await pool.getConnection(async conn => conn);
  const selectMaxFolderIdxQuery = `
  SELECT MAX(folderIdx) as maxFolderIdx FROM TestLinkmoaDb.FolderDetail;
 `;

  const [selectMaxFolderIdxRow] = await connection.query(selectMaxFolderIdxQuery);
  connection.release();
  return selectMaxFolderIdxRow;
}

//탈퇴한 유저가 작성한 폴더에 대해서의 좋아요 상태를 삭제함, 일단 탈퇴한 유저의 좋아요는 놔둠 - 데이터셋 활용 한번 해보기
async function deleteLikeStatus(connection, userIdx) {
  const deleteLikeStatusQuery = `
      delete from LikeFolder
      where not LikeFolder.folderIdx NOT IN
        (select folderIdx
        from (select LikeFolder.folderIdx
              from LikeFolder
                        left join FolderDetail FD on LikeFolder.folderIdx = FD.folderIdx
              where FD.userIdx = ? and FD.status = 0) A);
  ;
      `;
  const deleteLikeStatusParams = [userIdx];
  const [deleteLikeStatusRow] = await connection.query(deleteLikeStatusQuery, deleteLikeStatusParams);
  return deleteLikeStatusRow;
}

module.exports = {
  userCheck,
  folderCheck,
  likeCheck,
  insertLike,
  selectLike,
  selectLikeCount,
  selectMaxFolderIdx,
  deleteLikeStatus,
};
