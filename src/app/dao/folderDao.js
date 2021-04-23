const { pool } = require("../../../config/database");

async function selectMyFolder1(userIdx, page, limit) {
  const connection = await pool.getConnection(async (conn) => conn);
  const selectMyFolderQuery = `
  SELECT F.folderIdx,
  F.folderName,
  IFNULL(C.categoryName, -1)                                         as categoryName,
  IFNULL(DC.detailCategoryName, -1)                                  as detailCategoryName,
  F.folderType,
  IFNULL(count, 0)                                                   as folderLinkCount,
  IFNULL((select linkImageUrl
          from Link
          where F.folderIdx = Link.folderIdx and Link.status = 1 and Link.linkImageUrl != 'https://i.imgur.com/FTGL4iE.png'
          order by Link.createdAt desc
          limit 1) , 'https://i.imgur.com/FTGL4iE.png')                                             as linkImageUrl,
  case
  when TIMESTAMPDIFF(MINUTE, F.createdAt, now()) < 1
      then concat(TIMESTAMPDIFF(SECOND, F.createdAt, now()), '초전')
  when TIMESTAMPDIFF(HOUR, F.createdAt, now()) < 1 then concat(TIMESTAMPDIFF(MINUTE, F.createdAt, now()), '분전')
  when TIMESTAMPDIFF(DAY, F.createdAt, now()) < 1 then concat(TIMESTAMPDIFF(HOUR, F.createdAt, now()), '시간전')
  when TIMESTAMPDIFF(WEEK, F.createdAt, now()) < 1 then concat(TIMESTAMPDIFF(DAY, F.createdAt, now()), '일전')
  when TIMESTAMPDIFF(MONTH, F.createdAt, now()) < 1 then concat(TIMESTAMPDIFF(WEEK, F.createdAt, now()), '주전')
  when TIMESTAMPDIFF(YEAR, F.createdAt, now()) < 1 then concat(TIMESTAMPDIFF(MONTH, F.createdAt, now()), '달전')
  else concat(TIMESTAMPDIFF(YEAR, F.createdAt, now()), '년전') end as createdAt,
  case
      when TIMESTAMPDIFF(MINUTE, F.updatedAt, now()) < 1
          then concat(TIMESTAMPDIFF(SECOND, F.updatedAt, now()), '초전')
      when TIMESTAMPDIFF(HOUR, F.updatedAt, now()) < 1 then concat(TIMESTAMPDIFF(MINUTE, F.updatedAt, now()), '분전')
      when TIMESTAMPDIFF(DAY, F.updatedAt, now()) < 1 then concat(TIMESTAMPDIFF(HOUR, F.updatedAt, now()), '시간전')
      when TIMESTAMPDIFF(WEEK, F.updatedAt, now()) < 1 then concat(TIMESTAMPDIFF(DAY, F.updatedAt, now()), '일전')
      when TIMESTAMPDIFF(MONTH, F.updatedAt, now()) < 1 then concat(TIMESTAMPDIFF(WEEK, F.updatedAt, now()), '주전')
      when TIMESTAMPDIFF(YEAR, F.updatedAt, now()) < 1 then concat(TIMESTAMPDIFF(MONTH, F.updatedAt, now()), '달전')
      else concat(TIMESTAMPDIFF(YEAR, F.updatedAt, now()), '년전') end as updatedAt
  FROM FolderDetail F
      LEFT OUTER JOIN (SELECT folderIdx, count(*) as count FROM Link WHERE Link.status = 1 GROUP BY folderIdx) LinkCount
                      ON F.folderIdx = LinkCount.folderIdx
      LEFT OUTER JOIN Category C ON F.categoryIdx = C.categoryIdx
      LEFT OUTER JOIN DetailCategory DC ON F.detailCategoryIdx = DC.detailCategoryIdx
  WHERE F.userIdx = ?
  and F.status = 1
  ORDER BY F.createdAt DESC 
  Limit ?, ?;
`;
  const selectMyFolderParams = [userIdx, page, limit];
  const [selectMyFolderRow] = await connection.query(selectMyFolderQuery, selectMyFolderParams);
  connection.release();
  return selectMyFolderRow;
}

async function selectMyFolder2(userIdx, page, limit) {
  const connection = await pool.getConnection(async (conn) => conn);
  const selectMyFolderQuery = `
  SELECT F.folderIdx,
  F.folderName,
  IFNULL(C.categoryName, -1)                                         as categoryName,
  IFNULL(DC.detailCategoryName, -1)                                  as detailCategoryName,
  F.folderType,
  IFNULL(count, 0)                                                   as folderLinkCount,
  IFNULL((select linkImageUrl
          from Link
          where F.folderIdx = Link.folderIdx and Link.status = 1 and Link.linkImageUrl != 'https://i.imgur.com/FTGL4iE.png'
          order by Link.createdAt desc
          limit 1) , 'https://i.imgur.com/FTGL4iE.png')                                             as linkImageUrl,
  case
  when TIMESTAMPDIFF(MINUTE, F.createdAt, now()) < 1
      then concat(TIMESTAMPDIFF(SECOND, F.createdAt, now()), '초전')
  when TIMESTAMPDIFF(HOUR, F.createdAt, now()) < 1 then concat(TIMESTAMPDIFF(MINUTE, F.createdAt, now()), '분전')
  when TIMESTAMPDIFF(DAY, F.createdAt, now()) < 1 then concat(TIMESTAMPDIFF(HOUR, F.createdAt, now()), '시간전')
  when TIMESTAMPDIFF(WEEK, F.createdAt, now()) < 1 then concat(TIMESTAMPDIFF(DAY, F.createdAt, now()), '일전')
  when TIMESTAMPDIFF(MONTH, F.createdAt, now()) < 1 then concat(TIMESTAMPDIFF(WEEK, F.createdAt, now()), '주전')
  when TIMESTAMPDIFF(YEAR, F.createdAt, now()) < 1 then concat(TIMESTAMPDIFF(MONTH, F.createdAt, now()), '달전')
  else concat(TIMESTAMPDIFF(YEAR, F.createdAt, now()), '년전') end as createdAt,
  case
      when TIMESTAMPDIFF(MINUTE, F.updatedAt, now()) < 1
          then concat(TIMESTAMPDIFF(SECOND, F.updatedAt, now()), '초전')
      when TIMESTAMPDIFF(HOUR, F.updatedAt, now()) < 1 then concat(TIMESTAMPDIFF(MINUTE, F.updatedAt, now()), '분전')
      when TIMESTAMPDIFF(DAY, F.updatedAt, now()) < 1 then concat(TIMESTAMPDIFF(HOUR, F.updatedAt, now()), '시간전')
      when TIMESTAMPDIFF(WEEK, F.updatedAt, now()) < 1 then concat(TIMESTAMPDIFF(DAY, F.updatedAt, now()), '일전')
      when TIMESTAMPDIFF(MONTH, F.updatedAt, now()) < 1 then concat(TIMESTAMPDIFF(WEEK, F.updatedAt, now()), '주전')
      when TIMESTAMPDIFF(YEAR, F.updatedAt, now()) < 1 then concat(TIMESTAMPDIFF(MONTH, F.updatedAt, now()), '달전')
      else concat(TIMESTAMPDIFF(YEAR, F.updatedAt, now()), '년전') end as updatedAt
  FROM FolderDetail F
      LEFT OUTER JOIN (SELECT folderIdx, count(*) as count FROM Link WHERE Link.status = 1 GROUP BY folderIdx) LinkCount
                      ON F.folderIdx = LinkCount.folderIdx
      LEFT OUTER JOIN Category C ON F.categoryIdx = C.categoryIdx
      LEFT OUTER JOIN DetailCategory DC ON F.detailCategoryIdx = DC.detailCategoryIdx
  WHERE F.userIdx = ?
  and F.status = 1
  ORDER BY binary(F.folderName),  F.createdAt DESC
  Limit ?, ?;
`;
  const selectMyFolderParams = [userIdx, page, limit];
  const [selectMyFolderRow] = await connection.query(selectMyFolderQuery, selectMyFolderParams);
  connection.release();
  return selectMyFolderRow;
}

