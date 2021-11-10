// dependencies
const AWS = require('aws-sdk');

// get reference to the S3 client
const s3 = new AWS.S3();

exports.handler = async event => {
  // TODO implement

  const bucketName = event.Records[0].s3.bucket.name;
  const fileName = event.Records[0].s3.object.key;
  const fileSize = event.Records[0].s3.object.size;

  console.log(bucketName, fileName, fileSize);

  const params = {
    Bucket: bucketName,
    Key: 'images.json',
  };

  try {
    const manifest = await s3.getObject(params).promise();

    let manifestData = JSON.parse(manifest.Body.toString());
    manifestData.push({
      name: fileName,
      size: fileSize,
      type: 'image',
    });

    let manifestBody = JSON.stringify(manifestData);
    console.log('current manifest', manifestData);

    const newManifest = await s3
      .putObject({
        ...params,
        Body: manifestBody,
        ContentType: 'application/json',
      })
      .promise();
    console.log('new Manifest', JSON.stringify(newManifest));
  } catch (e) {
    console.log(e);

    const newManifest = {
      Bucket: bucketName,
      Key: 'images.json',
      Body: JSON.stringify([{ name: fileName, size: fileSize, type: 'image' }]),
      ContentType: 'application/json',
    };

    const manifest = await s3.putObject(newManifest).promise();
    console.log('JSON file created for bucket:', manifest);
  }

  const response = {
    statusCode: 200,
    body: JSON.stringify('Hello from Lambda!'),
  };
  return response;
};
