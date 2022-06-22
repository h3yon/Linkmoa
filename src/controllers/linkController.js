const { pool } = require("../../config/database");
const { logger } = require("../../config/winston");
const linkDao = require("../dao/linkDao");

exports.addLink = async function (req, res) {
  const token = req.verifiedToken;
  const folderIdx = req.params.folderIdx;
  const { linkName, linkUrl, linkFaviconUrl } = req.body;
  let { linkImageUrl } = req.body;

  if (!linkName)
    return res.json({
      isSuccess: false,
      code: 2001,
      message: "링크 이름을 입력해주세요",
    });
  if (linkName.length > 40)
    return res.json({
      isSuccess: false,
      code: 2002,
      message: "링크 이름은 40자 이하로 입력해주세요",
    });
  var regexUrl = /https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,}/;
  if (regexUrl.test(linkUrl) == false) {
    return res.json({
      isSuccess: false,
      code: 2003,
      message: "링크가 올바른 링크 형식이 아닙니다",
    });
  }
  if (linkImageUrl) {
    if (regexUrl.test(linkImageUrl) == false) {
      return res.json({
        isSuccess: false,
        code: 2004,
        message: "이미지링크가 올바른 링크 형식이 아닙니다",
      });
    }
  } else {
    linkImageUrl = "https://i.imgur.com/FTGL4iE.png";
  }
  if (linkFaviconUrl) {
    if (regexUrl.test(linkFaviconUrl) == false) {
      return res.json({
        isSuccess: false,
        code: 2005,
        message: "파비콘 링크가 올바른 링크 형식이 아닙니다",
      });
    }
  }
  if (!isNaN(folderIdx) == false) {
    return res.json({
      isSuccess: false,
      code: 2006,
      message: "잘못된 폴더 번호입니다",
    });
  }
  try {
    const [userCheckResult] = await linkDao.userCheck(token.userIdx);
    if (!userCheckResult)
      return res.json({
        isSuccess: false,
        code: 2010,
        message: "비활성화되어 있거나 탈퇴된 회원입니다",
      });
    //해당 폴더가 있는지 조회
    const folderCheckResult = await linkDao.folderCheck(folderIdx);
    if (folderCheckResult.length < 1) {
      return res.json({
        isSuccess: false,
        code: 2007,
        message: "선택한 폴더가 존재하지 않습니다",
      });
    }
    //링크 갯수 체크
    const linkCountCheckResult = await linkDao.linkCountCheck(folderIdx);
    if (linkCountCheckResult[0].linkIdx > 17) {
      return res.json({
        isSuccess: false,
        code: 2009,
        message: "링크는 17개를 넘을 수 없습니다",
      });
    }

    if (folderCheckResult[0].userIdx != token.userIdx) {
      //폴더 만든 사람만 링크 추가 가능하게 함.
      return res.json({
        isSuccess: false,
        code: 2008,
        message: "권한이 없습니다",
      });
    }
    if (folderCheckResult.isSuccess == false) return res.json(folderCheckResult);

    //폴더 추가
    const insertLinkResult = await linkDao.insertLink(
      folderIdx,
      token.userIdx,
      linkName,
      linkUrl,
      linkImageUrl,
      linkFaviconUrl
    );
    if (insertLinkResult.isSuccess == false) return res.json(insertLinkResult);
    return res.json({
      isSuccess: true,
      code: 1000,
      userIdx: token.userIdx,
      message: "링크 추가 성공",
    });
  } catch (err) {
    logger.error(`addLink error\n: ${JSON.stringify(err)}`);
    return res.json({
      isSuccess: false,
      code: 2000,
      userIdx: token.userIdx,
      message: "링크 추가 실패",
    });
  }
};

exports.changeLink = async function (req, res) {
  const token = req.verifiedToken;
  const linkIdx = req.params.linkIdx;
  const { folderIdx, linkName, linkUrl, linkImageUrl, linkFaviconUrl } = req.body;

  if (!folderIdx && !linkName && !linkUrl && !linkImageUrl && !linkFaviconUrl) {
    return res.json({
      isSuccess: false,
      code: 2001,
      message: "수정할 정보 하나는 입력해주셔야 합니다",
    });
  }
  const checkLinkResult = await linkDao.checkLink(linkIdx);
  if (!checkLinkResult || checkLinkResult.length < 1) {
    return res.json({
      isSuccess: false,
      code: 2002,
      message: "존재하지 않거나 삭제된 링크입니다",
    });
  }
  if (folderIdx) {
    if (!isNaN(folderIdx) == false) {
      return res.json({
        isSuccess: false,
        code: 2003,
        message: "잘못된 폴더 번호입니다",
      });
    }
    const checkFolderResult = await linkDao.folderCheck(folderIdx);
    if (!checkFolderResult || checkFolderResult.length < 1) {
      return res.json({
        isSuccess: false,
        code: 2004,
        message: "존재하지 않는 폴더입니다",
      });
    }
    if (checkFolderResult[0].userIdx != token.userIdx) {
      //폴더 만든 사람만 링크 수정 가능하게 함.
      return res.json({
        isSuccess: false,
        code: 2005,
        message: "권한이 없습니다",
      });
    }
  }
  if (linkUrl) {
    var regexUrl = /https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,}/;
    if (regexUrl.test(linkUrl) == false) {
      return res.json({
        isSuccess: false,
        code: 2006,
        message: "링크가 올바른 링크 형식이 아닙니다",
      });
    }
  }
  if (linkImageUrl) {
    var regexUrl = /https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,}/;
    if (regexUrl.test(linkImageUrl) == false) {
      return res.json({
        isSuccess: false,
        code: 2007,
        message: "이미지 링크가 올바른 링크 형식이 아닙니다",
      });
    }
  }
  if (linkFaviconUrl) {
    var regexUrl = /https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,}/;
    if (regexUrl.test(linkFaviconUrl) == false) {
      return res.json({
        isSuccess: false,
        code: 2008,
        message: "파비콘 링크가 올바른 링크 형식이 아닙니다",
      });
    }
  }
  try {
    const [userCheckResult] = await linkDao.userCheck(token.userIdx);
    if (!userCheckResult)
      return res.json({
        isSuccess: false,
        code: 2010,
        message: "비활성화되어 있거나 탈퇴된 회원입니다",
      });
    //link 업데이트
    const updateLinkResult = await linkDao.updateLink(
      folderIdx,
      linkName,
      linkUrl,
      linkImageUrl,
      linkFaviconUrl,
      linkIdx
    );
    if (updateLinkResult.isSuccess == false) return res.json(updateLinkResult);
    return res.json({
      isSuccess: true,
      code: 1000,
      userIdx: token.userIdx,
      message: "링크 수정 성공",
    });
  } catch (err) {
    logger.error(`changeLink error\n: ${JSON.stringify(err)}`);
    return res.json({
      isSuccess: false,
      code: 2000,
      userIdx: token.userIdx,
      message: "링크 수정 실패",
    });
  }
};

