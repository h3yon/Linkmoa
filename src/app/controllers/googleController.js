const { pool } = require("../../../config/database");
const { logger } = require("../../../config/winston");
// const request = require("request");
const axios = require("axios");
const jwt = require("jsonwebtoken");
const secret_config = require("../../../config/secret");
const googleDao = require("../dao/googleDao");
const { insertLink } = require("../dao/linkDao");
const { selectUserInfo } = require("../dao/userDao");

// 구글 로그인
exports.googleLogin = async function (req, res) {
  const access_token = req.body.access_token;
  try {
    async function getUserIdx(socialId) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const socialIdCheckRows = googleDao.socialIdCheck(socialId);
          resolve(socialIdCheckRows);
        }, 1000);
      });
    }
    async function getLatestUserIdx(socialId) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const latestUserIdxRows = googleDao.selectLatestUserIdx(socialId);
          resolve(latestUserIdxRows);
        }, 1000);
      });
    }
    async function getFirstFolderIdx(userIdx) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const firstFolderIdx = googleDao.selectFirstFolderIdx(userIdx);
          resolve(firstFolderIdx);
        }, 1000);
      });
    }
    async function insertGoogleUser(socialId, email) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const insertGoogleRows = googleDao.insertGoogleUser(socialId, email);
          resolve(insertGoogleRows);
        }, 1000);
      });
    }
    const googleData = await axios.get(
      `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${access_token}`,
      function (error, response, body) {
        // console.log(body);
        resultJSON = JSON.parse(body);
        return resultJSON;
      }
    );
    if (!googleData.data.id) {
      return res.json({
        isSuccess: false,
        code: 2001,
        message: "유효하지 않은 access token 입니다",
      });
    } else {
      //데이터가 잘 있을 때
      let userIdx = await getUserIdx(googleData.data.id); //절대 숫자 아님
      if (!userIdx || !userIdx.length) {
        //유저 정보가 없는 경우
        await insertGoogleUser(googleData.data.id, googleData.data.email);
        const latestUser = await getLatestUserIdx(googleData.data.id);
        let token = jwt.sign(
          { userIdx: latestUser[0].userIdx }, //일단 jwt에 유저인덱스만 담아놓음.
          secret_config.jwtsecret,
          { expiresIn: "365d", subject: "userInfo" }
        );
        const tokenInfo = jwt.verify(token, secret_config.jwtsecret);
        const insertFolderDetailParams = [latestUser[0].userIdx, 5, null, "링크모아 안녕❗", "private"];
        const insertFolderDetailRow = await googleDao.insertFolderDetail(insertFolderDetailParams);
        console.log(insertFolderDetailRow);

        const firstFolder = await getFirstFolderIdx(latestUser[0].userIdx);
        const insertTagResult = await googleDao.insertFolderTag(firstFolder[0].folderIdx, "링크모아");
        if (!insertTagResult || insertTagResult.isSuccess == false) {
          return res.json(insertTagResult);
        }
        const insertLinkResult1 = insertLink(
          firstFolder[0].folderIdx,
          latestUser[0].userIdx,
          "링크모아 사용설명서",
          "https://www.notion.so/Welcome-to-03a0f35b0e93403b87009c8eaa982554",
          "https://firebasestorage.googleapis.com/v0/b/linkmoa-86681.appspot.com/o/linkImgUrl.png?alt=media&token=64bf0f4b-110e-402b-b4a5-51c691526f88",
          "https://firebasestorage.googleapis.com/v0/b/linkmoa-86681.appspot.com/o/faviconImgUrl.png?alt=media&token=f431f00a-8033-420b-9a32-4738a30f980e"
        );
        if (!insertLinkResult1 || insertLinkResult1.isSuccess == false) return res.json(insertLinkResult1);

        const insertLinkResult2 = insertLink(
          firstFolder[0].folderIdx,
          latestUser[0].userIdx,
          "링크모아 인스타그램",
          "https://www.instagram.com/official_linkmoa/",
          "https://firebasestorage.googleapis.com/v0/b/linkmoa-86681.appspot.com/o/linkImgUrl.png?alt=media&token=64bf0f4b-110e-402b-b4a5-51c691526f88",
          "https://www.google.com/s2/favicons?sz=64&domain_url=https://www.instagram.com"
        );
        if (!insertLinkResult2 || insertLinkResult2.isSuccess == false) return res.json(insertLinkResult2);
        res.json({
          isSuccess: true,
          code: 1000,
          message: "구글 회원가입 성공",
          result: {
            jwt: token,
            userIdx: latestUser[0].userIdx,
            member: "비회원",
          },
        });
      } else {
        //유저 정보가 있는 경우
        let token = jwt.sign(
          { userIdx: userIdx[0].userIdx }, //일단 jwt에 유저인덱스만 담아놓음.
          secret_config.jwtsecret,
          { expiresIn: "365d", subject: "userInfo" }
        );
        const tokenInfo = jwt.verify(token, secret_config.jwtsecret);
        return res.json({
          isSuccess: true,
          code: 1000,
          message: "구글 로그인 성공",
          result: {
            jwt: token,
            userIdx: userIdx[0].userIdx,
            member: "회원",
          },
        });
      }
    }
  } catch (error) {
    return res.json({
      isSuccess: false,
      code: 2000,
      message: "구글 로그인/회원가입 실패",
    });
  }
};

