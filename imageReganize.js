const path = require('path');
var tesseract = require('node-tesseract');
var exec = require('child_process').exec; 
var fs = require('fs');

let imageFile = './ImageRecognize/pic/get_random_image.png';
let img = path.join(__dirname,imageFile);

exec('python ImageRecognize/tess_test.py '+img, function(err, stdout, stderr) {
    if(err) {
        console.log('image recognize error:', err);
    }else {
        console.log(stdout);
        fs.readFile('temp.txt', (err, data) => {
            if (err) {
                console.log('read file error:', err);
            }else {
                let str = data.toString();
                console.log(str);
                str = str.replace(/\n/g,'').replace(/>/g,'7').replace(/-/g,'L').replace('<','L');
                console.log(str);
            }
        })
    }
})