exports.deleteLink = async function (req, res) {
  const token = req.verifiedToken;
  const linkIdx = req.params.linkIdx;

  if (!isNaN(linkIdx) == false) {
    return res.json({
      isSuccess: false,
      code: 2001,
      message: "잘못된 링크 번호입니다",
    });
  }
  const checkLinkResult = await linkDao.checkLink(linkIdx);
  if (!checkLinkResult || checkLinkResult.length < 1) {
    return res.json({
      isSuccess: false,
      code: 2002,
      message: "존재하지 않거나 이미 삭제된 링크입니다",
    });
  } else {
    if (checkLinkResult[0].userIdx != token.userIdx) {
      //링크 만든 사람만 링크 삭제 가능하게 함.
      return res.json({
        isSuccess: false,
        code: 2003,
        message: "권한이 없습니다",
      });
    }
  }
  try {
    const [userCheckResult] = await linkDao.userCheck(token.userIdx);
    if (!userCheckResult)
      return res.json({
        isSuccess: false,
        code: 2010,
        message: "비활성화되어 있거나 탈퇴된 회원입니다",
      });
    const deleteLinkResult = await linkDao.deleteLink(linkIdx);
    if (deleteLinkResult.isSuccess == false) return res.json(deleteLinkResult);
    return res.json({
      isSuccess: true,
      code: 1000,
      userIdx: token.userIdx,
      message: "링크 삭제 성공",
    });
  } catch (err) {
    logger.error(`deleteLink error\n: ${JSON.stringify(err)}`);
    return res.json({
      isSuccess: false,
      code: 2000,
      userIdx: token.userIdx,
      message: "링크 삭제 실패",
    });
  }
};

exports.searchLink = async function (req, res) {
  const token = req.verifiedToken;
  let searchWord = req.query.word;
  const { page, limit, isMyFolders } = req.query;

  if (!searchWord || searchWord.length < 1) {
    searchWord = null;
  }
  if (!page) {
    return res.json({
      isSuccess: false,
      code: 2011,
      message: "page를 입력하세요",
    });
  }

  if (!limit) {
    return res.json({
      isSuccess: false,
      code: 2012,
      message: "limit를 입력하세요",
    });
  }

  if (isMyFolders && !isNaN(isMyFolders) == false) {
    return res.json({
      isSuccess: false,
      code: 2003,
      message: "잘못된 기준 번호입니다",
    });
  }

  try {
    const pageStart = Number(page) * Number(limit);
    const [userCheckResult] = await linkDao.userCheck(token.userIdx);
    if (!userCheckResult)
      return res.json({
        isSuccess: false,
        code: 2010,
        message: "비활성화되어 있거나 탈퇴된 회원입니다",
      });

    if (isMyFolders == 1) {
      const resultMyLinkCount = await linkDao.myLinkSearchCount(searchWord, token.userIdx);
      if (resultMyLinkCount.isSuccess == false) return res.json(resultMyLinkCount);

      const searchMyLinkResult = await linkDao.selectSearchMyLink(searchWord, token.userIdx, pageStart, Number(limit));
      if (searchMyLinkResult.isSuccess == false) return res.json(searchMyLinkResult);
      return res.json({
        isSuccess: true,
        code: 1000,
        userIdx: token.userIdx,
        message: "내 링크 검색 성공",
        resultCount: resultMyLinkCount[0].resultCount,
        result: searchMyLinkResult,
      });
    }

    const resultLinkCount = await linkDao.linkSearchCount(searchWord);
    if (resultLinkCount.isSuccess == false) return res.json(resultLinkCount);

    const searchLinkResult = await linkDao.selectSearchLink(searchWord, pageStart, Number(limit));
    if (searchLinkResult.isSuccess == false) return res.json(searchLinkResult);
    return res.json({
      isSuccess: true,
      code: 1000,
      userIdx: token.userIdx,
      message: "링크 검색 성공",
      resultCount: resultLinkCount[0].resultCount,
      result: searchLinkResult,
    });
  } catch (err) {
    console.log(err);
    logger.error(`searchLink error\n: ${JSON.stringify(err)}`);
    return res.json({
      isSuccess: false,
      code: 2000,
      userIdx: token.userIdx,
      message: "링크 검색 실패",
    });
  }
};
