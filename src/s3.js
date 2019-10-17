"use strict";

var fileType = require("file-type");
var AWS = require("aws-sdk");
var s3 = new AWS.S3();

module.exports.savePhoto = (key, photoData) => {
  if (photoData.byteLength > process.env.MAX_PHOTO_SIZE) {
    Promise.reject("Photo too large. The maximum supported size is 1 MB");
  }

  const mimeType = fileType(photoData);
  if (!mimeType) {
    Promise.reject("Photo type not supported.");
  }
  var params = {
    ACL: "public-read",
    Bucket: process.env.PHOTO_BUCKET,
    Key: key,
    Body: photoData,
    ContentType: mimeType.mime
  };
  return new Promise((resolve, reject) => {
    s3.putObject(params, err => {
      if (err) {
        reject(err);
      } else {
        resolve(key);
      }
    });
  });
};
