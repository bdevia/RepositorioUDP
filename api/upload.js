const multer = require('multer');
const options = {
    storage: multer.diskStorage({
        destination: './uploads/',
        filename: function (req, file, cb){
            cb(null, file.originalname);
        }
    })
};
app.use(multer(options).single('file'));

const formData = require('express-form-data');
app.use(formData.parse());