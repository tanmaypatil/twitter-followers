const needle = require("needle");
require("dotenv").config();
let userId = 77529292;

const bearerToken = process.env.BEARER_TOKEN;
console.log("token " + bearerToken);

const options = {
  headers: {
    "User-Agent": "v2FollowingJS",
    Authorization: `Bearer ${bearerToken}`,
  },
};

async function get_userinfo(userId) {
  const url = `https://api.twitter.com/2/users/${userId}`;
  let resp = {};
  
  try {
    resp = await needle("get", url, null, options);
    //console.log("status code " + resp.statusCode);
    //console.log("response body " + JSON.stringify(resp.body));
    if (resp.statusCode != 200) {
      console.log(
        `${url} ${resp.statusCode} ${resp.headers} ${resp.statusMessage}:\n${resp.body}`
      );
      return;
    }
  } catch (e) {
    console.log(e);
  }
  //console.log("get_userinfo " + JSON.stringify(resp.body.data));
  return resp.body.data;
}

async function userInfo(userId) {
  if (userId) {
    let user = await get_userinfo(userId);
    console.log(`user : ${user.name} `);
    return user.name;
  } else {
    console.log("null user id");
    return "noname";
  }
}

//userInfo();

module.exports = {
  userInfo: userInfo,
};
