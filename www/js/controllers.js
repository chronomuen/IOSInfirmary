angular.module('PHR-UHS.controllers', ['ngCordova'])

.controller('medicalCtrl', function($scope,$location,$timeout,$ionicPopup,$ionicPlatform,$ionicModal,$cordovaSplashscreen,$timeout,
																		pInfoFactory,medicalFactory,ImageService,SoundService,ionicMaterialInk,ionicMaterialMotion) {
	
	$timeout(function() {
		// Load the data on starting the application
    var medRec = medicalFactory.all(); 
		var pInfo = pInfoFactory.getData();
		
		$ionicPlatform.ready(function() {
			// Load the contents of the medical records, and set it to the scope
			// if there is no file beforehand, set it to a blank array
			medRec.then(function(response) {
				$scope.medRec = response;
			}, function(res) {
				$scope.medRec = [];
			});
			
			// Load the contents of the personal information data, and set it to the scope with a separate model to contain only a bit of information
			// if there is no file beforehand, get the default data in which all are set to null, then go to the tutorials
			pInfo.then(function(res) {
				$scope.pInfo = res;
				$scope.basic = pInfoFactory.getBasic($scope.pInfo);
			}, function(res) {
				// if there is no data
				pInfoFactory.getDefault().then(function(response) {
					$scope.pInfo = response;
					$scope.basic = pInfoFactory.getBasic($scope.pInfo);
				});
				// show tutorial and edits
				$ionicModal.fromTemplateUrl('templates/tutorial.html', {
					scope: $scope,
					backdropClickToClose: false,
					hardwareBackButtonClose: false
				}).then(function(modal) {
					$scope.modal = modal;
					$scope.modal.show();
					ionicMaterialInk.displayEffect();
				});
			});
		});
		
		// Hide the splashscreen
		$cordovaSplashscreen.hide();	
	}, 1000);
  
	// Function to redirect to show the personal information page
	$scope.showInfo = function() {
		SoundService.playBlop();
		$location.path('/app/personalinfo');
	}
	
	// Function to capture the first picture, and proceed to the initial editing of personal information
	// The tutorial's workflow logic
	$scope.firstPic = function() {
		// take the picture
		ImageService.newProfPic($scope.pInfo).then();
		$scope.modal.hide();
		$scope.modal.remove();
		
		// show edit personal info page, without allowing the user to go back (since inital inputting)
		$ionicModal.fromTemplateUrl('templates/personalinfo-edit.html', {
			scope: $scope,
			backdropClickToClose: false,
			hardwareBackButtonClose: false
		}).then(function(modal) {
			$scope.modal = modal;
			$scope.form = $scope.pInfo;
			$scope.dont = false;
			$scope.modal.show();
			ionicMaterialInk.displayEffect();
		});
		ionicMaterialInk.displayEffect();
	}
	
	// Function to save changes of the personal information from the main page
	$scope.saveChanges = function(form) {
		$ionicPlatform.ready(function() {
			pInfoFactory.save(angular.toJson($scope.pInfo)).then();
		});
		$scope.basic = pInfoFactory.getBasic($scope.pInfo);
		$scope.modal.hide();
		$scope.modal.remove();
		SoundService.playCreated();
	}
	
	// Function to change the profile picture of the user
	$scope.takePic = function() {
		SoundService.playBlop();
		$ionicPopup.show({
			title: "Replace Picture?",
            cssClass: "wider-popup",
			buttons: [
				{
					text: 'Cancel',
					type: 'button-default button-raised',
				},{
				text: 'Replace',
				type: 'button-positive button-raised',
				onTap: function() {
					ImageService.newProfPic($scope.pInfo).then(function() {
						$ionicPlatform.ready(function() {
							pInfoFactory.save(angular.toJson($scope.pInfo)).then();
						});
						SoundService.playCreated();
					});
				}
			}]
		});
		ionicMaterialInk.displayEffect();
	}
	
  // Function to add a complaint
	// redirects to the modal for adding the checkup afterwards
  $scope.addRecord = function() {
    $scope.entry = {};
		SoundService.playBlop();
    var addPopup = $ionicPopup.show({
      title: "Enter the title of new entry",
      template: "<textarea ng-model='entry.Complaint' rows='10' style='height: auto;'></textarea>",
			scope: $scope,
            cssClass: "taller-popup wider-popup",
			buttons: [{
				text: 'Cancel',
				type: 'button-default button-raised',
			}, {
				text: 'OK',
				type: 'button-positive button-raised',
				onTap: function(e) {
					if ($scope.entry.Complaint) {
						medicalFactory.addRecord($scope.entry.Complaint, $scope.medRec);
						$ionicPlatform.ready(function() {
							medicalFactory.save(angular.toJson($scope.medRec)).then(function() {
								SoundService.playCreated();
								$location.path('/app/medical/' + $scope.medRec[0].id);
							});
						});
					} else {
						e.preventDefault();
					}
				}
			}]
		});
  }
	
	// Function to show the tutorials
  $scope.showTutorial = function() {
		SoundService.playBlop();
		$ionicModal.fromTemplateUrl('templates/tutorial.html', {
			scope: $scope
		}).then(function(modal) {
			$scope.tutorialModal = modal;
			$scope.tutorialModal.show();
		});
  };
	// Function to hide the tutorials (not allowed if initial run)
  $scope.hideTutorial = function() {
		SoundService.playBlop();
    $scope.tutorialModal.hide();
    $scope.tutorialModal.remove();
  };
	
	// Function to scroll the complaints to the top of the page when the user can no longer see the first one
	$scope.gotoTop = function() {
		SoundService.playBlop();
		medicalFactory.toTop();
	}
	
	// for aesthetics and animations
	ionicMaterialInk.displayEffect();
})

