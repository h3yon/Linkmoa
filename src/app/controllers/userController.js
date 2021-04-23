const {pool} = require("../../../config/database");
const {logger} = require("../../../config/winston");
const secret_config = require("../../../config/secret");
const fs = require("fs");
const AppleAuth = require("apple-auth");
const config = fs.readFileSync("config/appleConfig.json");
const auth = new AppleAuth(config, "config/AuthKey.p8");
const jwt = require("jsonwebtoken");

const userDao = require("../dao/userDao");
const {userCheck, insertLink} = require("../dao/linkDao");
const {deleteLikeStatus} = require("../dao/likeDao");
const {
  insertFolderDetail,
  insertFolderTag,
  deleteFolderByStatus,
  deleteLinkByStatus,
  deleteFolderTag,
} = require("../dao/folderDao");

// Apple 소셜 로그인
exports.appleLogin = async function (req, res) {
  const {code} = req.body;
  let response = ``;
  let idToken = ``;

  const conn = await pool.getConnection();

  try {
    response = await auth.accessToken(code);
    idToken = jwt.decode(response.id_token);
  } catch (err) {
    console.log(err);
    return res.json({
      isSuccess: true,
      code: 2000,
      message: "유효하지 않은 code입니다.",
    });
  }
  // const idToken = jwt.decode(
  //   "eyJraWQiOiI4NkQ4OEtmIiwiYWxnIjoiUlMyNTYifQ.eyJpc3MiOiJodHRwczovL2FwcGxlaWQuYXBwbGUuY29tIiwiYXVkIjoiY29tLm1vZHUuTGlua01vYSIsImV4cCI6MTYxNTEyNjcyMCwiaWF0IjoxNjE1MDQwMzIwLCJzdWIiOiIwMDE5MzcuOWNkMjEwMGE3NDA1NDE3MmFkOGZlM2RmMmM4NDQxZGQuMDcwNiIsImNfaGFzaCI6IlNhUEs1b2J4ZVRJd2JvRlYwWGk0YnciLCJlbWFpbCI6InRxdWVpNzRiZ2RAcHJpdmF0ZXJlbGF5LmFwcGxlaWQuY29tIiwiZW1haWxfdmVyaWZpZWQiOiJ0cnVlIiwiaXNfcHJpdmF0ZV9lbWFpbCI6InRydWUiLCJhdXRoX3RpbWUiOjE2MTUwNDAzMjAsIm5vbmNlX3N1cHBvcnRlZCI6dHJ1ZX0.hROQ1d4BGDlwFOPQ7L22rZerRQYTzLwGESgpGInTQLXsAfDHJPgRMKxJTZXaJus-68vJWzufz2X0O0rwV4IzcEowVMbiX6dPA4dgfBcyAL_9KQ9rifHFMfa6LcYwLjcDL1wMxJqCn0tM7KH0CM0Nmke2EO9uSQGokOULLWZ133gN2wKSefGoLrdG16uEzSw70T1qq7Vsta4N78B6ht9bknggl6TPlowxC8L08QPcLoLgzlD87wAO8wBnBx5Hb44gtLDyUq8C4ORdLj9VPAvqD4Q0Ks-IqYwQ7-FJ4Nj6-cUhsK5SZHIsZp9sDpJe9VmGq8I317R4qKVOI6pjuDQfqg"
  // );
  const email = idToken.email;
  const sub = idToken.sub;

  try {
    const socialIdCheckRows = await userDao.socialIdCheck(sub);
    if (socialIdCheckRows.length > 0) {
      let token = await jwt.sign(
        {
          userIdx: socialIdCheckRows[0].userIdx,
        }, //일단 jwt에 유저인덱스만 담아놓음.
        secret_config.jwtsecret,
        {
          expiresIn: "365d",
          subject: "userInfo",
        }
      );

      return res.json({
        isSuccess: true,
        code: 1001,
        message: "Apple 로그인 성공",
        result: {
          jwt: token,
          userIdx: socialIdCheckRows[0].userIdx,
          member: "회원",
        },
      });
    } else {
      await conn.beginTransaction();

      const insertAppleUserRows = await userDao.insertAppleUser(conn, sub, email);
      let token = await jwt.sign(
        {
          userIdx: insertAppleUserRows.insertId,
        }, //일단 jwt에 유저인덱스만 담아놓음.
        secret_config.jwtsecret,
        {
          expiresIn: "365d",
          subject: "userInfo",
        }
      );
      const insertFolderDetailParams = [insertAppleUserRows.insertId, 5, null, "링크모아 안녕❗", "private"];
      const insertFolderDetailRow = await insertFolderDetail(conn, insertFolderDetailParams);
      await insertFolderTag(conn, insertFolderDetailRow.insertId, "링크모아");
      await insertLink(
        insertFolderDetailRow.insertId,
        insertAppleUserRows.insertId,
        "링크모아 사용설명서",
        "https://www.notion.so/Welcome-to-03a0f35b0e93403b87009c8eaa982554",
        "https://firebasestorage.googleapis.com/v0/b/linkmoa-86681.appspot.com/o/linkImgUrl.png?alt=media&token=64bf0f4b-110e-402b-b4a5-51c691526f88",
        "https://firebasestorage.googleapis.com/v0/b/linkmoa-86681.appspot.com/o/faviconImgUrl.png?alt=media&token=f431f00a-8033-420b-9a32-4738a30f980e"
      );
      await insertLink(
        insertFolderDetailRow.insertId,
        insertAppleUserRows.insertId,
        "링크모아 인스타그램",
        "https://www.instagram.com/official_linkmoa/",
        "https://firebasestorage.googleapis.com/v0/b/linkmoa-86681.appspot.com/o/linkImgUrl.png?alt=media&token=64bf0f4b-110e-402b-b4a5-51c691526f88",
        "https://www.google.com/s2/favicons?sz=64&domain_url=https://www.instagram.com"
      );
      await conn.commit();
      return res.json({
        isSuccess: true,
        code: 1000,
        message: "Apple 회원가입 성공",
        result: {
          jwt: token,
          userIdx: insertAppleUserRows.insertId,
          member: "비회원",
        },
      });
    }
  } catch (err) {
    await conn.rollback();
    logger.error(`App - appleLogin Query error\n: ${err.message}`);
    return res.status(500).send(`Error: ${err.message}`);
  } finally {
    conn.release();
  }
};