async function selectMyFolder3(userIdx, page, limit) {
  const connection = await pool.getConnection(async (conn) => conn);
  const selectMyFolderQuery = `
  SELECT F.folderIdx,
  F.folderName,
  IFNULL(C.categoryName, -1)                                         as categoryName,
  IFNULL(DC.detailCategoryName, -1)                                  as detailCategoryName,
  F.folderType,
  IFNULL(count, 0)                                                   as folderLinkCount,
  IFNULL((select linkImageUrl
          from Link
          where F.folderIdx = Link.folderIdx and Link.status = 1 and Link.linkImageUrl != 'https://i.imgur.com/FTGL4iE.png'
          order by Link.createdAt desc
          limit 1) , 'https://i.imgur.com/FTGL4iE.png')                                             as linkImageUrl,
  case
  when TIMESTAMPDIFF(MINUTE, F.createdAt, now()) < 1
      then concat(TIMESTAMPDIFF(SECOND, F.createdAt, now()), '초전')
  when TIMESTAMPDIFF(HOUR, F.createdAt, now()) < 1 then concat(TIMESTAMPDIFF(MINUTE, F.createdAt, now()), '분전')
  when TIMESTAMPDIFF(DAY, F.createdAt, now()) < 1 then concat(TIMESTAMPDIFF(HOUR, F.createdAt, now()), '시간전')
  when TIMESTAMPDIFF(WEEK, F.createdAt, now()) < 1 then concat(TIMESTAMPDIFF(DAY, F.createdAt, now()), '일전')
  when TIMESTAMPDIFF(MONTH, F.createdAt, now()) < 1 then concat(TIMESTAMPDIFF(WEEK, F.createdAt, now()), '주전')
  when TIMESTAMPDIFF(YEAR, F.createdAt, now()) < 1 then concat(TIMESTAMPDIFF(MONTH, F.createdAt, now()), '달전')
  else concat(TIMESTAMPDIFF(YEAR, F.createdAt, now()), '년전') end as createdAt,
  case
      when TIMESTAMPDIFF(MINUTE, F.updatedAt, now()) < 1
          then concat(TIMESTAMPDIFF(SECOND, F.updatedAt, now()), '초전')
      when TIMESTAMPDIFF(HOUR, F.updatedAt, now()) < 1 then concat(TIMESTAMPDIFF(MINUTE, F.updatedAt, now()), '분전')
      when TIMESTAMPDIFF(DAY, F.updatedAt, now()) < 1 then concat(TIMESTAMPDIFF(HOUR, F.updatedAt, now()), '시간전')
      when TIMESTAMPDIFF(WEEK, F.updatedAt, now()) < 1 then concat(TIMESTAMPDIFF(DAY, F.updatedAt, now()), '일전')
      when TIMESTAMPDIFF(MONTH, F.updatedAt, now()) < 1 then concat(TIMESTAMPDIFF(WEEK, F.updatedAt, now()), '주전')
      when TIMESTAMPDIFF(YEAR, F.updatedAt, now()) < 1 then concat(TIMESTAMPDIFF(MONTH, F.updatedAt, now()), '달전')
      else concat(TIMESTAMPDIFF(YEAR, F.updatedAt, now()), '년전') end as updatedAt
  FROM FolderDetail F
      LEFT OUTER JOIN (SELECT folderIdx, count(*) as count FROM Link WHERE Link.status = 1 GROUP BY folderIdx) LinkCount
                      ON F.folderIdx = LinkCount.folderIdx
      LEFT OUTER JOIN Category C ON F.categoryIdx = C.categoryIdx
      LEFT OUTER JOIN DetailCategory DC ON F.detailCategoryIdx = DC.detailCategoryIdx
  WHERE F.userIdx = ?
  and F.status = 1
  ORDER BY F.createdAt
  Limit ?, ?;
`;
  const selectMyFolderParams = [userIdx, page, limit];
  const [selectMyFolderRow] = await connection.query(selectMyFolderQuery, selectMyFolderParams);
  connection.release();
  return selectMyFolderRow;
}

async function selectMyFolder4(userIdx, page, limit) {
  const connection = await pool.getConnection(async (conn) => conn);
  const selectMyFolderQuery = `
  SELECT F.folderIdx,
  F.folderName,
  IFNULL(C.categoryName, -1)                                         as categoryName,
  IFNULL(DC.detailCategoryName, -1)                                  as detailCategoryName,
  F.folderType,
  IFNULL(count, 0)                                                   as folderLinkCount,
  IFNULL((select linkImageUrl
          from Link
          where F.folderIdx = Link.folderIdx and Link.status = 1 and Link.linkImageUrl != 'https://i.imgur.com/FTGL4iE.png'
          order by Link.createdAt desc
          limit 1) , 'https://i.imgur.com/FTGL4iE.png')                                             as linkImageUrl,
  case
  when TIMESTAMPDIFF(MINUTE, F.createdAt, now()) < 1
      then concat(TIMESTAMPDIFF(SECOND, F.createdAt, now()), '초전')
  when TIMESTAMPDIFF(HOUR, F.createdAt, now()) < 1 then concat(TIMESTAMPDIFF(MINUTE, F.createdAt, now()), '분전')
  when TIMESTAMPDIFF(DAY, F.createdAt, now()) < 1 then concat(TIMESTAMPDIFF(HOUR, F.createdAt, now()), '시간전')
  when TIMESTAMPDIFF(WEEK, F.createdAt, now()) < 1 then concat(TIMESTAMPDIFF(DAY, F.createdAt, now()), '일전')
  when TIMESTAMPDIFF(MONTH, F.createdAt, now()) < 1 then concat(TIMESTAMPDIFF(WEEK, F.createdAt, now()), '주전')
  when TIMESTAMPDIFF(YEAR, F.createdAt, now()) < 1 then concat(TIMESTAMPDIFF(MONTH, F.createdAt, now()), '달전')
  else concat(TIMESTAMPDIFF(YEAR, F.createdAt, now()), '년전') end as createdAt,
  case
      when TIMESTAMPDIFF(MINUTE, F.updatedAt, now()) < 1
          then concat(TIMESTAMPDIFF(SECOND, F.updatedAt, now()), '초전')
      when TIMESTAMPDIFF(HOUR, F.updatedAt, now()) < 1 then concat(TIMESTAMPDIFF(MINUTE, F.updatedAt, now()), '분전')
      when TIMESTAMPDIFF(DAY, F.updatedAt, now()) < 1 then concat(TIMESTAMPDIFF(HOUR, F.updatedAt, now()), '시간전')
      when TIMESTAMPDIFF(WEEK, F.updatedAt, now()) < 1 then concat(TIMESTAMPDIFF(DAY, F.updatedAt, now()), '일전')
      when TIMESTAMPDIFF(MONTH, F.updatedAt, now()) < 1 then concat(TIMESTAMPDIFF(WEEK, F.updatedAt, now()), '주전')
      when TIMESTAMPDIFF(YEAR, F.updatedAt, now()) < 1 then concat(TIMESTAMPDIFF(MONTH, F.updatedAt, now()), '달전')
      else concat(TIMESTAMPDIFF(YEAR, F.updatedAt, now()), '년전') end as updatedAt
  FROM FolderDetail F
      LEFT OUTER JOIN (SELECT folderIdx, count(*) as count FROM Link WHERE Link.status = 1 GROUP BY folderIdx) LinkCount
                      ON F.folderIdx = LinkCount.folderIdx
      LEFT OUTER JOIN Category C ON F.categoryIdx = C.categoryIdx
      LEFT OUTER JOIN DetailCategory DC ON F.detailCategoryIdx = DC.detailCategoryIdx
  WHERE F.userIdx = ?
  and F.status = 1
  ORDER BY folderLinkCount DESC, F.createdAt DESC
  Limit ?, ?;
`;
  const selectMyFolderParams = [userIdx, page, limit];
  const [selectMyFolderRow] = await connection.query(selectMyFolderQuery, selectMyFolderParams);
  connection.release();
  return selectMyFolderRow;
}

