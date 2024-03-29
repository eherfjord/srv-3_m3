const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Adding S3 storage
const AWS = require('aws-sdk');
const s3 = new AWS.S3();

//Authentication setup
const { requiresAuth } = require('express-openid-connect');


// GET pictures listing
router.get('/', requiresAuth(), async (req, res, next) => {
    // const pictures = fs.readdirSync(path.join(__dirname, '../pictures'));
    console.log(req.oidc.user);
    const params = {
        Bucket: process.env.CYCLIC_BUCKET_NAME,
        Delimiter: '/',
        Prefix: req.oidc.user.email + '/'
    };
    const allObjects = await s3.listObjects(params).promise();
    const keys = allObjects?.Contents?.map(x => x.Key);

    const pictures = await Promise.all(keys.map( async (key) => {
        let my_file = await s3.getObject({
            Bucket: process.env.CYCLIC_BUCKET_NAME,
            Key: key
        }).promise();
        return {
            src: Buffer.from(my_file.Body).toString('base64'),
            name: key.split("/").pop()
        }
    }));

    res.render('pictures', { pictures: pictures, isAuthenticated: req.oidc.isAuthenticated() });
});

// Get single picture, named
router.get('/:pictureName', requiresAuth(), async (req, res, next) => {
    const picture = req.params.pictureName;
    res.render('pictures', { pictures: [picture]});
});

router.post('/', requiresAuth(), async (req, res, next) => {
    const file = req.files.file;
    console.log(req.files)

    await s3.putObject({
        Body: file.data,
        Bucket: process.env.CYCLIC_BUCKET_NAME,
        Key: req.oidc.user.email + '/' + file.name
    }).promise();

    // fs.writeFileSync(path.join(__dirname, '../pictures/', file.name), file.data);
    res.end();
});

module.exports = router;