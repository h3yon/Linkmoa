const { pool } = require("../../../config/database");
const { logger } = require("../../../config/winston");
const likeDao = require("../dao/likeDao");
const { constants } = require("buffer");

exports.addLike = async function (req, res) {
  const token = req.verifiedToken;
  const folderIdx = parseInt(req.params.folderIdx);

  if (!isNaN(folderIdx) == false) {
    return res.json({
      isSuccess: false,
      code: 2001,
      message: "잘못된 폴더 번호입니다",
    });
  }
  try {
    const [userCheckResult] = await likeDao.userCheck(token.userIdx);
    if (!userCheckResult)
      return res.json({
        isSuccess: false,
        code: 2002,
        message: "비활성화되어 있거나 탈퇴된 회원입니다",
      });

    //일단 비공개인 폴더는 자기자신만 좋아요할 수 있게 함.
    const [folderCheckResult] = await likeDao.folderCheck(folderIdx);
    if (folderCheckResult.folderType == "private") {
      if (token.userIdx != folderCheckResult.userIdx) {
        return res.json({
          isSuccess: false,
          code: 2003,
          message: "권한이 없습니다",
        });
      }
    }
    if (folderCheckResult.length < 1)
      return res.json({
        isSuccess: false,
        code: 2004,
        message: "해당 폴더가 존재하지 않습니다",
      });

    //좋아요 테이블에 정보가 있는지 조회
    const [likeCheckResult] = await likeDao.likeCheck(token.userIdx, folderIdx);

    if (!likeCheckResult || likeCheckResult.status == 0) {
      var addLikeResult = await likeDao.insertLike(token.userIdx, folderIdx, 1);
      if (addLikeResult.isSuccess == false) return res.json(addLikeResult);
      return res.json({
        isSuccess: true,
        code: 1000,
        userIdx: token.userIdx,
        message: "좋아요 성공",
      });
    } else {
      //테이블에 정보 없을 때
      if (likeCheckResult.status == 1) {
        //좋아요 상태일 때
        var cancelLikeResult = await likeDao.insertLike(token.userIdx, folderIdx, 0);
        if (cancelLikeResult.isSuccess == false) return res.json(cancelLikeResult);
        return res.json({
          isSuccess: true,
          code: 1000,
          userIdx: token.userIdx,
          message: "좋아요 취소 성공",
        });
      }
    }
    if (likeCheckResult.isSuccess == false) return res.json(likeCheckResult);
  } catch (err) {
    logger.error(`addLike error\n: ${JSON.stringify(err)}`);
    return res.json({ isSuccess: false, code: 2000, message: "좋아요 실패" });
  }
};

exports.getLike = async function (req, res) {
  const token = req.verifiedToken;
  const { word, page, limit } = req.query;

  try {
    const pageStart = Number(page) * Number(limit);
    const [userCheckResult] = await likeDao.userCheck(token.userIdx);
    if (!userCheckResult)
      return res.json({
        isSuccess: false,
        code: 2002,
        message: "비활성화되어 있거나 탈퇴된 회원입니다",
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

    const resultFolderCount = await likeDao.selectLikeCount(token.userIdx, word);
    if (resultFolderCount.isSuccess == false) return res.json(resultFolderCount);

    //좋아요 테이블에 정보가 있는지 조회
    const getLikeResult = await likeDao.selectLike(token.userIdx, word, pageStart, Number(limit));
    if (getLikeResult.length > 0) {
      return res.json({
        isSuccess: true,
        code: 1000,
        message: "좋아요한 폴더 조회 성공",
        resultCount: resultFolderCount[0].resultCount,
        result: getLikeResult,
      });
    }
    if (getLikeResult.length < 1) {
      return res.json({
        isSuccess: true,
        code: 1000,
        resultCount: 0,
        message: "좋아요한 폴더가 없습니다",
      });
    }
    if (getLikeResult.isSuccess == false) return res.json(getLikeResult);
    else {
      return res.json({
        isSuccess: false,
        code: 2000,
        message: "좋아요한 폴더 조회 실패",
      });
    }
  } catch (err) {
    return res.json({
      isSuccess: false,
      code: 2000,
      message: "좋아요한 폴더 조회 실패",
    });
  }
};
