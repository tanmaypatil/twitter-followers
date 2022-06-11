var AWS = require("aws-sdk");
let util = require("./utils");
let api = require("./twitter_api");
let date_api = require('./date_util');
let audit = require("./audit");

let endpoint = util.get_endpoint();

AWS.config.update({
  region: process.env.AWS_REGION,
  endpoint: endpoint,
});

var docClient = new AWS.DynamoDB.DocumentClient();

function getParams(user_id, user_date) {
  let params = {
    TableName: "twitter_followers",
    KeyConditionExpression: "id = :user_id and #d <= :user_date",
    ExpressionAttributeNames: { "#d": "date" },
    ExpressionAttributeValues: {
      ":user_id": user_id,
      ":user_date": user_date,
    },
  };
  return params;
}

function getUpdateParams(user_id, user_date, followers) {
  var params = {
    TableName: "twitter_followers",
    Key: {
      id: user_id,
      date: user_date,
    },
    UpdateExpression: "set followers = :f",
    ExpressionAttributeValues: {
      ":f": followers,
    },
  };
  return params;
}

async function queryUser(user_id) {
  return new Promise((resolve, reject) => {
    let params = getParams(user_id, "20220522");
    console.log("querying the twitter followers for list of follower id's");
    docClient.query(params, function (err, data) {
      if (err) {
        console.error(
          "query_followers : Unable to query. Error:",
          JSON.stringify(err, null, 2)
        );
        reject(err);
      } else {
        console.log("query twitter_follower : Query succeeded." + JSON.stringify(data));
        if (data.Count === 0) {
          console.log("user id  not found : " + user_id);
          let arr = [];
          resolve(arr);
        }
        //var arr = [];
        data.Items.forEach(function (item) {
          console.log(" followers " + item.followers);
          let followers = item.followers;
          console.log("type of followers " + typeof followers);
          if (Array.isArray(followers)) {
            console.log("followers is array " + followers.length);
          } else {
            console.log("followers is not array");
          }
          console.log(" date " + item.date);
          //arr.push(item);
        });
        resolve(data.Items[0].followers);
      }
    });
  });
}

async function updateFollowers(user_id, user_followers) {
  return new Promise((resolve, reject) => {
    let current_date = date_api.getTodaysDate();
    let params = getUpdateParams(user_id, "20220522", user_followers);
    docClient.update(params, function (err, data) {
      if (err) {
        console.log("Error in updating followers", err);
        reject(err);
      } else {
        console.log("Success in updating", data);
        resolve(data);
      }
    });
  });
}

async function queryAndUpdateFollowers() {
  console.log("querying current stored followers for user");
  let followers_lost = [];
  let followers_gained = [];
  let followers = await queryUser("tanmay_patil");
  let first_time = "N";
  
  console.log("querying current stored followers for users");
  let user_followers = await api.followers_id();
  // if followers are null , then it is first time fetch
  if (followers && followers.length > 0) {
    console.log('finding the difference between existing and new followers');
    followers_gained = util.difference_arr(followers, user_followers);
    followers_lost = util.difference_arr(user_followers, followers);
  }
  console.log('updating new followers for ');
  let data = await updateFollowers("tanmay_patil", user_followers);
  console.log(' after updateFollowers '+JSON.stringify(data));
  let new_followers = followers_gained.length;
  let lost_followers = followers_lost.length;
  let comment = `Followers gained : ${new_followers} Followers lost ${lost_followers}`;
  console.log(`followers stats : ${comment}`)
  if ( followers.length == 0 &&  followers_gained > 0) {
     comment = `first time , followers are being tracked`;
     first_time = "Y";
  }
  console.log('going for audit insert' );
  await audit.insert_audit("tanmay_patil", followers_gained, followers_lost,comment,first_time);
  return comment ;
}

module.exports = {
  queryAndUpdateFollowers : queryAndUpdateFollowers
};
queryAndUpdateFollowers();
