const { pool } = require("../../../config/database");
const { logger } = require("../../../config/winston");

const categoryDao = require("../dao/categoryDao");
const { userCheck, likeCheck, selectMaxFolderIdx } = require("../dao/likeDao");

// 카테고리별 링크달 조회
exports.selectFoldersByCategory = async function (req, res) {
  const { categoryIdx, detailCategoryIdx } = req.params;
  const { userIdx } = req.verifiedToken;
  let { limit, lastFolderIdx } = req.query;

  if (!limit) {
    return res.json({
      isSuccess: false,
      code: 2012,
      message: "limit를 입력하세요",
    });
  }

  if (!lastFolderIdx) {
    return res.json({
      isSuccess: false,
      code: 2013,
      message: "lastFolderIdx 입력하세요",
    });
  }

  const [userCheckResult] = await userCheck(userIdx);
  if (!userCheckResult)
    return res.json({
      isSuccess: false,
      code: 2010,
      message: "비활성화되어 있거나 탈퇴된 회원입니다.",
    });

  if (!categoryIdx) {
    return res.json({
      isSuccess: false,
      code: 2001,
      message: "categoryIdx을 입력하세요.",
    });
  }

  if (!/[1-5]/.test(categoryIdx)) {
    return res.json({
      isSuccess: false,
      code: 2002,
      message: "categoryIdx는 1-5 사이의 정수입니다.",
    });
  }

  if (!detailCategoryIdx) {
    return res.json({
      isSuccess: false,
      code: 2003,
      message: "detailCategoryIdx를 입력하세요.",
    });
  }

  switch (categoryIdx) {
    case "1":
      if (!(detailCategoryIdx >= 1 && detailCategoryIdx <= 10) && !(detailCategoryIdx == 0))
        return res.json({
          isSuccess: false,
          code: 2004,
          message: "categoryIdx가 1일때 detailCategoryIdx는 0또는 1~10을 입력하세요.",
        });
      break;
    case "2":
      if (!(detailCategoryIdx >= 11 && detailCategoryIdx <= 18) && !(detailCategoryIdx == 0))
        return res.json({
          isSuccess: false,
          code: 2005,
          message: "categoryIdx가 2일때 detailCategoryIdx는 0또는 11~18을 입력하세요.",
        });
      break;
    case "3":
      if (!(detailCategoryIdx >= 19 && detailCategoryIdx <= 25) && !(detailCategoryIdx == 0))
        return res.json({
          isSuccess: false,
          code: 2006,
          message: "categoryIdx가 3일때 detailCategoryIdx는 0또는 19~25을 입력하세요.",
        });
      break;
    case "4":
      if (!(detailCategoryIdx >= 26 && detailCategoryIdx <= 30) && !(detailCategoryIdx == 0))
        return res.json({
          isSuccess: false,
          code: 2007,
          message: "categoryIdx가 4일때 detailCategoryIdx는 0또는 26~30을 입력하세요.",
        });
      break;
    case "5":
      if (detailCategoryIdx != 0)
        return res.json({
          isSuccess: false,
          code: 2008,
          message: "categoryIdx가 5일때 detailCategoryIdx는 0을 입력하세요.",
        });
      break;
  }

  try {
    let result = {};

    if (Number(lastFolderIdx) === 0) {
      const index = await selectMaxFolderIdx();
      lastFolderIdx = index[0].maxFolderIdx + 1;
    }

    if (Number(detailCategoryIdx) === 0) {
      const selectFoldersByCategoryRow = await categoryDao.selectFoldersByCategory(
        categoryIdx,
        Number(limit),
        lastFolderIdx
      );
      for (let i = 0; i < selectFoldersByCategoryRow.length; i++) {
        const likeStatusRow = await likeCheck(userIdx, selectFoldersByCategoryRow[i].folderIdx);
        if (likeStatusRow.length > 0) {
          selectFoldersByCategoryRow[i].likeStatus = likeStatusRow[0].status;
        } else {
          selectFoldersByCategoryRow[i].likeStatus = 0;
        }
      }

      const selectFoldersCountByCategoryRow = await categoryDao.selectFoldersCountByCategory(categoryIdx);
      if (selectFoldersCountByCategoryRow.length > 0) {
        result.folderCount = selectFoldersCountByCategoryRow[0].folderCount;
      } else {
        result.folderCount = 0;
      }
      result.folderList = selectFoldersByCategoryRow;
    } else {
      const selectFoldersByDetailCategoryRow = await categoryDao.selectFoldersByDetailCategory(
        detailCategoryIdx,
        Number(limit),
        lastFolderIdx
      );
      for (let i = 0; i < selectFoldersByDetailCategoryRow.length; i++) {
        const likeStatusRow = await likeCheck(userIdx, selectFoldersByDetailCategoryRow[i].folderIdx);
        if (likeStatusRow.length > 0) {
          selectFoldersByDetailCategoryRow[i].likeStatus = likeStatusRow[0].status;
        } else {
          selectFoldersByDetailCategoryRow[i].likeStatus = 0;
        }
      }

      const selectFoldersCountByDetailCategoryRow = await categoryDao.selectFoldersCountByDetailCategory(
        detailCategoryIdx
      );
      if (selectFoldersCountByDetailCategoryRow.length > 0) {
        result.folderCount = selectFoldersCountByDetailCategoryRow[0].folderCount;
      } else {
        result.folderCount = 0;
      }
      result.folderList = selectFoldersByDetailCategoryRow;
    }
    return res.json({
      isSuccess: true,
      code: 1000,
      message: "카테고리별 링크달 조회 성공",
      result: result,
    });
  } catch (err) {
    logger.error(`App - selectFolders Query error\n: ${err.message}`);
    console.log(err);
    return res.json({
      isSuccess: false,
      code: 4000,
      message: "카테고리별 링크달 조회 실패",
    });
  }
};

