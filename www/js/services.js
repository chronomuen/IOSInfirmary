angular.module('PHR-UHS.services', [])

.factory('pInfoFactory', function($http, $cordovaFile) {
  return {
		// Saves the current personal information to the datadirectory, and sets the flag for knowing if it's the user's first time to 'no'
    save: function(pInfo) {
			pInfo = angular.fromJson(pInfo);
			pInfo[0].Content[4].Value = "no";
			pInfo = angular.toJson(pInfo);
			return $cordovaFile.writeFile(cordova.file.dataDirectory, "pinfo.json", pInfo, true).then();
		},
		// Loads the current personal information
		getData: function() {
			return $cordovaFile.readAsText(cordova.file.dataDirectory, "pinfo.json").then(function (success) {
				return angular.fromJson(success);
			});
		},
		// Loads the default data (a file with the fields set to null)
		getDefault: function() {
			return $http.get("data/pinfo.json").then(function(response){
				return response.data;
			});
		},
		// Returns some of the basic information from the list of all personal informations
		// the name, opd number, type of patient, age, and the contact's name and number
		getBasic: function(pInfo) {
			//hard coded based on the json data
			var name = pInfo[1].Content[0];
			var opd = pInfo[0].Content[1];
			var type = pInfo[0].Content[2];
			
			//calculation of the age
			var today = new Date();
			var birthDate = new Date(pInfo[1].Content[1].Value);
			var age = today.getFullYear() - birthDate.getFullYear();
			var m = today.getMonth() - birthDate.getMonth();
			if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
			
			var temp = new Object();
			temp.Label = "Age"
			temp.Value = age;
			
			 var conName = pInfo[2].Content[0];
			 var conNum = pInfo[2].Content[4];
			 
			 var ret = [];
			 ret.push(name);
			 ret.push(opd);
			 ret.push(type);
			 ret.push(temp);
			 ret.push(conName);
			 ret.push(conNum);
			 return ret;
		},
		// Sets the profile picture
		setProfPic: function(path, pInfo) {
			//hard coded based on the json data
			pInfo[0].Content[3].Value = path;
		}
  }
})

.factory('medicalFactory', function($http, $ionicPopup, $cordovaFile, $ionicScrollDelegate) {
	// variable for loading default data
	// not used anymore because default data is blank
  var records = $http.get("data/medical.json").then(function(response){
    return response.data;
  });
  
  return {
		// Saving the current medical records to the datadirectory
		save: function(recs) {
			return $cordovaFile.writeFile(cordova.file.dataDirectory, "medical.json", recs, true).then();
		},
		// Adding a new complaint, with the title, to the medical records
		addRecord: function(recTitle, recs) {
			var entry = {};
			entry.id = recs.length;
			entry.Complaint = recTitle;
			entry.LastModified = new Date().toJSON();
			entry.DateCreated = new Date().toJSON();
			entry.LastDoctor = "";
			entry.Content = [];
			recs.unshift(JSON.parse(angular.toJson(entry)));
		},
		// Adding a new checkup entry to the complaint record
		addUpdate: function(entry, record) {
			//dates are actually recorded with the time (see html for date filtering)
			record.Content.unshift(angular.fromJson(angular.toJson(entry)));
			record.LastModified = entry.Date;
      if(entry.Doctor)
			  record.LastDoctor = entry.Doctor;
		},
		// Adding the source of an image to checkup record, knowing the specific type or category of images
		addLabResult: function(src, record, type) {
			image = {};
			image.src = src;
			image.date = new Date();
			switch(type) {
				case '0': record.Pics.LabOrders.unshift(image); break;
				case '1': record.Pics.LabResults.unshift(image); break;
				case '2': record.Pics.Prescriptions.unshift(image); break;
			}
		},
		addRecording: function(src, record) {
			sound = {};
			sound.src = src;
			sound.date = new Date();
			record.Audios.unshift(sound);
		},
		// Loads the whole medical records
    all: function() {
			return $cordovaFile.readAsText(cordova.file.dataDirectory, "medical.json").then(function (success) {
				return angular.fromJson(success);
			});
    },
		// Loads the default data
		getDefault: function() {
			return records;
		},
		// Gets the list of doctors and nurses from the staff.json file
		getStaff: function() {
			return $http.get("data/staff.json").then(function(response){
				return response.data;
			});
		},
		// Gets the specific checkup from the list of complaints
    get: function(recId, recs) {
      for(var i = 0; i < recs.length; i++) {
        if(recs[i].id === parseInt(recId)) {
          return recs[i];
        }
      }
      return null;
    },
		// For scrolling to the top of the page
		toTop: function() {
			$ionicScrollDelegate.scrollTop();
		},
		// Getting information from all the checkup(udpates), for the model in the form (doc), a specific checkup (id)
		getDocInfo: function(updates, doc, id) {
			var up;
			for(var r = 0; r < updates.Content.length; r++) {
				if(updates.Content[r].Date == id)
					up = updates.Content[r];
			}
			doc.Remarks = up.Remarks;
			doc.Findings = up.Findings;
			doc.Doctor = up.Doctor;
			doc.PRC = up.PRC;
		},
		// Setting information to the checkups(udpates), from the model in the form (doc), a specific checkup (id)
		setDocInfo: function(updates, doc, id) {
			for(var r = 0; r < updates.Content.length; r++) {
				if(updates.Content[r].Date == id) {
					updates.Content[r].Remarks = doc.Remarks;
					updates.Content[r].Findings = doc.Findings;
					updates.Content[r].Doctor = doc.Doctor;
					updates.Content[r].PRC = doc.PRC;
					updates.LastModified = new Date().toJson;
					updates.LastDoctor = doc.Doctor;
				}
			}
		}
  };
})

