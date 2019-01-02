const path = require('path');
const { randomNumer } = require('../helpers/libs');
const fs = require('fs-extra');
const md5 = require('md5');

const { Image, Comment } = require('../models');

const ctrl = {};

ctrl.index = async (req, res) => {
    const viewModel = {image: {}, comments: {}};

    const image = await Image.findOne({filename: {$regex: req.params.image_id}});
    if(image) {
        image.views++;
        viewModel.image = image;
        await image.save();

        const comments = await Comment.find({image_id: image._id});
        viewModel.comments = comments;

        console.log(image);
        res.render('image',  viewModel );
    } else {
        res.redirect('/');
    }
    
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

ctrl.like = async (req, res) => {
    const image = await Image.findOne({filename: {$regex: req.params.image_id}});
    if(image) {
        image.likes++;
        await image.save();
        res.json({likes: image.likes});
    } else {
        res.status(500).json({error: 'Internal Error'});
    }
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
    } else {
        res.redirect('/');
    }
};

ctrl.remove = async (req, res) => {
    const image = await Image.findOne({filename: {$regex: req.params.image_id}});
    if(image) {
        await fs.unlink(path.resolve('./src/public/upload/' + image.filename));
        await Comment.deleteOne({image_id: image._id});
        await image.remove();
        res.json(true);
    }
};

module.exports = ctrl;