/*
// 상세카테고리별 링크달 조회
// exports.selectFoldersByDetailCategory = async function (req, res) {
//   const { categoryIdx, detailCategoryIdx } = req.params;
//   const { userIdx } = req.verifiedToken;
//   const { page, limit } = req.query;

//   if (!page) {
//     return res.json({
//       isSuccess: false,
//       code: 2008,
//       message: "page를 입력하세요",
//     });
//   }

//   if (!limit) {
//     return res.json({
//       isSuccess: false,
//       code: 2009,
//       message: "limit를 입력하세요",
//     });
//   }

//   const [userCheckResult] = await userCheck(userIdx);
//   if (!userCheckResult)
//     return res.json({
//       isSuccess: false,
//       code: 2010,
//       message: "비활성화되어 있거나 탈퇴된 회원입니다.",
//     });

//   if (!categoryIdx) {
//     return res.json({
//       isSuccess: false,
//       code: 2001,
//       message: "categoryIdx을 입력하세요.",
//     });
//   }

//   if (!/[1-5]/.test(categoryIdx)) {
//     return res.json({
//       isSuccess: false,
//       code: 2002,
//       message: "categoryIdx는 1-5 사이의 정수입니다.",
//     });
//   }

//   if (!detailCategoryIdx) {
//     return res.json({
//       isSuccess: false,
//       code: 2001,
//       message: "detailCategoryIdx를 입력하세요.",
//     });
//   }
//   try {
//     let result = {};
//     const pageStart = Number(page) * Number(limit);
//     const selectFoldersByDetailCategoryRow = await categoryDao.selectFoldersByDetailCategory(
//       detailCategoryIdx,
//       pageStart,
//       Number(limit)
//     );
//     for (let i = 0; i < selectFoldersByDetailCategoryRow.length; i++) {
//       const likeStatusRow = await likeCheck(userIdx, selectFoldersByDetailCategoryRow[i].folderIdx);
//       if (likeStatusRow.length > 0) {
//         selectFoldersByDetailCategoryRow[i].likeStatus = likeStatusRow[0].status;
//       } else {
//         selectFoldersByDetailCategoryRow[i].likeStatus = 0;
//       }
//     }

//     const selectFoldersCountByDetailCategoryRow = await categoryDao.selectFoldersCountByDetailCategory(
//       detailCategoryIdx
//     );
//     if (selectFoldersCountByDetailCategoryRow.length > 0) {
//       result.folderCount = selectFoldersCountByDetailCategoryRow[0].folderCount;
//     } else {
//       result.folderCount = 0;
//     }
//     result.folderList = selectFoldersByDetailCategoryRow;
//     return res.json({
//       isSuccess: true,
//       code: 1000,
//       message: "상세카테고리별 링크달 조회 성공",
//       result: result,
//     });
//   } catch (err) {
//     logger.error(`App - selectFolders Query error\n: ${err.message}`);
//     return res.json({
//       isSuccess: false,
//       code: 4000,
//       message: "상세카테고리별 링크달 조회 실패",
//     });
//   }
// };
*/

// 카테고리 목록 조회
exports.selectCategory = async function (req, res) {
  const { userIdx } = req.verifiedToken;
  const [userCheckResult] = await userCheck(userIdx);
  if (!userCheckResult)
    return res.json({
      isSuccess: false,
      code: 2010,
      message: "비활성화되어 있거나 탈퇴된 회원입니다.",
    });
  try {
    const selectCategoryRow = await categoryDao.selectCategory();
    for (let i = 0; i < selectCategoryRow.length; i++) {
      const selectDetailCategoryRow = await categoryDao.selectDetailCategory(selectCategoryRow[i].categoryIdx);
      selectCategoryRow[i].detailCategoryList = selectDetailCategoryRow;
    }
    return res.json({
      isSuccess: true,
      code: 1000,
      message: "카테고리 조회 성공",
      result: selectCategoryRow,
    });
  } catch (err) {
    logger.error(`App - selectCategory Query error\n: ${err.message}`);
    return res.json({
      isSuccess: false,
      code: 4000,
      message: "카테고리 조회 실패",
    });
  }
};