async function selectFolderDetail(folderIdx) {
  const connection = await pool.getConnection(async (conn) => conn);
  const selectFolderDetailQuery = `
  SELECT F.userIdx,
          userNickname,
          IFNULL(userProfileImgUrl, -1)                                      as userProfileImgUrl,
          F.folderIdx,
          folderName,
          folderType,
          IFNULL(C.categoryIdx, -1)                                          as categoryIdx,
          IFNULL(C.categoryName, -1)                                         as categoryName,
          IFNULL(DC.detailCategoryIdx, -1)                                   as detailCategoryIdx,
          IFNULL(DC.detailCategoryName, -1)                                  as detailCategoryName,
          IFNULL(likeCount, 0)                                               as folderLikeCount,
          IFNULL(folderLinkCount, 0)                                         as folderLinkCount,
          case
              when TIMESTAMPDIFF(MINUTE, F.updatedAt, now()) < 1
                  then concat(TIMESTAMPDIFF(SECOND, F.updatedAt, now()), '초전')
              when TIMESTAMPDIFF(HOUR, F.updatedAt, now()) < 1 then concat(TIMESTAMPDIFF(MINUTE, F.updatedAt, now()), '분전')
              when TIMESTAMPDIFF(DAY, F.updatedAt, now()) < 1 then concat(TIMESTAMPDIFF(HOUR, F.updatedAt, now()), '시간전')
              when TIMESTAMPDIFF(WEEK, F.updatedAt, now()) < 1 then concat(TIMESTAMPDIFF(DAY, F.updatedAt, now()), '일전')
              when TIMESTAMPDIFF(MONTH, F.updatedAt, now()) < 1 then concat(TIMESTAMPDIFF(WEEK, F.updatedAt, now()), '주전')
              when TIMESTAMPDIFF(YEAR, F.updatedAt, now()) < 1 then concat(TIMESTAMPDIFF(MONTH, F.updatedAt, now()), '달전')
              else concat(TIMESTAMPDIFF(YEAR, F.updatedAt, now()), '년전') end as folderUpdatedAt
    FROM FolderDetail F
            LEFT OUTER JOIN (SELECT folderIdx, count(*) as folderLinkCount
                              FROM Link
                              WHERE Link.status = 1
                              GROUP BY folderIdx) L
                            on F.folderIdx = L.folderIdx
            INNER JOIN User U ON U.userIdx = F.userIdx
            LEFT OUTER JOIN (SELECT folderIdx, count(*) as likeCount
                              FROM LikeFolder
                              WHERE LikeFolder.status = 1
                              GROUP BY folderIdx) LF
                            ON LF.folderIdx = F.folderIdx
            LEFT OUTER JOIN Category C ON F.categoryIdx = C.categoryIdx
            LEFT OUTER JOIN DetailCategory DC ON F.detailCategoryIdx = DC.detailCategoryIdx
    WHERE F.folderIdx = ?
      and F.status = 1
      and U.status = 1;
`;
  const selectFolderDetailDetailParams = [folderIdx];
  const [selectFolderDetailDetailRow] = await connection.query(selectFolderDetailQuery, selectFolderDetailDetailParams);
  connection.release();
  return selectFolderDetailDetailRow;
}

async function selectFolderLink(folderIdx) {
  const connection = await pool.getConnection(async (conn) => conn);
  const selectFolderLinkQuery = `
          SELECT linkIdx, linkName, IFNULL(linkUrl,-1) as linkUrl, IFNULL(linkFaviconUrl, -1) as linkFaviconUrl,
          case
            when TIMESTAMPDIFF(MINUTE, L.updatedAt, now()) < 1
            then concat(TIMESTAMPDIFF(SECOND, L.updatedAt, now()), '초전')
            when TIMESTAMPDIFF(HOUR, L.updatedAt, now()) < 1 then concat(TIMESTAMPDIFF(MINUTE, L.updatedAt, now()), '분전')
            when TIMESTAMPDIFF(DAY, L.updatedAt, now()) < 1 then concat(TIMESTAMPDIFF(HOUR, L.updatedAt, now()), '시간전')
            when TIMESTAMPDIFF(WEEK, L.updatedAt, now()) < 1 then concat(TIMESTAMPDIFF(DAY, L.updatedAt, now()), '일전')
            when TIMESTAMPDIFF(MONTH, L.updatedAt, now()) < 1 then concat(TIMESTAMPDIFF(WEEK, L.updatedAt, now()), '주전')
            when TIMESTAMPDIFF(YEAR, L.updatedAt, now()) < 1 then concat(TIMESTAMPDIFF(MONTH, L.updatedAt, now()), '달전')
            else concat(TIMESTAMPDIFF(YEAR, L.updatedAt, now()), '년전') end as linkUpdatedAt
          From Link L 
          WHERE status = 1 and folderIdx = ?
`;
  const selectFolderLinkParams = [folderIdx];
  const [selectFolderLinkRow] = await connection.query(selectFolderLinkQuery, selectFolderLinkParams);
  connection.release();
  return selectFolderLinkRow;
}

async function selectFolderTag(folderIdx) {
  const connection = await pool.getConnection(async (conn) => conn);
  const selectFolderTagQuery = `
          SELECT tagName FROM FolderTag WHERE folderIdx = ?
`;
  const selectFolderTagParams = [folderIdx];
  const [selectFolderTagRow] = await connection.query(selectFolderTagQuery, selectFolderTagParams);
  connection.release();
  return selectFolderTagRow;
}