// 유저 정보 추가
exports.addUserInfo = async function (req, res) {
  const token = req.verifiedToken;
  let { userNickname, userProfileImgUrl, userCategoryIdx, userDetailCategoryIdx } = req.body;
  if (userNickname) {
    if (userNickname.length > 30) {
      return res.json({
        isSuccess: false,
        code: 2003,
        message: "userNickname은 30자 이하로 입력해주세요.",
      });
    }
  }

  if (userProfileImgUrl) {
    var regexUrl = /https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,}/;
    if (regexUrl.test(userProfileImgUrl) == false) {
      return res.json({
        isSuccess: false,
        code: 2004,
        message: "프로필 이미지 링크가 올바른 링크 형식이 아닙니다",
      });
    }
  }

  if (userCategoryIdx)
    if (!/[1-5]/.test(userCategoryIdx)) {
      return res.json({
        isSuccess: false,
        code: 2006,
        message: "categoryIdx는 1-5 사이의 정수입니다.",
      });
    }

  if (userDetailCategoryIdx) {
    switch (userCategoryIdx) {
      case 1:
        if (!(userDetailCategoryIdx >= 1 && userDetailCategoryIdx <= 10))
          return res.json({
            isSuccess: false,
            code: 2007,
            message: "userCategoryIdx 1일때 userDetailCategoryIdx 1~10을 입력하세요.",
          });
        break;
      case 2:
        if (!(userDetailCategoryIdx >= 11 && userDetailCategoryIdx <= 18))
          return res.json({
            isSuccess: false,
            code: 2008,
            message: "userCategoryIdx 2일때 userDetailCategoryIdx는 11~18을 입력하세요.",
          });
        break;
      case 3:
        if (!(userDetailCategoryIdx >= 19 && userDetailCategoryIdx <= 25))
          return res.json({
            isSuccess: false,
            code: 2009,
            message: "userCategoryIdx 3일때 userDetailCategoryIdx는 19~25을 입력하세요.",
          });
        break;
      case 4:
        if (!(userDetailCategoryIdx >= 26 && userDetailCategoryIdx <= 30))
          return res.json({
            isSuccess: false,
            code: 2010,
            message: "userCategoryIdx 4일때 userDetailCategoryIdx는 26~30을 입력하세요.",
          });
        break;
      case 5:
        if (userDetailCategoryIdx)
          return res.json({
            isSuccess: false,
            code: 2011,
            message: "userCategoryIdx 5일때 userDetailCategoryIdx를 Body에 담지마세요.",
          });
        break;
    }
  }
  try {
    const [userCheckResult] = await googleDao.userCheck(token.userIdx);
    if (!userCheckResult)
      return res.json({
        isSuccess: false,
        code: 2002,
        message: "비활성화되어 있거나 탈퇴된 회원입니다",
      });

    const userInfoRow = await selectUserInfo(token.userIdx);
    if (userNickname) {
      const userNicknameCheckRow = await googleDao.userNicknameCheck(token.userIdx, userNickname);
      if (userNicknameCheckRow.length > 0) {
        return res.json({
          isSuccess: false,
          code: 2012,
          message: "중복된 닉네임입니다.",
        });
      }
    } else {
      userNickname = userInfoRow[0].userNickname;
    }

    if (!userProfileImgUrl) {
      let temp = "";
      if (userInfoRow[0].userNickName === "-1") {
        temp = null;
      } else {
        temp = userInfoRow[0].userNickName;
      }
      userProfileImgUrl = temp;
    }

    if (!userCategoryIdx) {
      let temp = "";
      if (userInfoRow[0].userCategoryIdx === -1) {
        temp = null;
      } else {
        temp = userInfoRow[0].userCategoryIdx;
      }
      userCategoryIdx = temp;
    }

    if (!userDetailCategoryIdx) {
      let temp = "";
      if (userInfoRow[0].userDetailCategoryIdx === -1) {
        temp = null;
      } else {
        temp = userInfoRow[0].userDetailCategoryIdx;
      }
      userDetailCategoryIdx = temp;
    }

    const addUserInfoResult = await googleDao.updateUserInfo(
      userNickname,
      userProfileImgUrl,
      token.userIdx,
      userCategoryIdx,
      userDetailCategoryIdx
    );
    if (addUserInfoResult.isSuccess == false) return res.json(addUserInfoResult);
    return res.json({
      isSuccess: true,
      code: 1000,
      userIdx: token.userIdx,
      message: "유저 정보 추가 성공",
    });
  } catch (err) {
    logger.error(`addUserInfo error\n: ${JSON.stringify(err)}`);
    console.log(err);
    return res.json({
      isSuccess: false,
      code: 2000,
      message: "유저 정보 추가 실패",
    });
  }
};
