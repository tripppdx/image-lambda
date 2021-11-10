// dependencies
const AWS = require('aws-sdk');
const util = require('util');

// get reference to the S3 client
const s3 = new AWS.S3();

exports.handler = async (event, context, callback) => {
  // Read options from the event parameter.
  console.log(
    'Reading options from event:\n',
    util.inspect(event, { depth: 5 })
  );
  const srcBucket = event.Records[0].s3.bucket.name;
  // Object key may have spaces or unicode non-ASCII characters.
  const srcKey = decodeURIComponent(
    event.Records[0].s3.object.key.replace(/\+/g, ' ')
  );

  console.log('my key', srcKey);
  console.log('my bucket', srcBucket);

  try {
    let resData = await s3
      .getObject({ Bucket: srcBucket, Key: 'image.json' })
      .promise();
    let parsedData = JSON.parse(resData.Body.toString());
    console.log('parsed data', parsedData);
    // if (!bucket.Body){
    const newImage = await s3
      .putObject({
        Bucket: srcBucket,
        Key: `image.json`,
        Body: parsedData
          ? [...parsedData, { test: 'test' }]
          : [{ test: 'test' }],
      })
      .promise();
    console.log('myImage', newImage);
  } catch (error) {
    const newImage = await s3
      .putObject({
        Bucket: srcBucket,
        Key: `image.json`,
        Body: '[{"test": "test"}]',
      })
      .promise();
  }

  const response = {
    statusCode: 200,
    body: JSON.stringify('Hello from Lambda!'),
  };

  return response;
};