async function insertFolderDetail(connection, insertFolderDetailParams) {
  const insertFolderQuery = `
          INSERT INTO FolderDetail(userIdx, categoryIdx, detailCategoryIdx, folderName, folderType)
          VALUES (?, ?, ?, ?, ?);
      `;
  const [insertFolderDetailRow] = await connection.query(insertFolderQuery, insertFolderDetailParams);
  return insertFolderDetailRow;
}

async function insertFolderTag(connection, folderIdx, folderName) {
  const insertFolderTagQuery = `
          INSERT INTO FolderTag(folderIdx, tagName)
          VALUES (?, ?);
      `;
  const insertFolderTagParams = [folderIdx, folderName];
  const [insertFolderTagRow] = await connection.query(insertFolderTagQuery, insertFolderTagParams);
  return insertFolderTagRow;
}

async function updateFolderDetail(connection, updateFolderDetailParams) {
  const updateFolderQuery = `
          UPDATE FolderDetail
          SET categoryIdx = ?, detailCategoryIdx = ?, folderName = ?, folderType = ?
          WHERE folderIdx = ?;
      `;
  const [updateFolderDetailRow] = await connection.query(updateFolderQuery, updateFolderDetailParams);
  return updateFolderDetailRow;
}

async function deleteFolderByStatus(connection, folderIdx) {
  const deleteFolderQuery = `
          UPDATE FolderDetail
          SET status = 0
          WHERE folderIdx = ?;
      `;
  const deleteFolderParams = [folderIdx];
  const [deleteFolderRow] = await connection.query(deleteFolderQuery, deleteFolderParams);
  return deleteFolderRow;
}

async function deleteLinkByStatus(connection, folderIdx) {
  const deleteLinkQuery = `
          UPDATE Link
          SET status = 0
          WHERE folderIdx = ?;
      `;
  const deleteLinkParams = [folderIdx];
  const [deleteLinkRow] = await connection.query(deleteLinkQuery, deleteLinkParams);
  return deleteLinkRow;
}

async function deleteFolderTag(connection, folderIdx) {
  const deleteFolderQuery = `
          DELETE FROM FolderTag
          WHERE folderIdx = ?;
      `;
  const deleteFolderTagParams = [folderIdx];
  const [deleteFolderTagRow] = await connection.query(deleteFolderQuery, deleteFolderTagParams);
  return deleteFolderTagRow;
}

/* 이 부분 추가 */
//내 폴더 검색
async function selectMySearchFolder(userIdx, searchFolderWord, page, limit) {
  const connection = await pool.getConnection(async (conn) => conn);
  try {
    const selectMySearchFolderQuery = `
    select Result.folderIdx, folderLinkCount,
       Result.userIdx, Result.categoryIdx, categoryName, Result.detailCategoryIdx, detailCategoryName,
       Result.folderName, Result.folderType, likeFolderCount, linkImageUrl, likeStatus, folderUpdatedAt
       from(
          select FolderDetail.folderIdx,
                 IFNULL((select count(linkIdx) from Link where folderIdx = FolderDetail.folderIdx and Link.status = 1),
                        0)                                                                                  as folderLinkCount,
                 FolderDetail.userIdx,
                 IFNULL(FolderDetail.categoryIdx, 0)                                                        as categoryIdx,
                 IFNULL(categoryName, -1)                                                                   as categoryName,
                 IFNULL(FolderDetail.detailCategoryIdx, 0)                                                  as detailCategoryIdx,
                 IFNULL(detailCategoryName, -1)                                                             as detailCategoryName,
                 folderName,
                 folderType,
                 IFNULL((select count(folderIdx)
                         from LikeFolder
                         where FolderDetail.folderIdx = LikeFolder.folderIdx and LikeFolder.status = 1),
                        0)                                                                                  as likeFolderCount,
                 IFNULL((select linkImageUrl
                         from Link
                         where FolderDetail.folderIdx = Link.folderIdx
                           and Link.status = 1
                           and linkImageUrl != 'https://i.imgur.com/FTGL4iE.png'
                         order by Link.createdAt desc
                         limit 1),
                         'https://i.imgur.com/FTGL4iE.png')                                                                                 as linkImageUrl,
                 (select CASE WHEN LikeFolder.status = 1 THEN 1 ELSE 0 END)                                 as likeStatus,
                 case
                     when TIMESTAMPDIFF(MINUTE, FolderDetail.updatedAt, now()) < 1
                         then concat(TIMESTAMPDIFF(SECOND, FolderDetail.updatedAt, now()), '초전')
                     when TIMESTAMPDIFF(HOUR, FolderDetail.updatedAt, now()) < 1
                         then concat(TIMESTAMPDIFF(MINUTE, FolderDetail.updatedAt, now()), '분전')
                     when TIMESTAMPDIFF(DAY, FolderDetail.updatedAt, now()) < 1
                         then concat(TIMESTAMPDIFF(HOUR, FolderDetail.updatedAt, now()), '시간전')
                     when TIMESTAMPDIFF(WEEK, FolderDetail.updatedAt, now()) < 1
                         then concat(TIMESTAMPDIFF(DAY, FolderDetail.updatedAt, now()), '일전')
                     when TIMESTAMPDIFF(MONTH, FolderDetail.updatedAt, now()) < 1
                         then concat(TIMESTAMPDIFF(WEEK, FolderDetail.updatedAt, now()), '주전')
                     when TIMESTAMPDIFF(YEAR, FolderDetail.updatedAt, now()) < 1
                         then concat(TIMESTAMPDIFF(MONTH, FolderDetail.updatedAt, now()), '달전')
                     else concat(TIMESTAMPDIFF(YEAR, FolderDetail.updatedAt, now()), '년전') end              as folderUpdatedAt
          from FolderDetail
                   left join Category on Category.categoryIdx = FolderDetail.categoryIdx
                   left join DetailCategory on FolderDetail.detailCategoryIdx = DetailCategory.detailCategoryIdx
                   left join LikeFolder on FolderDetail.folderIdx = LikeFolder.folderIdx and LikeFolder.userIdx = ?
          where folderName LIKE concat('%', ?, '%')
            and FolderDetail.status = 1
            and FolderDetail.userIdx = ?
          union
          select FolderDetail.folderIdx,
                 IFNULL((select count(linkIdx) from Link where folderIdx = FolderDetail.folderIdx and Link.status = 1),
                        0)                                                                                  as folderLinkCount,
                 FolderDetail.userIdx,
                 IFNULL(FolderDetail.categoryIdx, 0)                                                        as categoryIdx,
                 IFNULL(categoryName, -1)                                                                   as categoryName,
                 IFNULL(FolderDetail.detailCategoryIdx, 0)                                                  as detailCategoryIdx,
                 IFNULL(detailCategoryName, -1)                                                             as detailCategoryName,
                 folderName,
                 folderType,
                 IFNULL((select count(folderIdx)
                         from LikeFolder
                         where FolderDetail.folderIdx = LikeFolder.folderIdx and LikeFolder.status = 1),
                        0)                                                                                  as likeFolderCount,
                 IFNULL((select linkImageUrl
                         from Link
                         where FolderDetail.folderIdx = Link.folderIdx
                           and Link.status = 1
                           and linkImageUrl is not null
                         order by Link.createdAt desc
                         limit 1),
                        -1)                                                                                 as linkImageUrl,
                 (select CASE WHEN LikeFolder.status = 1 THEN 1 ELSE 0 END)                                 as likeStatus,
                 case
                     when TIMESTAMPDIFF(MINUTE, FolderDetail.updatedAt, now()) < 1
                         then concat(TIMESTAMPDIFF(SECOND, FolderDetail.updatedAt, now()), '초전')
                     when TIMESTAMPDIFF(HOUR, FolderDetail.updatedAt, now()) < 1
                         then concat(TIMESTAMPDIFF(MINUTE, FolderDetail.updatedAt, now()), '분전')
                     when TIMESTAMPDIFF(DAY, FolderDetail.updatedAt, now()) < 1
                         then concat(TIMESTAMPDIFF(HOUR, FolderDetail.updatedAt, now()), '시간전')
                     when TIMESTAMPDIFF(WEEK, FolderDetail.updatedAt, now()) < 1
                         then concat(TIMESTAMPDIFF(DAY, FolderDetail.updatedAt, now()), '일전')
                     when TIMESTAMPDIFF(MONTH, FolderDetail.updatedAt, now()) < 1
                         then concat(TIMESTAMPDIFF(WEEK, FolderDetail.updatedAt, now()), '주전')
                     when TIMESTAMPDIFF(YEAR, FolderDetail.updatedAt, now()) < 1
                         then concat(TIMESTAMPDIFF(MONTH, FolderDetail.updatedAt, now()), '달전')
                     else concat(TIMESTAMPDIFF(YEAR, FolderDetail.updatedAt, now()), '년전') end              as folderUpdatedAt
          from FolderDetail
                   inner join FolderTag on FolderDetail.folderIdx = FolderTag.folderIdx
                   left join LikeFolder on FolderDetail.folderIdx = LikeFolder.folderIdx and LikeFolder.userIdx = ?
                   left join Category on Category.categoryIdx = FolderDetail.categoryIdx
                   left join DetailCategory on FolderDetail.detailCategoryIdx = DetailCategory.detailCategoryIdx
          where tagName like concat('%', ?, '%')
            and FolderDetail.status = 1
            and FolderDetail.userIdx = ?
      ) Result
        left join FolderDetail on Result.folderIdx = FolderDetail.folderIdx
        order by FolderDetail.updatedAt desc
        Limit ?, ?;
    `;
    const selectMySearchFolderParams = [
      userIdx,
      searchFolderWord,
      userIdx,
      userIdx,
      searchFolderWord,
      userIdx,
      page,
      limit,
    ];
    const [selectMySearchFolderRows] = await connection.query(selectMySearchFolderQuery, selectMySearchFolderParams);
    connection.release();
    return selectMySearchFolderRows;
  } catch (err) {
    logger.error(`selectMySearchFolder DB Connection error\n: ${err.message}`);
    connection.release();
    return {
      isSuccess: false,
      code: 4000,
      message: "selectMySearchFolder DB error",
    };
  }
}

