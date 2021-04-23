const { pool } = require("../../../config/database");

async function selectFoldersByCategory(categoryIdx, limit, lastFolderIdx) {
  const connection = await pool.getConnection(async (conn) => conn);
  const selectFoldersByCategoryQuery = `
  SELECT F.folderIdx,
  F.folderName,
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
   limit 1), 'https://i.imgur.com/FTGL4iE.png')  as linkImageUrl,
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
WHERE F.categoryIdx = ? and F.folderIdx < ?
and F.status = 1 and F.folderType = 'public'
Order By F.createdAt DESC, F.folderIdx DESC
Limit ?;
        `;
  const selectFoldersByCategoryParams = [categoryIdx, lastFolderIdx, limit];
  const [selectFoldersByCategoryRow] = await connection.query(
    selectFoldersByCategoryQuery,
    selectFoldersByCategoryParams
  );
  connection.release();
  return selectFoldersByCategoryRow;
}

async function selectFoldersByDetailCategory(detailCategoryIdx, limit, lastFolderIdx) {
  const connection = await pool.getConnection(async (conn) => conn);
  const selectFoldersByDetailCategoryQuery = `
  SELECT F.folderIdx,
  F.folderName,
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
   limit 1), 'https://i.imgur.com/FTGL4iE.png')                                                       as linkImageUrl,
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
    WHERE F.detailCategoryIdx = ? and F.folderIdx < ?
    and F.status = 1 and F.folderType = 'public'
    Order By F.createdAt DESC, F.folderIdx DESC
    Limit ?;
        `;
  const selectFoldersByDetailCategoryParams = [detailCategoryIdx, lastFolderIdx, limit];
  const [selectFoldersByDetailCategoryRow] = await connection.query(
    selectFoldersByDetailCategoryQuery,
    selectFoldersByDetailCategoryParams
  );
  connection.release();
  return selectFoldersByDetailCategoryRow;
}

async function selectFoldersCountByCategory(categoryIdx) {
  const connection = await pool.getConnection(async (conn) => conn);
  const selectFoldersCountByCategoryQuery = `
  SELECT COUNT(*) as folderCount
  From FolderDetail
  WHERE status = 1 and categoryIdx = ? and folderType = 'public'
  group by categoryIdx;
 `;
  const selectFoldersCountByCategoryParams = [categoryIdx];
  const [selectFoldersCountByCategoryRow] = await connection.query(
    selectFoldersCountByCategoryQuery,
    selectFoldersCountByCategoryParams
  );
  connection.release();
  return selectFoldersCountByCategoryRow;
}

async function selectFoldersCountByDetailCategory(detailCategoryIdx) {
  const connection = await pool.getConnection(async (conn) => conn);
  const selectFoldersCountByDetailCategoryQuery = `
  SELECT COUNT(*) as folderCount
  From FolderDetail
  WHERE status = 1 and detailCategoryIdx = ? and folderType = 'public'
  group by detailCategoryIdx;
 `;
  const selectFoldersCountByDetailCategoryParams = [detailCategoryIdx];
  const [selectFoldersCountByDetailCategoryRow] = await connection.query(
    selectFoldersCountByDetailCategoryQuery,
    selectFoldersCountByDetailCategoryParams
  );
  connection.release();
  return selectFoldersCountByDetailCategoryRow;
}

async function selectCategory() {
  const connection = await pool.getConnection(async (conn) => conn);
  const selectCategoryQuery = `
    SELECT categoryIdx, categoryName
    FROM Category;
 `;
  const selectCategoryParams = [];
  const [selectCategoryRow] = await connection.query(selectCategoryQuery, selectCategoryParams);
  connection.release();
  return selectCategoryRow;
}

async function selectDetailCategory(categoryIdx) {
  const connection = await pool.getConnection(async (conn) => conn);
  const selectDetailCategoryQuery = `
    SELECT detailCategoryIdx, detailCategoryName
    FROM DetailCategory
    WHERE categoryIdx = ?;
 `;
  const selectDetailCategoryParams = [categoryIdx];
  const [selectDetailCategoryRow] = await connection.query(selectDetailCategoryQuery, selectDetailCategoryParams);
  connection.release();
  return selectDetailCategoryRow;
}

module.exports = {
  selectFoldersByCategory,
  selectFoldersByDetailCategory,
  selectFoldersCountByCategory,
  selectFoldersCountByDetailCategory,
  selectCategory,
  selectDetailCategory,
};