// 회원 탈퇴
exports.deleteUserInfo = async function (req, res) {
  const conn = await pool.getConnection();

  if (!(Number(req.params.userIdx) === req.verifiedToken.userIdx)) {
    return res.json({
      isSuccess: false,
      code: 2000,
      message: "권한이 없습니다.",
    });
  }
  const {userIdx} = req.params;
  const [userCheckResult] = await userCheck(userIdx);
  if (!userCheckResult)
    return res.json({
      isSuccess: false,
      code: 2010,
      message: "비활성화되어 있거나 탈퇴된 회원입니다.",
    });

  try {
    await conn.beginTransaction();

    const selectMyFolderRow = await userDao.selectMyFolder(conn, userIdx);
    for (let i = 0; i < selectMyFolderRow.length; i++) {
      await deleteFolderByStatus(conn, selectMyFolderRow[i].folderIdx);
      await deleteFolderTag(conn, selectMyFolderRow[i].folderIdx);
      await deleteLinkByStatus(conn, selectMyFolderRow[i].folderIdx);
    }
    await deleteLikeStatus(conn, userIdx);
    await userDao.deleteUserInfo(conn, userIdx);
    await conn.commit();
    return res.json({
      isSuccess: true,
      code: 1000,
      message: "회원탈퇴 성공",
    });
  } catch (err) {
    await conn.rollback();
    logger.error(`App - deleteUserInfo Query error\n: ${err.message}`);
    return res.json({
      isSuccess: false,
      code: 4000,
      message: "회원탈퇴 실패",
    });
  } finally {
    conn.release();
  }
};

// 사용자정보조회
exports.getUserInfo = async function (req, res) {
  const {userIdx} = req.verifiedToken;
  try {
    const getUserInfoRow = await userDao.selectUserInfo(userIdx);
    if (!getUserInfoRow || getUserInfoRow.length < 1) {
      return res.json({
        isSuccess: false,
        code: 2010,
        message: "비활성화되어 있거나 탈퇴된 회원입니다.",
      });
    }
    return res.json({
      isSuccess: true,
      code: 1000,
      message: "사용자 정보 조회 성공",
      result: getUserInfoRow,
    });
  } catch (err) {
    logger.error(`getUserInfo Query error\n: ${err.message}`);
    return res.json({
      isSuccess: false,
      code: 2000,
      message: "사용자 정보 조회 실패",
    });
  }
};

// 유저 닉네임 중복확인
// exports.nicknameCheck = async function (req, res) {
//   const { userIdx } = req.verifiedToken;
//   const { userNickname } = req.params;

//   if (!userNickname) {
//     return res.json({
//       isSuccess: false,
//       code: 2000,
//       message: "userNickname을 입력하세요.",
//     });
//   }
//   try {
//     // 닉네임 중복 확인
//     const userNicknameCheckRow = await userDao.userNicknameCheck(userIdx, userNickname);
//     if (userNicknameCheckRow.length > 0) {
//       return res.json({
//         isSuccess: false,
//         code: 4000,
//         message: "중복된 닉네임입니다.",
//       });
//     }
//     return res.json({
//       isSuccess: true,
//       code: 1000,
//       message: "사용가능한 닉네임입니다.",
//     });
//   } catch (err) {
//     logger.error(`App - nicknameCheck Query error\n: ${err.message}`);
//     return res.status(500).send(`Error: ${err.message}`);
//   }
// };