//폴더 검색
async function selectSearchFolder(userIdx, searchFolderWord, page, limit) {
  const connection = await pool.getConnection(async (conn) => conn);
  try {
    const selectSearchFolderQuery = `
    select Result.folderIdx, folderLinkCount,
       Result.userIdx, Result.categoryIdx, categoryName, Result.detailCategoryIdx, detailCategoryName,
       Result.folderName, Result.folderType, likeFolderCount, linkImageUrl, likeStatus, folderUpdatedAt
from (
         select FolderDetail.folderIdx,
                IFNULL((select count(linkIdx) from Link where folderIdx = FolderDetail.folderIdx and Link.status = 1),
                       0)                                                                                  as folderLinkCount,
                FolderDetail.userIdx,
                IFNULL(FolderDetail.categoryIdx, 0)                                                        as categoryIdx,
                IFNULL(categoryName, -1)                                                                   as categoryName,
                IFNULL(FolderDetail.detailCategoryIdx, 0)                                                  as detailCategoryIdx,
                IFNULL(detailCategoryName, -1)                                                             as detailCategoryName,
                folderName,
                folderType,
                IFNULL((select count(folderIdx)
                        from LikeFolder
                        where FolderDetail.folderIdx = LikeFolder.folderIdx and LikeFolder.status = 1),
                       0)                                                                                  as likeFolderCount,
                IFNULL((select linkImageUrl
                        from Link
                        where FolderDetail.folderIdx = Link.folderIdx
                          and Link.status = 1
                          and linkImageUrl != 'https://i.imgur.com/FTGL4iE.png'
                        order by Link.createdAt desc
                        limit 1),
                        'https://i.imgur.com/FTGL4iE.png')                                                                                 as linkImageUrl,
                (select CASE WHEN LikeFolder.status = 1 THEN 1 ELSE 0 END)                                 as likeStatus,
                case
                    when TIMESTAMPDIFF(MINUTE, FolderDetail.updatedAt, now()) < 1
                        then concat(TIMESTAMPDIFF(SECOND, FolderDetail.updatedAt, now()), '초전')
                    when TIMESTAMPDIFF(HOUR, FolderDetail.updatedAt, now()) < 1
                        then concat(TIMESTAMPDIFF(MINUTE, FolderDetail.updatedAt, now()), '분전')
                    when TIMESTAMPDIFF(DAY, FolderDetail.updatedAt, now()) < 1
                        then concat(TIMESTAMPDIFF(HOUR, FolderDetail.updatedAt, now()), '시간전')
                    when TIMESTAMPDIFF(WEEK, FolderDetail.updatedAt, now()) < 1
                        then concat(TIMESTAMPDIFF(DAY, FolderDetail.updatedAt, now()), '일전')
                    when TIMESTAMPDIFF(MONTH, FolderDetail.updatedAt, now()) < 1
                        then concat(TIMESTAMPDIFF(WEEK, FolderDetail.updatedAt, now()), '주전')
                    when TIMESTAMPDIFF(YEAR, FolderDetail.updatedAt, now()) < 1
                        then concat(TIMESTAMPDIFF(MONTH, FolderDetail.updatedAt, now()), '달전')
                    else concat(TIMESTAMPDIFF(YEAR, FolderDetail.updatedAt, now()), '년전') end              as folderUpdatedAt
         from FolderDetail
                  left join Category on Category.categoryIdx = FolderDetail.categoryIdx
                  left join DetailCategory on FolderDetail.detailCategoryIdx = DetailCategory.detailCategoryIdx
                  left join LikeFolder on FolderDetail.folderIdx = LikeFolder.folderIdx and LikeFolder.userIdx = ?
         where folderName LIKE concat('%', ?, '%')
           and FolderDetail.status = 1 and folderType = 'public'
         union
         select FolderDetail.folderIdx,
                IFNULL((select count(linkIdx) from Link where folderIdx = FolderDetail.folderIdx and Link.status = 1),
                       0)                                                                                  as folderLinkCount,
                FolderDetail.userIdx,
                IFNULL(FolderDetail.categoryIdx, 0)                                                        as categoryIdx,
                IFNULL(categoryName, -1)                                                                   as categoryName,
                IFNULL(FolderDetail.detailCategoryIdx, 0)                                                  as detailCategoryIdx,
                IFNULL(detailCategoryName, -1)                                                             as detailCategoryName,
                folderName,
                folderType,
                IFNULL((select count(folderIdx)
                        from LikeFolder
                        where FolderDetail.folderIdx = LikeFolder.folderIdx and LikeFolder.status = 1),
                       0)                                                                                  as likeFolderCount,
                IFNULL((select linkImageUrl
                        from Link
                        where FolderDetail.folderIdx = Link.folderIdx
                          and Link.status = 1
                          and linkImageUrl is not null
                        order by Link.createdAt desc
                        limit 1),
                       -1)                                                                                 as linkImageUrl,
                (select CASE WHEN LikeFolder.status = 1 THEN 1 ELSE 0 END)                                 as likeStatus,
                case
                    when TIMESTAMPDIFF(MINUTE, FolderDetail.updatedAt, now()) < 1
                        then concat(TIMESTAMPDIFF(SECOND, FolderDetail.updatedAt, now()), '초전')
                    when TIMESTAMPDIFF(HOUR, FolderDetail.updatedAt, now()) < 1
                        then concat(TIMESTAMPDIFF(MINUTE, FolderDetail.updatedAt, now()), '분전')
                    when TIMESTAMPDIFF(DAY, FolderDetail.updatedAt, now()) < 1
                        then concat(TIMESTAMPDIFF(HOUR, FolderDetail.updatedAt, now()), '시간전')
                    when TIMESTAMPDIFF(WEEK, FolderDetail.updatedAt, now()) < 1
                        then concat(TIMESTAMPDIFF(DAY, FolderDetail.updatedAt, now()), '일전')
                    when TIMESTAMPDIFF(MONTH, FolderDetail.updatedAt, now()) < 1
                        then concat(TIMESTAMPDIFF(WEEK, FolderDetail.updatedAt, now()), '주전')
                    when TIMESTAMPDIFF(YEAR, FolderDetail.updatedAt, now()) < 1
                        then concat(TIMESTAMPDIFF(MONTH, FolderDetail.updatedAt, now()), '달전')
                    else concat(TIMESTAMPDIFF(YEAR, FolderDetail.updatedAt, now()), '년전') end              as folderUpdatedAt
         from FolderDetail
                  inner join FolderTag on FolderDetail.folderIdx = FolderTag.folderIdx
                  left join LikeFolder on FolderDetail.folderIdx = LikeFolder.folderIdx and LikeFolder.userIdx = ?
                  left join Category on Category.categoryIdx = FolderDetail.categoryIdx
                  left join DetailCategory on FolderDetail.detailCategoryIdx = DetailCategory.detailCategoryIdx
         where tagName like concat('%', ?, '%')
           and FolderDetail.status = 1 and folderType = 'public'
     ) Result
         left join FolderDetail on Result.folderIdx = FolderDetail.folderIdx
        order by FolderDetail.updatedAt desc
        Limit ?, ?;
    `;
    const selectSearchFolderParams = [userIdx, searchFolderWord, userIdx, searchFolderWord, page, limit];
    const [selectSearchFolderRows] = await connection.query(selectSearchFolderQuery, selectSearchFolderParams);
    connection.release();
    return selectSearchFolderRows;
  } catch (err) {
    logger.error(`selectSearchFolder DB Connection error\n: ${err.message}`);
    connection.release();
    return {
      isSuccess: false,
      code: 4000,
      message: "selectSearchFolder DB error",
    };
  }
}

