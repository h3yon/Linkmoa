const {pool} = require("../../../config/database");
const {logger} = require("../../../config/winston");

//활성화된 유저인덱스인지 체크
async function userCheck(userIdx) {
  const connection = await pool.getConnection(async conn => conn);
  try {
    const userCheckQuery = `select userIdx from User where userIdx = ? and status = 1;`;
    const userCheckParams = [userIdx];
    const [userCheckRows] = await connection.query(
      userCheckQuery,
      userCheckParams
    );
    connection.release();
    return userCheckRows;
  } catch (err) {
    logger.error(`userCheck DB Connection error\n: ${err.message}`);
    connection.release();
    return {isSuccess: false, code: 4000, message: "userCheck DB error"};
  }
}

//활성화된 폴더인지 체크
async function folderCheck(folderIdx) {
  const connection = await pool.getConnection(async conn => conn);
  try {
    const folderCheckQuery = `select userIdx from FolderDetail where folderIdx = ? and status = 1;`;
    const folderCheckParams = [folderIdx];
    const [folderCheckRows] = await connection.query(
      folderCheckQuery,
      folderCheckParams
    );
    connection.release();
    return folderCheckRows;
  } catch (err) {
    logger.error(`folderCheck DB Connection error\n: ${err.message}`);
    connection.release();
    return {isSuccess: false, code: 4000, message: "folderCheck DB error"};
  }
}

//링크 추가
async function insertLink(
  folderIdx,
  userIdx,
  linkName,
  linkUrl,
  linkImageUrl,
  linkFaviconUrl
) {
  const connection = await pool.getConnection(async conn => conn);
  try {
    const insertLinkQuery = `
          insert Link(folderIdx, userIdx, linkName, linkUrl, linkImageUrl, linkFaviconUrl) 
          values (?, ?, ?, ?, ?, ?);
          `;
    const insertLinkParams = [
      folderIdx,
      userIdx,
      linkName,
      linkUrl,
      linkImageUrl,
      linkFaviconUrl,
    ];
    const [insertLinkRows] = await connection.query(
      insertLinkQuery,
      insertLinkParams
    );
    connection.release();
    return insertLinkRows;
  } catch (err) {
    logger.error(`insertLink DB Connection error\n: ${err.message}`);
    connection.release();
    return {isSuccess: false, code: 4000, message: "insertLink DB error"};
  }
}

//링크 상태 확인
async function selectLinkStatus(linkIdx) {
  const connection = await pool.getConnection(async conn => conn);
  try {
    const selectLinkStatusQuery = `select status from Link where linkIdx = ?;`;
    const selectLinkStatusParams = [linkIdx];
    const [selectLinkStatusRows] = await connection.query(
      selectLinkStatusQuery,
      selectLinkStatusParams
    );
    connection.release();
    return selectLinkStatusRows;
  } catch (err) {
    logger.error(`selectLinkStatus DB Connection error\n: ${err.message}`);
    connection.release();
    return {
      isSuccess: false,
      code: 4000,
      message: "selectLinkStatus DB error",
    };
  }
}

//링크 수정
async function updateLink(
  folderIdx,
  linkName,
  linkUrl,
  linkImageUrl,
  linkFaviconUrl,
  linkIdx
) {
  const connection = await pool.getConnection(async conn => conn);
  try {
    const updateLinkQuery = `
      update Link set Link.folderIdx = IFNULL(?, (select folderIdx where linkIdx = ?)),
      linkName = IFNULL(?, (select linkName where linkIdx = ?)),
      linkUrl = IFNULL(?, (select linkUrl where linkIdx = ?)),
      linkImageUrl = IFNULL(?, (select linkImageUrl where linkIdx = ?)),
      linkFaviconUrl = IFNULL(?, (select linkFaviconUrl where linkIdx = ?)),
      updatedAt = now()
      where linkIdx = ?;
      `;
    const updateLinkParams = [
      folderIdx,
      linkIdx,
      linkName,
      linkIdx,
      linkUrl,
      linkIdx,
      linkImageUrl,
      linkIdx,
      linkFaviconUrl,
      linkIdx,
      linkIdx,
    ];
    const [updateLinkRows] = await connection.query(
      updateLinkQuery,
      updateLinkParams
    );
    connection.release();
    return updateLinkRows;
  } catch (err) {
    logger.error(`updateLink DB Connection error\n: ${err.message}`);
    connection.release();
    return {isSuccess: false, code: 4000, message: "updateLink DB error"};
  }
}

