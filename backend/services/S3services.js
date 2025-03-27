require('dotenv').config();
const AWS = require('aws-sdk');

const uploadToS3 = (data, filename) => {
    const s3bucket = new AWS.S3({
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_REGION,
        Bucket: process.env.AWS_BUCKET_NAME
    });

    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: filename,
        Body: data,
        ACL: 'public-read'
    };

    return new Promise((resolve, reject) => {
        s3bucket.upload(params, (err, s3response) => {
            if (err) {
                reject(err);
            } else {
                console.log("Upload Success:", s3response);
                resolve(s3response.Location);
            }
        });
    });
};

module.exports = uploadToS3;