async function selectFolderCount(searchWord) {
  const connection = await pool.getConnection(async (conn) => conn);
  try {
    const selectFolderCountQuery = `
    select count(DISTINCT FolderDetail.folderIdx) as folderCount
    from FolderDetail
            left join FolderTag on FolderTag.folderIdx = FolderDetail.folderIdx
    where (folderName LIKE concat('%', ?, '%')
        or tagName LIKE concat('%', ?, '%'))
      and FolderDetail.status = 1
      and folderType = 'public';
    `;
    const selectFolderCountParams = [searchWord, searchWord];
    const [selectFolderCountRows] = await connection.query(selectFolderCountQuery, selectFolderCountParams);
    // console.log(selectFolderCountRows);
    connection.release();
    return selectFolderCountRows;
  } catch (err) {
    logger.error(`selectFolderCount DB Connection error\n: ${err.message}`);
    connection.release();
    return {
      isSuccess: false,
      code: 4000,
      message: "selectFolderCount DB error",
    };
  }
}

async function selectMyFolderCount(searchWord, userIdx) {
  const connection = await pool.getConnection(async (conn) => conn);
  try {
    const selectMyFolderCountQuery = `
    select IFNULL(count(DISTINCT FolderDetail.folderIdx),0) as folderCount
    from FolderDetail
            left join FolderTag on FolderTag.folderIdx = FolderDetail.folderIdx
    where (folderName LIKE concat('%', ?, '%')
        or tagName LIKE concat('%', ?, '%')) and FolderDetail.status = 1 and userIdx = ?;
    `;
    const selectMyFolderCountParams = [searchWord, searchWord, userIdx];
    const [selectMyFolderCountRows] = await connection.query(selectMyFolderCountQuery, selectMyFolderCountParams);
    connection.release();
    return selectMyFolderCountRows;
  } catch (err) {
    logger.error(`selectMyFolderCount DB Connection error\n: ${err.message}`);
    connection.release();
    return {
      isSuccess: false,
      code: 4000,
      message: "selectMyFolderCount DB error",
    };
  }
}

//top10탑텐 가리비
async function selectTopFolder(userIdx) {
  const connection = await pool.getConnection(async (conn) => conn);
  try {
    const selectTopFolderQuery = `
    select FolderDetail.folderIdx, FolderDetail.userIdx, IFNULL(Category.categoryIdx,0) as categoryIdx,
       IFNULL(categoryName,-1) as categoryName,
       IFNULL(DetailCategory.detailCategoryIdx,0) as detailCategoryIdx,
       IFNULL(detailCategoryName,-1) as detailCategoryName,
       folderName, folderType,
       IFNULL(folderLinkCount, 0) as folderLinkCount,
       IFNULL(likeFolderCount,0) as likeFolderCount,
       IFNULL((select linkImageUrl from Link where FolderDetail.folderIdx = Link.folderIdx and linkImageUrl != 'https://i.imgur.com/FTGL4iE.png' and Link.status = 1 order by Link.createdAt desc limit 1), 'https://i.imgur.com/FTGL4iE.png') as linkImageUrl,
       (select CASE WHEN LikeFolder.status = 1 THEN 1 ELSE 0 END) as likeStatus
    from FolderDetail
            left join LikeFolder on FolderDetail.folderIdx = LikeFolder.folderIdx and LikeFolder.userIdx = ?
            left join Category on FolderDetail.categoryIdx = Category.categoryIdx
            left join DetailCategory on Category.categoryIdx = DetailCategory.categoryIdx
            left join (select folderIdx, count(*) as likeFolderCount from LikeFolder where LikeFolder.status = 1 group by folderIdx) LikeCnt on LikeCnt.folderIdx = FolderDetail.folderIdx
            left join (select folderIdx, count(*) as folderLinkCount from Link where Link.status = 1 group by folderIdx) LinkCnt on FolderDetail.folderIdx = LinkCnt.folderIdx
    where FolderDetail.status = 1 and folderType = 'public'
    group by FolderDetail.folderIdx order by likeFolderCount desc limit 10;
    `;
    const selectTopFolderParams = [userIdx];
    const [selectTopFolderRows] = await connection.query(selectTopFolderQuery, selectTopFolderParams);
    connection.release();
    return selectTopFolderRows;
  } catch (err) {
    logger.error(`selectTopFolder DB Connection error\n: ${err.message}`);
    connection.release();
    return {
      isSuccess: false,
      code: 4000,
      message: "selectTopFolder DB error",
    };
  }
}