//링크 삭제
async function deleteLink(linkIdx) {
  const connection = await pool.getConnection(async conn => conn);
  try {
    const deleteLinkQuery = `update Link set status = 0 where linkIdx = ?;`;
    const deleteLinkParams = [linkIdx];
    await connection.query(deleteLinkQuery, deleteLinkParams);
    connection.release();
    return {isSuccess: true};
  } catch (err) {
    logger.error(`deleteLink DB Connection error\n: ${err.message}`);
    connection.release();
    return {
      isSuccess: false,
      code: 4000,
      message: "deleteLink DB error",
    };
  }
}

//링크 체크
async function checkLink(linkIdx) {
  const connection = await pool.getConnection(async conn => conn);
  try {
    const checkLinkQuery = `select userIdx from Link where linkIdx = ? and status = 1;`;
    const checkLinkParams = [linkIdx];
    const [checkLinkRows] = await connection.query(
      checkLinkQuery,
      checkLinkParams
    );
    connection.release();
    return checkLinkRows;
  } catch (err) {
    logger.error(`checkLink DB Connection error\n: ${err.message}`);
    connection.release();
    return {
      isSuccess: false,
      code: 4000,
      message: "checkLink DB error",
    };
  }
}

//링크 검색
async function selectSearchLink(searchLinkWord, page, limit) {
  const connection = await pool.getConnection(async conn => conn);
  try {
    const selectSearchLinkQuery = `
    select linkIdx, Link.folderIdx, Link.userIdx, linkName,
       IFNULL(linkUrl,-1) as linkUrl,
       IFNULL(linkImageUrl, -1) as linkImageUrl,
       IFNULL(linkFaviconUrl,-1) as linkFaviconUrl,
       case
           when TIMESTAMPDIFF(MINUTE,Link.updatedAt,now()) < 1 then concat(TIMESTAMPDIFF(SECOND,Link.updatedAt,now()), '초전')
           when TIMESTAMPDIFF(HOUR,Link.updatedAt,now()) < 1 then concat(TIMESTAMPDIFF(MINUTE,Link.updatedAt,now()), '분전')
           when TIMESTAMPDIFF(DAY,Link.updatedAt,now()) < 1 then concat(TIMESTAMPDIFF(HOUR,Link.updatedAt,now()), '시간전')
           when TIMESTAMPDIFF(WEEK,Link.updatedAt,now()) < 1 then concat(TIMESTAMPDIFF(DAY,Link.updatedAt,now()), '일전')
           when TIMESTAMPDIFF(MONTH,Link.updatedAt,now()) < 1 then concat(TIMESTAMPDIFF(WEEK,Link.updatedAt,now()), '주전')
           when TIMESTAMPDIFF(YEAR,Link.updatedAt,now()) < 1 then concat(TIMESTAMPDIFF(MONTH,Link.updatedAt,now()), '달전')
           else concat(TIMESTAMPDIFF(YEAR, Link.updatedAt, now()), '년전') end as folderUpdatedAt
    from Link inner join FolderDetail on Link.folderIdx = FolderDetail.folderIdx
    where linkName LIKE concat('%',?,'%') and Link.status = 1 and folderType = 'public'
    order by Link.updatedAt desc
    Limit ?, ?;
    `;
    const selectSearchLinkParams = [searchLinkWord, page, limit];
    const [selectSearchLinkRows] = await connection.query(
      selectSearchLinkQuery,
      selectSearchLinkParams
    );
    connection.release();
    return selectSearchLinkRows;
  } catch (err) {
    logger.error(`selectSearchLink DB Connection error\n: ${err.message}`);
    connection.release();
    return {
      isSuccess: false,
      code: 4000,
      message: "selectSearchLink DB error",
    };
  }
}