.controller('pInfoCtrl', function($scope,$ionicModal,$ionicPlatform,$timeout,$location,pInfoFactory,ionicMaterialInk,ionicMaterialMotion,SoundService) {
  $scope.pInfo = {};
  $scope.form = {};
	
  var pInfo = pInfoFactory.getData();
	
	// Load the data to the scope
	$ionicPlatform.ready(function() {
		pInfo.then(function(res) {
			$scope.pInfo = res;
			$scope.basic = pInfoFactory.getBasic($scope.pInfo);
			ionicMaterialMotion.ripple();
		}, function(res) {
			// if there is no data, load the file with the fields set to null
			pInfoFactory.getDefault().then(function(response) {
				$scope.pInfo = response;
				$scope.basic = pInfoFactory.getBasic($scope.pInfo);
			});
		});
	});
            
  // Functions for the edit modal:
	// to load the edit modal
	$ionicModal.fromTemplateUrl('templates/personalinfo-edit.html', {
		 scope: $scope
		 }).then(function(modal) {
		 $scope.modal = modal;
	});
	// to show the edit modal, setting the form with the current data
  $scope.showModal = function() {
		SoundService.playBlop();
		$scope.form = angular.fromJson(angular.toJson($scope.pInfo));
    $scope.modal.show();
		ionicMaterialInk.displayEffect();
  };
	// to hide the edit modal
  $scope.hideModal = function() {
		SoundService.playBlop();
    $scope.modal.hide();
  };
	// to save the changes of the form
  $scope.saveChanges = function(form) {
		$scope.pInfo = angular.fromJson(angular.toJson(form));
		$ionicPlatform.ready(function() {
			pInfoFactory.save(angular.toJson($scope.pInfo)).then();
		});
		$scope.basic = pInfoFactory.getBasic($scope.pInfo);
		$scope.modal.hide();
		$scope.modal.remove();
		SoundService.playCreated();
		$location.path('/app/medical');
  }
	
	// for aesthetics and animations
	$timeout(function(){
    ionicMaterialInk.displayEffect();
    ionicMaterialMotion.fadeSlideInRight();
  },500);
})