// Much thanks to Raymond Camden
.factory('ImageService', function($cordovaCamera,$q,$cordovaFile,$ionicPopup,pInfoFactory,medicalFactory) {
	// A function to make unique filenames for the images
  function makeid() {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
 
    for (var i = 0; i < 5; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  };
	
  return {
		// Function that sets the parameters for taking and saving the image, moves it to the datadirectory, then saves the path to wherever appropriate in the checkup
    saveImage: function(record, type) {
			return $q(function(resolve, reject) {
				var options = {
					quality: 100,
					destinationType: Camera.DestinationType.FILE_URI,
					sourceType: Camera.PictureSourceType.CAMERA,
					allowEdit: false,
					cameraDirection: 0,
					encodingType: Camera.EncodingType.JPG,
					popoverOptions: CameraPopoverOptions,
					saveToPhotoAlbum: false,
					correctOrientation: true,
					targetWidth: 720
				};
				
				$cordovaCamera.getPicture(options).then(function(imageUrl) {
					var name = imageUrl.substr(imageUrl.lastIndexOf('/') + 1);
					var namePath = imageUrl.substr(0, imageUrl.lastIndexOf('/') + 1);
					var newName = makeid() + name;
					
					$cordovaFile.moveFile(namePath, name, cordova.file.dataDirectory, newName)
						.then(function(info) {
							medicalFactory.addLabResult(cordova.file.dataDirectory+newName, record, type);
							resolve();
						}, function(e) {
							reject();
						});
				});
			});
		},
		// Function that sets the parameters for taking and saving the image, moves it to the datadirectory, then saves the path as the profile picture path
		newProfPic: function(pInfo) {
			return $q(function(resolve, reject) {
				var options = {
					quality: 100,
					destinationType: Camera.DestinationType.FILE_URI,
					sourceType: Camera.PictureSourceType.CAMERA,
					allowEdit: false,
					cameraDirection: 0,
					encodingType: Camera.EncodingType.JPG,
					popoverOptions: CameraPopoverOptions,
					saveToPhotoAlbum: false,
					correctOrientation: true,
					targetWidth: 720
				};
				
				$cordovaCamera.getPicture(options).then(function(imageUrl) {
					var name = imageUrl.substr(imageUrl.lastIndexOf('/') + 1);
					var namePath = imageUrl.substr(0, imageUrl.lastIndexOf('/') + 1);
					var newName = makeid() + name;
					
					if(pInfo[0].Content[3].Value) {
						var oldname = imageUrl.substr(pInfo[0].Content[3].Value.lastIndexOf('/') + 1);
						$cordovaFile.removeFile(cordova.file.dataDirectory, oldname).then();
					}
					$cordovaFile.moveFile(namePath, name, cordova.file.dataDirectory, newName)
						.then(function(info) {
							pInfoFactory.setProfPic(cordova.file.dataDirectory+newName, pInfo)
							resolve();
						}, function(e) {
							reject();
						});
				});
			});
		}
  }
})


.factory('SoundService', function($cordovaMedia, $cordovaDevice,$cordovaCapture, $cordovaFile, medicalFactory) {
	// For playing the Sound effects
	var media;
	var blop = "audio/blop.mp3";
	var created = "audio/created.mp3";
	var running = false;
	// fixes the media URL for android
	function getMediaURL(s) {
			if($cordovaDevice.getPlatform().toLowerCase() === "android") return "/android_asset/www/" + s;
			return s;
	}
	// wraps cordova's newMedia function
	function preloadMedia(src, foo) {
		if(foo == 0) media = $cordovaMedia.newMedia(getMediaURL(src));
		else {
			if($cordovaDevice.getPlatform().toLowerCase() === "ios") {
				src = "../Library/NoCloud/" + src.split("/").pop();
			}
			media = $cordovaMedia.newMedia(src);
		}
	}
	// the main function that plays the sound effects
	function playMedia(){
		var iOSPlayOptions = {
			numberOfLoops: 1,
			playAudioWhenScreenIsLocked : false
		}
		if($cordovaDevice.getPlatform().toLowerCase() === "android") media.play();
		else if($cordovaDevice.getPlatform().toLowerCase() === "ios") media.play(iOSPlayOptions);
	}
	//
	
	// A function to make unique filenames for the recordings
  function makeid() {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
 
    for (var i = 0; i < 5; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  };
	// the function to record the audio
	function captureAudio(checkup, records) {
    var options = {limit: 1, duration: 300};
    $cordovaCapture.captureAudio(options).then(function(audioData) {
			var name = audioData[0].name;
			var namePath = audioData[0].localURL.substr(0, audioData[0].localURL.lastIndexOf('/') + 1);
			var newName = makeid() + name;
			
			$cordovaFile.moveFile(namePath, name, cordova.file.dataDirectory, newName)
				.then(function() {
					medicalFactory.addRecording(cordova.file.dataDirectory+newName, checkup);
					medicalFactory.save(angular.toJson(records)).then();
					resolve();
				}, function(e) {
					reject();
				});
    });
  }
	
	return {
		// The sound effect to be played on button clicks
		playBlop: function() {
			preloadMedia(blop, 0);
			playMedia(blop);
		},
		// The sound effect to be played whenever new info is created or saved
		playCreated: function() {
			preloadMedia(created, 0);
			playMedia(created);
		},
		record: function(checkup, records) {
			captureAudio(checkup, records);
		},
		play: function(src) {
			media.stop();
			preloadMedia(src, 1);
			playMedia(media);
		},
		stop: function() {
			media.stop();
		}
	}
});