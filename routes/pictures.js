const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// GET pictures listing
router.get('/', async (req, res, next) => {
    const pictures = fs.readdirSync(path.join(__dirname, '../pictures'));
    res.render('pictures', { pictures: pictures });
});

// Get single picture, named
router.get('/:pictureName', async (req, res, next) => {
    const picture = req.params.pictureName;
    res.render('pictures', { pictures: [picture]});
});

router.post('/', async (req, res, next) => {
    console.log(req.files);
    const file = req.files.file;
    fs.writeFileSync(path.join(__dirname, '../pictures/', file.name), file.data);
    res.end();
});

module.exports = router;