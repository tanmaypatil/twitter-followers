var AWS = require("aws-sdk");
let util = require("./utils");
let date_fns = require("./date_util");
let endpoint = util.get_endpoint();

AWS.config.update({
  region: process.env.AWS_REGION,
  endpoint: endpoint,
});

var docClient = new AWS.DynamoDB.DocumentClient();

async function insert_audit(user_id, followers, unfollowers,audit_comment) {
  return new Promise(function (resolve, reject) {
    let audit = [];
    let current_date = date_fns.getTodaysDate();
    // store followers
    let obj = { followers: followers };
    audit.push(obj);
    // store unfollowers
    let obj1 = { unfollowers: unfollowers };
    audit.push(obj1);
    let id = `${user_id}-audit`;

    let params = {
      TableName: "twitter_followers",
      Item: {
        id: id,
        date: current_date,
        type: "audit",
        audit: audit,
        comment : audit_comment
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

 async function test_audit(){
  let user_id = 'tanmay_patil';
  let followers = [ '1234','6666666666666666','77777777777777777777'];
  let unfollowers = [ '888888888888888888888','99999999999999999999'];
  await insert_audit(user_id,followers,unfollowers);
}

test_audit();

module.exports = {
  insert_audit : insert_audit
}