//나의 링크 검색
async function selectSearchMyLink(searchLinkWord, userIdx, page, limit) {
  const connection = await pool.getConnection(async conn => conn);
  try {
    const selectSearchMyLinkQuery = `
    select linkIdx, Link.folderIdx, Link.userIdx, linkName,
       IFNULL(linkUrl,-1) as linkUrl,
       IFNULL(linkImageUrl, -1) as linkImageUrl,
       IFNULL(linkFaviconUrl,-1) as linkFaviconUrl,
       case
           when TIMESTAMPDIFF(MINUTE,Link.updatedAt,now()) < 1 then concat(TIMESTAMPDIFF(SECOND,Link.updatedAt,now()), '초전')
           when TIMESTAMPDIFF(HOUR,Link.updatedAt,now()) < 1 then concat(TIMESTAMPDIFF(MINUTE,Link.updatedAt,now()), '분전')
           when TIMESTAMPDIFF(DAY,Link.updatedAt,now()) < 1 then concat(TIMESTAMPDIFF(HOUR,Link.updatedAt,now()), '시간전')
           when TIMESTAMPDIFF(WEEK,Link.updatedAt,now()) < 1 then concat(TIMESTAMPDIFF(DAY,Link.updatedAt,now()), '일전')
           when TIMESTAMPDIFF(MONTH,Link.updatedAt,now()) < 1 then concat(TIMESTAMPDIFF(WEEK,Link.updatedAt,now()), '주전')
           when TIMESTAMPDIFF(YEAR,Link.updatedAt,now()) < 1 then concat(TIMESTAMPDIFF(MONTH,Link.updatedAt,now()), '달전')
           else concat(TIMESTAMPDIFF(YEAR, Link.updatedAt, now()), '년전') end as folderUpdatedAt
    from Link
        inner join FolderDetail on Link.folderIdx = FolderDetail.folderIdx
    where linkName LIKE concat('%',?,'%') and Link.status = 1 and FolderDetail.userIdx = ? and Link.userIdx = ?
    order by Link.updatedAt desc
    Limit ?, ?;
    `;
    const selectSearchMyLinkParams = [
      searchLinkWord,
      userIdx,
      userIdx,
      page,
      limit,
    ];
    const [selectSearchMyLinkRows] = await connection.query(
      selectSearchMyLinkQuery,
      selectSearchMyLinkParams
    );
    connection.release();
    return selectSearchMyLinkRows;
  } catch (err) {
    logger.error(`selectSearchMyLink DB Connection error\n: ${err.message}`);
    connection.release();
    return {
      isSuccess: false,
      code: 4000,
      message: "selectSearchMyLink DB error",
    };
  }
}

//링크 갯수 가져오기
async function linkCountCheck(folderIdx) {
  const connection = await pool.getConnection(async conn => conn);
  try {
    const linkCountCheckQuery = `
      select IFNULL(count(linkIdx),0) as linkIdx from Link where folderIdx = ? and status = 1;
    `;
    const linkCountCheckParams = [folderIdx];
    const [linkCountCheckRows] = await connection.query(
      linkCountCheckQuery,
      linkCountCheckParams
    );
    connection.release();
    return linkCountCheckRows;
  } catch (err) {
    logger.error(`linkCountCheck DB Connection error\n: ${err.message}`);
    connection.release();
    return {
      isSuccess: false,
      code: 4000,
      message: "linkCountCheck DB error",
    };
  }
}

//링크 검색 결과 갯수 가져오기
async function linkSearchCount(searchWord) {
  const connection = await pool.getConnection(async conn => conn);
  try {
    const linkSearchCountQuery = `
      select IFNULL(count(linkIdx), 0) as resultCount
      from Link inner join FolderDetail on Link.folderIdx = FolderDetail.folderIdx
      where linkName LIKE concat('%',?,'%') and Link.status = 1 and folderType = 'public' and FolderDetail.status = 1;
    `;
    const linkSearchCountParams = [searchWord];
    const [linkCountCheckRows] = await connection.query(
      linkSearchCountQuery,
      linkSearchCountParams
    );
    connection.release();
    return linkCountCheckRows;
  } catch (err) {
    logger.error(`linkSearchCount DB Connection error\n: ${err.message}`);
    connection.release();
    return {
      isSuccess: false,
      code: 4000,
      message: "linkSearchCount DB error",
    };
  }
}

//내 링크 검색 결과 갯수 가져오기
async function myLinkSearchCount(searchWord, userIdx) {
  const connection = await pool.getConnection(async conn => conn);
  try {
    const myLinkSearchCountQuery = `
      select IFNULL(count(linkIdx), 0) as resultCount
      from Link inner join FolderDetail on Link.folderIdx = FolderDetail.folderIdx
      where linkName LIKE concat('%',?,'%') and Link.status = 1 and Link.userIdx = ?
        and FolderDetail.userIdx = ? and FolderDetail.status = 1;
    `;
    const myLinkSearchCountParams = [searchWord, userIdx, userIdx];
    const [myLinkCountCheckRows] = await connection.query(
      myLinkSearchCountQuery,
      myLinkSearchCountParams
    );
    connection.release();
    return myLinkCountCheckRows;
  } catch (err) {
    logger.error(`myLinkSearchCount DB Connection error\n: ${err.message}`);
    connection.release();
    return {
      isSuccess: false,
      code: 4000,
      message: "myLinkSearchCount DB error",
    };
  }
}

module.exports = {
  userCheck,
  folderCheck,
  insertLink,
  updateLink,
  selectLinkStatus,
  deleteLink,
  checkLink,
  selectSearchLink, //링크검색
  selectSearchMyLink,
  linkCountCheck,
  linkSearchCount,
  myLinkSearchCount,
};
