const path = require('path');
const { randomNumer } = require('../helpers/libs');
const fs = require('fs-extra');
const md5 = require('md5');

const { Image, Comment } = require('../models');

const ctrl = {};

ctrl.index = async (req, res) => {
    const image = await Image.findOne({filename: {$regex: req.params.image_id}});
    const comments = await Comment.find({image_id: image._id});
    console.log(image);
    res.render('image', {image, comments});
};

ctrl.create = (req, res) => {

    const saveImage = async () => {
        const imageURL = randomNumer();
        const images = await Image.find({filename: imageURL});

        if(images.length > 0) {
            saveImage();
        } else {
            console.log(imageURL);
            const imageTempPath = req.file.path;
            const ext = path.extname(req.file.originalname).toLocaleLowerCase();
            const targetPath = path.resolve(`src/public/upload/${imageURL}${ext}`);

            if(ext === '.png' || ext === '.jpg' || ext === '.jpeg' || ext === '.gif') {
                await fs.rename(imageTempPath, targetPath);

                const newImg = new Image({
                    title: req.body.title,
                    filename: imageURL + ext,
                    description: req.body.description
                });
                const imageSave = await newImg.save();
                res.redirect('/images/' + imageURL);

                console.log(newImg);

            } else {
                await fs.unlink(imageTempPath);
                res.status(500).json({error: 'Only Images are allowed'});
            }
        }
    };
    saveImage();
};

ctrl.like = (req, res) => {

};

ctrl.comment = async (req, res) => {
    const image = await Image.findOne({filename: {$regex: req.params.image_id}});
    if(image) {
        const newComment = new Comment(req.body);
        
        newComment.gravatar = md5(newComment.email);
        newComment.image_id = image._id;
        await newComment.save();
        console.log(newComment);

        res.redirect('/images/' + image.uniqueId);
    }
};

ctrl.remove = (req, res) => {

};

module.exports = ctrl;