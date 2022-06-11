let t = require('./twitter_followers');
exports.handler = async function (event, context) {
    let description = 'default description';
    console.log(` start execution of lambda ${context.functionName}`);
    console.log("EVENT: \n" + JSON.stringify(event, null, 2));
    console.log('calling queryAndUpdateFollowers');
    description = t.queryAndUpdateFollowers();
    console.log('post calling queryAndUpdateFollowers');
    let responseBody = { description: description };
    let response = {
      statusCode: 200,
      headers: {
      },
      body: JSON.stringify(responseBody)
    };
    return response;
  }