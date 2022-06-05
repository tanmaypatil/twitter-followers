var AWS = require("aws-sdk");
let util = require("./utils");
let date_fns = require("./date_util");
let endpoint = util.get_endpoint();
const userInfo = require("./user_lookup");

AWS.config.update({
  region: process.env.AWS_REGION,
  endpoint: endpoint,
});

var docClient = new AWS.DynamoDB.DocumentClient();

async function insert_audit(
  user_id,
  followers,
  unfollowers,
  audit_comment,
  first_time
) {
  return new Promise(async function (resolve, reject) {
    let audit = [];
    let current_date = date_fns.getTodaysDate();
    let n = await set_names(followers, unfollowers);
    // store followers
    let obj = { followers: n.followers };
    audit.push(obj);
    // store unfollowers
    let obj1 = { unfollowers: n.unfollowers };
    audit.push(obj1);
    let id = `${user_id}-audit`;

    let params = {
      TableName: "twitter_followers",
      Item: {
        id: id,
        date: current_date,
        type: "audit",
        audit: audit,
        comment: audit_comment,
        first_time: first_time,
      },
    };
    console.log("insertAlarm : adding audit into twitter_follower ");
    docClient.put(params, function (err, data) {
      if (err) {
        console.error(
          "Unable to add audit Error JSON:",
          JSON.stringify(err, null, 2)
        );
        reject(err);
      } else {
        console.log("Added audit : twitter_Followers");
        resolve(data);
      }
    });
  });
}

async function set_names(followers, unfollowers) {
  let followers_names = [];
  let unfollowers_name = [];
  for (let f of followers) {
    console.log(" f " + f);
    if (typeof f !== "string") {
      console.log("skipping followers user fetch for " + JSON.stringify(f));
      continue;
    }
    let name = await userInfo.userInfo(f);
    followers_names.push(name);
  }
  for (let u of unfollowers) {
    console.log(" u " + u);
    if (typeof u !== "string") {
      console.log("skipping followers user fetch" + JSON.stringify(u));
      continue;
    }
    let name = await userInfo.userInfo(u);
    unfollowers_name.push(name);
  }
  return { followers: followers_names, unfollowers: unfollowers_name };
}

async function test_audit() {
  let user_id = "tanmay_patil";
  let followers = ["1234", "6666666666666666", "77777777777777777777"];
  let unfollowers = ["888888888888888888888", "99999999999999999999"];
  await insert_audit(user_id, followers, unfollowers);
}

//test_audit();

module.exports = {
  insert_audit: insert_audit,
};
