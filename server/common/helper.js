var config = require('../config/environment');
var querystring = require('querystring');
var ffmpeg = require('fluent-ffmpeg');
var request = require('request');
const fs = require('fs');
const path = require('path');

exports.sendTextMessage = function(dialCode, phone, message) {
	return new Promise(function(resolve, reject){
		var url = config.msg91.apiBase;
		var headers = {
			'User-Agent':       'Super Agent/0.0.1',
			'Content-Type':     'application/json'
		}
		var queryParams = {
			sender: config.msg91.sender,
			route: config.msg91.route,
			mobiles: dialCode + phone,
			authkey: config.msg91.authkey,
			country: dialCode,
			message: message
		}
		var options = {
			url: url,
			method: 'GET',
			headers: headers,
			qs: queryParams
		}

		// console.log("phone");
		// console.log(phone);

		// client.messages.create(
		// 	8447227929,
		// 	phone,
		// 	message
		// 	).then(function(message_created) {
		// 		console.log("message_created");
		// 		console.log(message_created);
		// 		resolve(message_created)
		// 	}, function(err){
		// 		console.log("err");
		// 		console.log(err);
		// 		reject(err);
		// 	});
		// });
		if(config.sendTextMessage){
			request(options, function (error, response, body) {
				if (!error && response.statusCode == 200) {
					resolve();
				}else{
					reject(error);
				}
			});
		}else{
			resolve();
		}
	});
};

exports.mkDirByPathSync = function(targetDir, {isRelativeToScript = false} = {}) {
  const sep = path.sep;
  const initDir = path.isAbsolute(targetDir) ? sep : '';
  const baseDir = isRelativeToScript ? __dirname : '.';

  targetDir.split(sep).reduce((parentDir, childDir) => {
    const curDir = path.resolve(baseDir, parentDir, childDir);
    try {
      fs.mkdirSync(curDir);
      console.log(`Directory ${curDir} created!`);
    } catch (err) {
      if (err.code !== 'EEXIST') {
        throw err;
      }

      console.log(`Directory ${curDir} already exists!`);
    }

    return curDir;
  }, initDir);
}

exports.getRandomNuber = function(digits){
	return Math.floor(Math.random()*parseInt('8' + '9'.repeat(digits-1))+parseInt('1' + '0'.repeat(digits-1)));
}

exports.getUploadPath = function(userId){
	var dateObj = new Date();
	var month = dateObj.getUTCMonth() + 1;
	var day = dateObj.getUTCDate();
	var year = dateObj.getUTCFullYear();

	if(userId){
		return year + '/' + month + '/' + day + '/' + userId;
	}else{
		return year + '/' + month + '/' + day;
	}

}

exports.transcodeVideo = function(sourceFilePath, destinationFilePath){
	return new Promise(function(resolve, reject){
		var transcodeCommand = ffmpeg(sourceFilePath)
		transcodeCommand
		.preset(function(command) {
			command
			.format('mp4')
			.addOptions(["-strict", "-2"])
			// .addOptions(["-cpu-used", "5"])
			// .addOptions(["-speed", "8"])

			// .audioCodec('libfaac')
			// .videoCodec('libx264')

			// .videoBitrate('1024k')
			// .videoCodec('mpeg4')
			// .size('720x?')
			// .audioBitrate('128k')
			// .audioChannels(2)
			// .audioCodec('libmp3lame')
			// .outputOptions(['-vtag DIVX']);
		})
		.on('progress', function(progress) {
			if(Math.floor(progress.percent) % 20 === 0){
				console.log('Progress for: ' + sourceFilePath)
				console.log('Processing: ' + progress.percent + '% done')
			}
		})
		.on('start', function(cmd) {
			console.log('Started Transcoding');
			console.log(cmd);
		})
		.on('end', function(res) {
			console.log('Finished Transcoding');
			var videoDataCommand = ffmpeg(destinationFilePath)
			videoDataCommand.ffprobe(function(err, data){
				resolve(data.format);
			})
		})
		.on('error', function(err) {
			console.log('An error occured: ' + err.message);
			console.log(err)
			reject(err.message);
		})
		.save(destinationFilePath);
	})
}

exports.generateThumbnails = function(sourceFilePath, destinationDir, fileName, numberOfTumbnails){
	return new Promise(function(resolve, reject){
		var imageList = [];
		var command = ffmpeg(sourceFilePath)
		command
		.screenshots({
			count: numberOfTumbnails || 6,
			folder: destinationDir,
			filename: fileName + '_%i.png'
		})
		.on('filenames', function(filenames) {
			imageList = filenames;
			// for(var i = 0; i < filenames.length; i++){
			// 	imageList.push(filenames[i])
			// }
		})
		.on('end', function() {
			console.log('Screenshots taken');
			console.log(imageList);
			resolve(imageList)
		})
	})
}