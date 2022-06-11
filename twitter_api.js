const needle = require('needle');
require('dotenv').config();
let userId = 77529292;
const url = `https://api.twitter.com/2/users/${userId}/followers`;
const bearerToken = process.env.BEARER_TOKEN;

const options = {
  headers: {
    "User-Agent": "v2FollowingJS",
    Authorization: `Bearer ${bearerToken}`,
  },
};

let params = {
  max_results: 1000,
  'user.fields' : "id"
};

async function fetch_followers() {
  let users = [];
  let hasNextPage = true;
  let nextToken = null;
  console.log("fetch_followers : Retrieving users this user is following");
  while (hasNextPage) {
    let resp = await getPage(params, options, nextToken);
    if (
      resp &&
      resp.meta &&
      resp.meta.result_count &&
      resp.meta.result_count > 0
    ) {
      if (resp.data) {
        users.push.apply(users, resp.data);
      }
      if (resp.meta.next_token) {
        nextToken = resp.meta.next_token;
      } else {
        hasNextPage = false;
      }
    } else {
      hasNextPage = false;
    }
  }
  return users;
}

const getPage = async (params, options, nextToken) => {
  if (nextToken) {
    params.pagination_token = nextToken;
  }

  try {
    const resp = await needle("get", url, params, options);

    if (resp.statusCode != 200) {
      console.log(`${resp.statusCode} ${resp.statusMessage}:\n${resp.body}`);
      return;
    }
    return resp.body;
  } catch (err) {
    throw new Error(`Request failed: ${err}`);
  }
};

async function followers_id() {
  let users = await fetch_followers();
  //console.log(users);
  let id = [];
  for ( let u of users) {
    id.push(u.id);
  }
  console.log('followers user id '+id);
  return id;
}


//followers_id();

module.exports = {
  followers_id : followers_id
}