//today Default폴더
async function selectTopOneFolder(userIdx) {
  const connection = await pool.getConnection(async (conn) => conn);
  try {
    const selectTopOneFolderQuery = `
    select FolderDetail.folderIdx, FolderDetail.userIdx, IFNULL(Category.categoryIdx,0) as categoryIdx,
       IFNULL(categoryName,-1) as categoryName,
       IFNULL(DetailCategory.detailCategoryIdx,0) as detailCategoryIdx,
       IFNULL(detailCategoryName,-1) as detailCategoryName,
       folderName, folderType,
       IFNULL(folderLinkCount, 0) as folderLinkCount,
       IFNULL(likeFolderCount,0) as likeFolderCount,
       IFNULL((select linkImageUrl from Link where FolderDetail.folderIdx = Link.folderIdx and linkImageUrl is not null and Link.status = 1 order by Link.createdAt desc limit 1), -1) as linkImageUrl,
       (select CASE WHEN LikeFolder.status = 1 THEN 1 ELSE 0 END) as likeStatus
    from FolderDetail
            left join LikeFolder on FolderDetail.folderIdx = LikeFolder.folderIdx and LikeFolder.userIdx = ?
            left join Category on FolderDetail.categoryIdx = Category.categoryIdx
            left join DetailCategory on Category.categoryIdx = DetailCategory.categoryIdx
            left join (select folderIdx, count(*) as likeFolderCount from LikeFolder where LikeFolder.status = 1 group by folderIdx) LikeCnt on LikeCnt.folderIdx = FolderDetail.folderIdx
            left join (select folderIdx, count(*) as folderLinkCount from Link where Link.status = 1 group by folderIdx) LinkCnt on FolderDetail.folderIdx = LinkCnt.folderIdx
    where FolderDetail.status = 1 and folderType = 'public'
    group by FolderDetail.folderIdx order by likeFolderCount desc limit 1;
    `;
    const selectTopOneFolderParams = [userIdx];
    const [selectTopOneFolderRows] = await connection.query(selectTopOneFolderQuery, selectTopOneFolderParams);
    connection.release();
    // console.log(selectTopFolderRows);
    return selectTopOneFolderRows;
  } catch (err) {
    logger.error(`selectTopOneFolder DB Connection error\n: ${err.message}`);
    connection.release();
    return {
      isSuccess: false,
      code: 4000,
      message: "selectTopOneFolder DB error",
    };
  }
}

async function selectTodayFolder(userIdx) {
  const connection = await pool.getConnection(async (conn) => conn);
  try {
    const selectTodayFolderQuery = `
    select B.userIdx,
       B.userCategoryIdx,
       IFNULL(categoryName, -1)                                                    as categoryName,
       LikeFolder.folderIdx,
       folderName,
       IFNULL(folderLinkCount, 0)                                                  as folderLinkCount,
       folderType,
       IFNULL(likeFolderCount, 0)                                                  as likeFolderCount,
       IFNULL(LinkImg.linkImageUrl, -1)                                                       as linkImageUrl,
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
    from User B
            left join (select userIdx, userCategoryIdx, status from User) A
                      on B.userCategoryIdx = A.userCategoryIdx and A.status = 1
            left join LikeFolder on B.userIdx = LikeFolder.userIdx and LikeFolder.status = 1
            left join FolderDetail on LikeFolder.folderIdx = FolderDetail.folderIdx
            left join (select folderIdx, count(*) as likeFolderCount
                        from LikeFolder
                        where LikeFolder.status = 1
                        group by folderIdx) LikeCnt on LikeCnt.folderIdx = LikeFolder.folderIdx
            left join (select folderIdx, count(*) as folderLinkCount
                        from Link
                        where Link.status = 1
                        group by folderIdx) LinkCnt on LikeFolder.folderIdx = LinkCnt.folderIdx
            left join Link on LikeFolder.folderIdx = Link.folderIdx and Link.status = 1
            left join Category on B.userCategoryIdx = Category.categoryIdx
            left join (select folderIdx, linkImageUrl as linkImageUrl from Link
                        where linkImageUrl is not null
                          and Link.status = 1
                        order by Link.createdAt desc
                        limit 1)LinkImg on LinkImg.folderIdx = LikeFolder.folderIdx
    where A.userIdx = ?
      and LikeFolder.userIdx != ?
      and FolderDetail.userIdx != ?
      and FolderDetail.folderType = 'public'
    group by folderIdx
    order by rand()
    limit 1;
`;
    const selectTodayFolderParams = [userIdx, userIdx, userIdx];
    const [selectTodayFolderRows] = await connection.query(selectTodayFolderQuery, selectTodayFolderParams);
    connection.release();
    return selectTodayFolderRows;
  } catch (err) {
    logger.error(`selectTodayFolder DB Connection error\n: ${err.message}`);
    connection.release();
    return {
      isSuccess: false,
      code: 4000,
      message: "selectTodayFolder DB error",
    };
  }
}

async function selectFolderInfo(userIdx, folderName) {
  const connection = await pool.getConnection(async (conn) => conn);
  try {
    const selectFolderInfoQuery = `
    select FolderDetail.folderIdx, FolderDetail.userIdx,
       IFNULL(Category.categoryIdx,0) as categoryIdx,
       IFNULL(categoryName,-1) as categoryName,
       IFNULL(DetailCategory.detailCategoryIdx,0) as detailCategoryIdx,
       IFNULL(detailCategoryName,-1) as detailCategoryName,
       FolderDetail.folderName, folderType,
       IFNULL(folderLinkCount, 0) as folderLinkCount,
       IFNULL(likeFolderCount,0) as likeFolderCount,
       IFNULL((select linkImageUrl from Link where FolderDetail.folderIdx = Link.folderIdx and linkImageUrl is not null and Link.status = 1 order by Link.createdAt desc limit 1), -1) as linkImageUrl
        ,(select CASE WHEN LikeFolder.status = 1 THEN 1 ELSE 0 END) as likeStatus
    from FolderDetail
            left join LikeFolder on FolderDetail.folderIdx = LikeFolder.folderIdx and LikeFolder.userIdx = ?
            left join Category on FolderDetail.categoryIdx = Category.categoryIdx
            left join DetailCategory on FolderDetail.detailCategoryIdx = DetailCategory.detailCategoryIdx
            left join (select folderIdx, count(*) as likeFolderCount from LikeFolder where LikeFolder.status = 1 group by folderIdx) LikeCnt on LikeCnt.folderIdx = FolderDetail.folderIdx
            left join (select folderIdx, count(*) as folderLinkCount from Link where Link.status = 1 group by folderIdx) LinkCnt on FolderDetail.folderIdx = LinkCnt.folderIdx
    where FolderDetail.status = 1 and folderType = 'public' and FolderDetail.folderName = ?;
`;
    const selectFolderInfoParams = [userIdx, folderName];
    const [selectFolderInfoRows] = await connection.query(selectFolderInfoQuery, selectFolderInfoParams);
    connection.release();
    return selectFolderInfoRows;
  } catch (err) {
    logger.error(`selectFolderInfo DB Connection error\n: ${err.message}`);
    connection.release();
    return {
      isSuccess: false,
      code: 4000,
      message: "selectFolderInfo DB error",
    };
  }
}

