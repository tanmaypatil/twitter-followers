var AWS = require("aws-sdk");
let util = require("./utils");
let api = require('./twitter_api');
const utils = require("./utils");
let audit = require('./audit');

let endpoint = util.get_endpoint();

AWS.config.update({
  region: process.env.AWS_REGION,
  endpoint: endpoint,
});

var docClient = new AWS.DynamoDB.DocumentClient();

function getParams(user_id , user_date) {
  let params = {
    TableName: "twitter_followers",
    KeyConditionExpression: "id = :user_id and #d <= :user_date",
    ExpressionAttributeNames : 
    {"#d" : "date"},
    ExpressionAttributeValues: {
      ":user_id": user_id,
      ":user_date" : user_date
    },
  };
  return params;
}

function getUpdateParams(user_id , user_date, followers) {
    var params = {
        TableName: 'twitter_followers',
        Key: {
          'id' : user_id,
          'date' : user_date
        },
        UpdateExpression: 'set followers = :f',
        ExpressionAttributeValues: {
          ':f' : followers
         
        }
      };
      return params;
  }


async function queryUser(user_id) {
  return new Promise((resolve, reject) => {
    let params = getParams(user_id,'20220522');
    docClient.query(params, function (err, data) {
      if (err) {
        console.error(
          "query_followers : Unable to query. Error:",
          JSON.stringify(err, null, 2)
        );
        reject(err);
      } else {
        console.log("query_alarm : Query succeeded." + JSON.stringify(data));
        if (data.Count === 0) {
          console.log("user id  not found : " + user_id);
          let arr = [];
          resolve(arr);
        }
        //var arr = [];
        data.Items.forEach(function (item) {
          console.log(" followers " + item.followers);
          let followers = item.followers;
          console.log('type of followers '+typeof followers);
          if ( Array.isArray(followers)){
              console.log('followers is array '+followers.length);
          }
          else {
              console.log('followers is not array');
          }
          console.log(" date " + item.date);
          //arr.push(item);
        });
        resolve(data.Items);
      }
    });
  });
}

async function updateFollowers(user_id , user_date ,user_followers) {
    return new Promise((resolve, reject) => {
        let params = getUpdateParams(user_id,'20220522',user_followers);
        docClient.update(params, function(err, data) {
            if (err) {
              console.log("Error in updating followers", err);
              reject(err);
            } else {
              console.log("Success in updating", data);
              resolve(data);
            }
          });
    }

)}

async function queryAndUpdateFollowers() {
  console.log('querying current stored followers for user');
   let followers = await queryUser('tanmay_patil');
   console.log('querying current stored followers for users');
   let user_followers = await api.followers_id();
   let followers_lost = utils.difference_arr(followers,user_followers);
   let followers_gained = utils.difference_arr(user_followers,followers);
   await updateFollowers('tanmay_patil','20220522',user_followers);
   audit.insert_audit('tanmay_patil',followers_gained,followers_lost);
}


queryAndUpdateFollowers();