.controller('medRecCtrl', function($scope,$location,$stateParams,$ionicModal,$ionicBackdrop,$ionicPlatform,$ionicPopup,$ionicSlideBoxDelegate,$ionicScrollDelegate,
																		medicalFactory,ImageService,SoundService,ionicMaterialInk,ionicMaterialMotion) {
  var medRec = medicalFactory.all(); 
	
	// Loading the data
	$ionicPlatform.ready(function() {
		SoundService.playBlop();
		// from all the medical records
		medRec.then(function(response) {
			$scope.medRec = response;
			// get the record ID or the complaint ID
			// for the purpose of knowing which complaint was chosen
			$scope.recordId = $stateParams.recordId;
			$scope.rec = medicalFactory.get($scope.recordId,response);
			
			// get the update ID or the checkup ID
			// for the purpose of knowing which checkup was chosen
			if($stateParams.updateId) {
				for(var r = 0; r < $scope.rec.Content.length; r++) {
					if($scope.rec.Content[r].Date == $stateParams.updateId)
						$scope.recup = $scope.rec.Content[r];
				}
			}
			
			// if the current complaint has no checkup, proceed to adding a checkup
			if($scope.rec.Content.length == 0) $scope.showUpdate();
			
			// get the type of the picture
			// to know the category of the pictures we should deal with (lab orders, lab results, or prescriptions)
			$scope.picType = $stateParams.picsType;
		});
	});
	
	// an array to correctly show the title of the picture category
	$scope.picsTitle = ["Lab Orders","Lab Results","Prescriptions"];
	
	// Function to redirect to the personal info page
	$scope.showInfo = function() {
		SoundService.playBlop();
		$location.path('/app/personalinfo');
	};
	
  // Functions for the modal to add a checkup:
	// to load the modal and prepare the form for the staff select input
  $ionicModal.fromTemplateUrl('templates/record-update.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.updateModal = modal;
		medicalFactory.getStaff().then(function(response) {
			$scope.doctors = response.Doctors;
			$scope.nurses = response.Nurses;
		});
  });
	// to show the modal with the entries set initially to blank
  $scope.showUpdate = function() {
		SoundService.playBlop();
    $scope.entry = {};
    $scope.updateModal.show();
		ionicMaterialInk.displayEffect();
  };
	// to hide the modal
	// also to destroy the modal so that the form would be set to blank once more
  $scope.hideUpdate = function() {
		SoundService.playBlop();
    $scope.updateModal.hide();
    $scope.updateModal.remove();
		$ionicModal.fromTemplateUrl('templates/record-update.html', {
			scope: $scope
		}).then(function(modal) {
			$scope.updateModal = modal;
			medicalFactory.getStaff().then(function(response) {
				$scope.doctors = response.Doctors;
				$scope.nurses = response.Nurses;
			});
		});
  };
	
  // Function to add and save the new checkup entry from the modal
	// it adds the necessary fields for other data aside from the ones present at the modal
  $scope.updateEntry = function(entry) {
		entry.Date = new Date().toJSON();
		entry.Pics = {};
		entry.Pics.LabOrders = [];
		entry.Pics.LabResults = [];
		entry.Pics.Prescriptions = [];
		entry.Audios = [];
		
		medicalFactory.addUpdate(entry,$scope.rec);
		SoundService.playCreated();
		$ionicPlatform.ready(function() {
			medicalFactory.save(angular.toJson($scope.medRec)).then();
		});
		$scope.hideUpdate();
  };
	
	// Functions for the doctor's update modal:
	// to load and show the modal
	$scope.showDocUpdate = function(updateId) {
		$scope.updateId = updateId;
		$scope.doc = {};
		medicalFactory.getDocInfo($scope.rec, $scope.doc, updateId);
		
		$ionicModal.fromTemplateUrl('templates/doc-update.html', {
			scope: $scope
		}).then(function(modal) {
			$scope.docModal = modal;
			SoundService.playBlop();
			$scope.docModal.show();
		});
	}
	// to hide the modal
	$scope.hideDocUpdate = function() {
		SoundService.playBlop();
		$scope.docModal.hide();
		$scope.docModal.remove();
	}
	
	// Function to do save the doctor's update from the modal
	// this was done since these fields are no longer required to be filled up in adding a checkup
	$scope.doDocUpdate = function(entry) {
		medicalFactory.setDocInfo($scope.rec, entry, $scope.updateId);
		SoundService.playCreated();
		$ionicPlatform.ready(function() {
			medicalFactory.save(angular.toJson($scope.medRec)).then();
		});
		$scope.hideDocUpdate();
	}
	
	// Functions for the tutorial modal:
	// to load and show the modal
	$scope.showTutorial = function() {
		SoundService.playBlop();
		$ionicModal.fromTemplateUrl('templates/tutorial.html', {
			scope: $scope
		}).then(function(modal) {
			$scope.tutorialModal = modal;
			$scope.tutorialModal.show();
		});
  };
	// to hide the modal
  $scope.hideTutorial = function() {
		SoundService.playBlop();
    $scope.tutorialModal.hide();
		$scope.tutorialModal.remove();
  };
	
	// Function to scroll the checkups to the top of the page when the user can no longer see the first one
	$scope.gotoTop = function() {
		SoundService.playBlop();
		medicalFactory.toTop();
	}
	
	// Function to redirect to the specific picture category
  $scope.showPics = function(updateId, type) {
		$location.path('/app/medical/pics/' + $scope.recordId + '/' + updateId + '/' + type);
	};
	
	// Functions for the Lab Pictures:
	// to add a picture
  $scope.addPic = function() {
    ImageService.saveImage($scope.recup, $scope.picType).then(function() {
			$ionicPlatform.ready(function() {
				SoundService.playCreated();
				medicalFactory.save(angular.toJson($scope.medRec)).then();
			});
    });
  }
	// the variable to show how much the modal has zoomed in
	$scope.zoomMin = 1;
	// to show the proper image in the slidebox
	$scope.showImages = function(index) {
		$scope.activeSlide = index;
		$scope.showModal('templates/image-popover.html');
	}
	// to show the slidebox
	$scope.showModal = function(templateUrl) {
		SoundService.playBlop();
		$ionicModal.fromTemplateUrl(templateUrl, {
			scope: $scope,
			animation: 'slide-in-up'
		}).then(function(modal) {
			$scope.modal = modal;
			$scope.modal.show();
		});
	}
	// to close the slidebox
	$scope.closeModal = function() {
		SoundService.playBlop();
		$scope.modal.hide();
		$scope.modal.remove()
	};
	// to zoom-in and zoom-out of the picture
	$scope.updateSlideStatus = function(slide) {
		var zoomFactor = $ionicScrollDelegate.$getByHandle('scrollHandle' + slide).getScrollPosition().zoom;
		if (zoomFactor == $scope.zoomMin) {
			$ionicSlideBoxDelegate.enableSlide(true);
		} else {
			$ionicSlideBoxDelegate.enableSlide(false);
		}
	};
	
	// Function to redirect to the audio recordings page
	$scope.showAudios = function(updateId) {
		$location.path('/app/medical/audio/' + $scope.recordId + '/' + updateId);
	};
	// Functions for the audio recordings:
	$scope.addRecording = function() {
        $scope.selectedIndex = -1;
		SoundService.record($scope.recup, $scope.medRec);
	}
	$scope.playRecording = function(index) {
        $scope.selectedIndex = index;
		SoundService.play($scope.recup.Audios[index].src);
	}
	$scope.stopRecording = function() {
        $scope.selectedIndex = -1;
		SoundService.stop();
	}
});