async function selectDetailCategories(folderIdx) {
  const connection = await pool.getConnection(async (conn) => conn);
  const selectDetailCategoriesQuery = `
      select detailCategoryIdx, detailCategoryName from DetailCategory
      where categoryIdx = (select categoryIdx from FolderDetail where folderIdx = ?);
`;
  const selectDetailCategoriesParams = [folderIdx];
  const [selectDetailCategoriesRows] = await connection.query(
    selectDetailCategoriesQuery,
    selectDetailCategoriesParams
  );
  connection.release();
  return selectDetailCategoriesRows;
}

async function selectUserFolder(userIdx, page, limit) {
  const connection = await pool.getConnection(async (conn) => conn);
  const selectUserFolderQuery = `
  SELECT 
        F.folderIdx,
        F.folderName,
        IFNULL(C.CategoryIdx, -1)                                          as categoryIdx,
        IFNULL(C.CategoryName, -1)                                         as categoryName,
        IFNULL(DC.detailCategoryIdx, -1)                                   as detailCategoryIdx,
        IFNULL(DC.detailCategoryName, -1)                                  as detailCategoryName,
        F.folderType,
        IFNULL(count, 0)                                                   as folderLinkCount,
        IFNULL(likeCount, 0)                                               as likeFolderCount,
        IFNULL((select linkImageUrl
                from Link
                where F.folderIdx = Link.folderIdx
                  and Link.status = 1
                  and Link.linkImageUrl != 'https://i.imgur.com/FTGL4iE.png'
                order by Link.createdAt desc
                limit 1), 'https://i.imgur.com/FTGL4iE.png')                                              as linkImageUrl,
        case
            when TIMESTAMPDIFF(MINUTE, F.updatedAt, now()) < 1
                then concat(TIMESTAMPDIFF(SECOND, F.updatedAt, now()), '초전')
            when TIMESTAMPDIFF(HOUR, F.updatedAt, now()) < 1 then concat(TIMESTAMPDIFF(MINUTE, F.updatedAt, now()), '분전')
            when TIMESTAMPDIFF(DAY, F.updatedAt, now()) < 1 then concat(TIMESTAMPDIFF(HOUR, F.updatedAt, now()), '시간전')
            when TIMESTAMPDIFF(WEEK, F.updatedAt, now()) < 1 then concat(TIMESTAMPDIFF(DAY, F.updatedAt, now()), '일전')
            when TIMESTAMPDIFF(MONTH, F.updatedAt, now()) < 1 then concat(TIMESTAMPDIFF(WEEK, F.updatedAt, now()), '주전')
            when TIMESTAMPDIFF(YEAR, F.updatedAt, now()) < 1 then concat(TIMESTAMPDIFF(MONTH, F.updatedAt, now()), '달전')
            else concat(TIMESTAMPDIFF(YEAR, F.updatedAt, now()), '년전') end as updatedAt
  FROM FolderDetail F
          INNER JOIN User U ON U.userIdx = F.userIdx
          LEFT OUTER JOIN (SELECT folderIdx, count(*) as count
                            FROM Link
                            WHERE Link.status = 1
                            GROUP BY folderIdx) LinkCount
                          ON F.folderIdx = LinkCount.folderIdx
          LEFT OUTER JOIN Category C ON F.categoryIdx = C.categoryIdx
          LEFT OUTER JOIN DetailCategory DC ON F.detailCategoryIdx = DC.detailCategoryIdx
          LEFT OUTER JOIN (SELECT folderIdx, count(*) as likeCount
                            FROM LikeFolder
                            WHERE LikeFolder.status = 1
                            GROUP BY folderIdx) LF
                          ON LF.folderIdx = F.folderIdx
  WHERE F.userIdx = ? and F.status = 1 and F.folderType = 'public'
  Order By F.createdAt DESC
  Limit ?, ?;
`;
  const selectUserFolderParams = [userIdx, page, limit];
  const [selectUserFolderRows] = await connection.query(selectUserFolderQuery, selectUserFolderParams);
  connection.release();
  return selectUserFolderRows;
}

async function selectLikeFolder(userIdx) {
  const connection = await pool.getConnection(async (conn) => conn);
  const selectLikeFolderQuery = `
    select folderName from LikeFolder inner join FolderDetail on LikeFolder.folderIdx = FolderDetail.folderIdx
    where LikeFolder.userIdx = 1 and LikeFolder.status = 1 and FolderDetail.status = 1 and folderType = 'public'
    order by rand() limit 1;
    `;
  const selectLikeFolderParams = [userIdx];
  const [selectLikeFolderParamsRows] = await connection.query(selectLikeFolderQuery, selectLikeFolderParams);
  connection.release();
  return selectLikeFolderParamsRows;
}

// getFolderCsv
async function selectFolderCsv() {
  const connection = await pool.getConnection(async (conn) => conn);
  const selectFolderCsvQuery = `SELECT * FROM FolderDetail`;
  const [folderCsvRows] = await connection.query(selectFolderCsvQuery);
  connection.release();
  return folderCsvRows;
}

// getLikeCsv
async function selectLikeCsv() {
  const connection = await pool.getConnection(async (conn) => conn);
  const selectLikeCsvQuery = `SELECT * FROM LikeFolder`;
  const [likeCsvRows] = await connection.query(selectLikeCsvQuery);
  connection.release();
  return likeCsvRows;
}

module.exports = {
  selectMyFolder1,
  selectMyFolder2,
  selectMyFolder3,
  selectMyFolder4,
  selectFolderDetail,
  selectFolderLink,
  selectFolderTag,
  insertFolderDetail,
  insertFolderTag,
  updateFolderDetail,
  deleteFolderByStatus,
  deleteLinkByStatus,
  deleteFolderTag,

  selectSearchFolder,
  selectMySearchFolder,
  selectMyFolderCount,
  selectFolderCount,
  selectTopFolder,
  selectTodayFolder,
  selectFolderInfo,

  selectUserFolder,
  selectDetailCategories,
  selectTopOneFolder,
  selectLikeFolder,
  selectFolderCsv,
  selectLikeCsv,
};
