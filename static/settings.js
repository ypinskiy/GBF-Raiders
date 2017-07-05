function AddSelectedRaid( room ) {
	if ( settings.layout.orientation === "horizontal" ) {
		if ( document.getElementById( room ) === null ) {
			if ( document.getElementById( "selected-raids" ).innerHTML === "No raids selected. Please search for a raid in the search bar above." ) {
				document.getElementById( "selected-raids" ).innerHTML = "";
			}
			selectedRaidsArray.push( room );
			var raid = FindRaidConfig( room );
			var selectedLabel = document.createElement( "div" );
			selectedLabel.classList.add( "ui", "big", "label", "image", "selected-raids-label" );
			selectedLabel.id = room;
			selectedLabel.innerHTML = '<img src="' + raid.image + '">' + raid.english + '<i class="delete icon"></i>';
			document.getElementById( "selected-raids" ).appendChild( selectedLabel );
			selectedLabel.addEventListener( "click", function ( event ) {
				RemoveSelectedRaid( room );
			}, false );
			socket.emit( 'subscribe', {
				room: room
			} );
			localStorage.setItem( "selectedRaids", JSON.stringify( selectedRaidsArray ) );
		}
	} else {
		if ( document.getElementById( room + "-card" ) === null ) {
			selectedRaidsArray.push( room );
			individualSettings.push( {
				room: room,
				settings: Object.assign( {}, settings.notification )
			} );
			var raid = FindRaidConfig( room );
			if ( settings.layout.infoLevel === "compact" ) {
				AddSelectedVerticalCompactRaid( raid );
			} else if ( settings.layout.infoLevel === "normal" ) {
				AddSelectedVerticalNormalRaid( raid );
			} else {
				AddSelectedVerticalFullRaid( raid );
			}
			socket.emit( 'subscribe', {
				room: room
			} );
			localStorage.setItem( "selectedRaids", JSON.stringify( selectedRaidsArray ) );
		}
	}
}

function AddSelectedVerticalCompactRaid( raid ) {
	var raidDiv = document.createElement( "div" );
	raidDiv.id = raid.room + "-card";
	raidDiv.classList.add( "ui", "card" );
	var raidImage = document.createElement( "div" );
	raidImage.classList.add( "image" );
	raidImage.innerHTML += '<img src="' + raid.image + '">';
	raidDiv.appendChild( raidImage );
	var raidContent = document.createElement( "div" );
	raidContent.classList.add( "content" );
	var raidEnglish = document.createElement( "div" );
	raidEnglish.classList.add( "header" );
	raidEnglish.innerHTML = raid.english;
	raidContent.appendChild( raidEnglish );
	var raidJapanese = document.createElement( "div" );
	raidJapanese.classList.add( "meta" );
	raidJapanese.innerHTML = raid.japanese;
	raidContent.appendChild( raidJapanese );
	var raidSettings = document.createElement( "div" );
	raidSettings.classList.add( "description" );
	var removeButton = document.createElement( "button" );
	removeButton.classList.add( "ui", "tiny", "negative", "button", "right", "labeled", "icon" );
	removeButton.id = raid.room + '-remover';
	removeButton.innerHTML = 'Remove Raid<i class="right remove icon"></i>';
	var settingsButton = document.createElement( "button" );
	settingsButton.classList.add( "ui", "tiny", "primary", "button", "right", "labeled", "icon" );
	settingsButton.id = raid.room + '-settings';
	settingsButton.innerHTML = 'Settings<i class="right settings icon"></i>';
	raidSettings.appendChild( settingsButton );
	raidSettings.appendChild( removeButton );
	raidContent.appendChild( raidSettings );
	raidDiv.appendChild( raidContent );
	var raidTableContainer = document.createElement( "div" );
	raidTableContainer.classList.add( "extra", "content" );
	var raidTable = document.createElement( "table" );
	raidTable.classList.add( "ui", "blue", "celled", "selectable", "table", "compact", "smaller" );
	raidTable.id = raid.room + "-table";
	raidTable.innerHTML = '<thead><tr><th class="center aligned single line">Raid ID</th><th class="center aligned single line">Join Raid</th></tr></thead>';
	var raidTableBody = document.createElement( "tbody" );
	raidTableBody.id = raid.room + "-table-body";
	raidTable.appendChild( raidTableBody );
	raidTableContainer.appendChild( raidTable );
	raidDiv.appendChild( raidTableContainer );
	document.getElementById( "raid-container" ).appendChild( raidDiv );
	document.getElementById( raid.room + '-remover' ).addEventListener( "click", function ( event ) {
		RemoveSelectedRaid( raid.room );
	}, false );
	document.getElementById( raid.room + '-settings' ).addEventListener( "click", function ( event ) {
		SetupSettingsModal( raid );
	}, false );
}

function AddSelectedVerticalNormalRaid( raid ) {
	var raidDiv = document.createElement( "div" );
	raidDiv.id = raid.room + "-card";
	raidDiv.classList.add( "ui", "card" );
	var raidImage = document.createElement( "div" );
	raidImage.classList.add( "image" );
	raidImage.innerHTML += '<img src="' + raid.image + '">';
	raidDiv.appendChild( raidImage );
	var raidContent = document.createElement( "div" );
	raidContent.classList.add( "content" );
	var raidEnglish = document.createElement( "div" );
	raidEnglish.classList.add( "header" );
	raidEnglish.innerHTML = raid.english;
	raidContent.appendChild( raidEnglish );
	var raidJapanese = document.createElement( "div" );
	raidJapanese.classList.add( "meta" );
	raidJapanese.innerHTML = raid.japanese;
	raidContent.appendChild( raidJapanese );
	var raidSettings = document.createElement( "div" );
	raidSettings.classList.add( "description" );
	var removeButton = document.createElement( "button" );
	removeButton.classList.add( "ui", "tiny", "negative", "button", "right", "labeled", "icon" );
	removeButton.id = raid.room + '-remover';
	removeButton.innerHTML = 'Remove Raid<i class="right remove icon"></i>';
	var settingsButton = document.createElement( "button" );
	settingsButton.classList.add( "ui", "tiny", "primary", "button", "right", "labeled", "icon" );
	settingsButton.id = raid.room + '-settings';
	settingsButton.innerHTML = 'Settings<i class="right settings icon"></i>';
	raidSettings.appendChild( settingsButton );
	raidSettings.appendChild( removeButton );
	raidContent.appendChild( raidSettings );
	raidDiv.appendChild( raidContent );
	var raidTableContainer = document.createElement( "div" );
	raidTableContainer.classList.add( "extra", "content" );
	var raidTable = document.createElement( "table" );
	raidTable.classList.add( "ui", "blue", "celled", "selectable", "table", "compact", "smaller" );
	raidTable.id = raid.room + "-table";
	raidTable.innerHTML = '<thead><tr><th class="center aligned single line">Raid ID</th><th class="center aligned single line">Time Tweeted</th><th class="center aligned single line">Join Raid</th></tr></thead>';
	var raidTableBody = document.createElement( "tbody" );
	raidTableBody.id = raid.room + "-table-body";
	raidTable.appendChild( raidTableBody );
	raidTableContainer.appendChild( raidTable );
	raidDiv.appendChild( raidTableContainer );
	document.getElementById( "raid-container" ).appendChild( raidDiv );
	document.getElementById( raid.room + '-remover' ).addEventListener( "click", function ( event ) {
		RemoveSelectedRaid( raid.room );
	}, false );
	document.getElementById( raid.room + '-settings' ).addEventListener( "click", function ( event ) {
		SetupSettingsModal( raid );
	}, false );
}

function AddSelectedVerticalFullRaid( raid ) {
	var raidDiv = document.createElement( "div" );
	raidDiv.id = raid.room + "-card";
	raidDiv.classList.add( "ui", "ultra", "card" );
	var raidImage = document.createElement( "div" );
	raidImage.classList.add( "image" );
	raidImage.innerHTML += '<img src="' + raid.image + '">';
	raidDiv.appendChild( raidImage );
	var raidContent = document.createElement( "div" );
	raidContent.classList.add( "content" );
	var raidEnglish = document.createElement( "div" );
	raidEnglish.classList.add( "header" );
	raidEnglish.innerHTML = raid.english;
	raidContent.appendChild( raidEnglish );
	var raidJapanese = document.createElement( "div" );
	raidJapanese.classList.add( "meta" );
	raidJapanese.innerHTML = raid.japanese;
	raidContent.appendChild( raidJapanese );
	var raidSettings = document.createElement( "div" );
	raidSettings.classList.add( "description" );
	var removeButton = document.createElement( "button" );
	removeButton.classList.add( "ui", "tiny", "negative", "button", "right", "labeled", "icon" );
	removeButton.id = raid.room + '-remover';
	removeButton.innerHTML = 'Remove Raid<i class="right remove icon"></i>';
	var settingsButton = document.createElement( "button" );
	settingsButton.classList.add( "ui", "tiny", "primary", "button", "right", "labeled", "icon" );
	settingsButton.id = raid.room + '-settings';
	settingsButton.innerHTML = 'Settings<i class="right settings icon"></i>';
	raidSettings.appendChild( settingsButton );
	raidSettings.appendChild( removeButton );
	raidContent.appendChild( raidSettings );
	raidDiv.appendChild( raidContent );
	var raidTableContainer = document.createElement( "div" );
	raidTableContainer.classList.add( "extra", "content" );
	var raidTable = document.createElement( "table" );
	raidTable.classList.add( "ui", "blue", "celled", "selectable", "table", "compact", "smaller" );
	raidTable.id = raid.room + "-table";
	raidTable.innerHTML = '<thead><tr><th class="center aligned single line">ID</th><th class="center aligned">Message</th><th class="center aligned single line">Time Tweeted</th><th class="center aligned single line">Join Raid</th></tr></thead>';
	var raidTableBody = document.createElement( "tbody" );
	raidTableBody.id = raid.room + "-table-body";
	raidTable.appendChild( raidTableBody );
	raidTableContainer.appendChild( raidTable );
	raidDiv.appendChild( raidTableContainer );
	document.getElementById( "raid-container" ).appendChild( raidDiv );
	document.getElementById( raid.room + '-remover' ).addEventListener( "click", function ( event ) {
		RemoveSelectedRaid( raid.room );
	}, false );
	document.getElementById( raid.room + '-settings' ).addEventListener( "click", function ( event ) {
		SetupSettingsModal( raid );
	}, false );
}

function SetupSettingsModal( raid ) {
	document.getElementById( "settings-modal" ).dataset.room = raid.room;
	document.getElementById( "settings-modal-header" ).innerHTML = raid.english;
	document.getElementById( "settings-modal-image" ).src = raid.image;
	for ( var i = 0; i < individualSettings.length; i++ ) {
		if ( raid.room === individualSettings[ i ].room ) {
			if ( individualSettings[ i ].settings.desktopNotifOn ) {
				document.getElementById( "modal-enable-notif" ).innerHTML = 'Disable Desktop Notifications<i class="right remove circle icon"></i>';
				document.getElementById( "modal-enable-notif" ).classList.add( "negative" );
				document.getElementById( "modal-desktop-notif-size-control" ).classList.remove( "input-control-disabled" );
				document.getElementById( "modal-desktop-notif-size-control" ).classList.add( "input-control" );
				document.getElementById( "modal-desktop-notif-size-dropdown" ).classList.remove( "disabled" );
			} else {
				document.getElementById( "modal-enable-notif" ).innerHTML = 'Enable Desktop Notifications<i class="right check circle icon"></i>';
				document.getElementById( "modal-enable-notif" ).classList.remove( "negative" );
				document.getElementById( "modal-desktop-notif-size-control" ).classList.add( "input-control-disabled" );
				document.getElementById( "modal-desktop-notif-size-control" ).classList.remove( "input-control" );
				document.getElementById( "modal-desktop-notif-size-dropdown" ).classList.add( "disabled" );
			}
			if ( individualSettings[ i ].settings.soundNotifOn ) {
				document.getElementById( "modal-enable-sound" ).innerHTML = 'Disable Sound Notifications<i class="right alarm mute outline icon"></i>';
				document.getElementById( "modal-enable-sound" ).classList.add( "negative" );
				document.getElementById( "modal-sound-volume-control" ).classList.remove( "slider-control-disabled" );
				document.getElementById( "modal-sound-volume-control" ).classList.add( "slider-control" );
				document.getElementById( "modal-sound-volume-slider" ).disabled = false;
				document.getElementById( "modal-sound-choice-control" ).classList.remove( "input-control-disabled" );
				document.getElementById( "modal-sound-choice-control" ).classList.add( "input-control" );
				document.getElementById( "modal-sound-choice-dropdown" ).classList.remove( "disabled" );
			} else {
				document.getElementById( "modal-enable-sound" ).innerHTML = 'Enable Sound Notifications<i class="right alarm outline icon"></i>';
				document.getElementById( "modal-enable-sound" ).classList.remove( "negative" );
				document.getElementById( "modal-sound-volume-control" ).classList.add( "slider-control-disabled" );
				document.getElementById( "modal-sound-volume-control" ).classList.remove( "slider-control" );
				document.getElementById( "modal-sound-volume-slider" ).disabled = true;
				document.getElementById( "modal-sound-choice-control" ).classList.add( "input-control-disabled" );
				document.getElementById( "modal-sound-choice-control" ).classList.remove( "input-control" );
				document.getElementById( "modal-sound-choice-dropdown" ).classList.add( "disabled" );
			}
			$( "#modal-desktop-notif-size-dropdown" ).dropdown( 'set selected', individualSettings[ i ].settings.desktopNotifSize );
			$( "#modal-sound-choice-dropdown" ).dropdown( 'set selected', individualSettings[ i ].settings.soundNotifChoice );
			document.getElementById( "modal-sound-volume-slider" ).value = individualSettings[ i ].settings.soundNotifVolume;
			break;
		}
	}
	$( '.ui.modal' )
		.modal( 'setting', 'closable', false )
		.modal( 'show' );
}

function SaveIndividualSettings() {
	for ( var i = 0; i < individualSettings.length; i++ ) {
		if ( document.getElementById( "settings-modal" ).dataset.room === individualSettings[ i ].room ) {
			if ( document.getElementById( "modal-enable-sound" ).innerHTML === 'Disable Sound Notifications<i class="right alarm mute outline icon"></i>' ) {
				individualSettings[ i ].settings.soundNotifOn = true;
			} else {
				individualSettings[ i ].settings.soundNotifOn = false;
			}
			if ( document.getElementById( "modal-enable-notif" ).innerHTML === 'Disable Desktop Notifications<i class="right remove circle icon"></i>' ) {
				individualSettings[ i ].settings.desktopNotifOn = true;
			} else {
				individualSettings[ i ].settings.desktopNotifOn = false;
			}
			individualSettings[ i ].settings.desktopNotifSize = document.getElementById( "modal-desktop-notif-size-input" ).value;
			individualSettings[ i ].settings.soundNotifChoice = document.getElementById( "modal-sound-choice-input" ).value;
			individualSettings[ i ].settings.soundNotifVolume = document.getElementById( "modal-sound-volume-slider" ).value;
			break;
		}
	}
}

function CreateSettingsModalFrame() {
	var result = '<div id="settings-modal" class="ui modal">';
	result += '<div id="settings-modal-header" class="header">Lvl ??? Raid Boss</div>';
	result += '<div class="image content">';
	result += '<img id="settings-modal-image" class="ui medium rounded image" src="http://via.placeholder.com/250x250">';
	result += '<div id="settings-modal-desc" class="description">';
	result += '<button id="modal-enable-notif" class="ui bigger button right labeled icon">Enable Desktop Notifications<i class="right check circle icon"></i></button>';
	result += '<span id="modal-desktop-notif-size-control" class="input-control-disabled"><span class="input-title">Desktop Notification Size</span><div id="modal-desktop-notif-size-dropdown" class="ui disabled compact selection dropdown"><input id="modal-desktop-notif-size-input" type="hidden" name="formatting" value="large"><i class="dropdown icon"></i><div class="default text">Notif Size</div><div class="menu"><div class="item" data-value="small">Small</div><div class="item" data-value="large">Large</div></div></div></span>';
	result += '<button id="modal-enable-sound" class="ui bigger button right labeled icon">Enable Sound Notifications<i class="right alarm outline icon"></i></button>';
	result += '<span id="modal-sound-choice-control" class="input-control-disabled"><span class="input-title">Sound Notification Choice</span><div id="modal-sound-choice-dropdown" class="ui compact selection disabled dropdown"><input id="modal-sound-choice-input" type="hidden" name="formatting" value="beeps"><i class="dropdown icon"></i><div class="default text">Sound Choice</div><div class="menu"><div class="item" data-value="beeps">Beeps Appear</div><div class="item" data-value="lily-event-ringring">GBF - Lily (Event) - Ring Ring</div><div class="item" data-value="andira-oniichan">GBF - Andira - Onii-chan</div><div class="item" data-value="titanfall-droppingnow">Titanfall - Dropping Now</div></div></div></span>';
	result += '<span id="modal-sound-volume-control" class="slider-control-disabled"><span class="slider-title">Sound Notification Volume</span><input id="modal-sound-volume-slider" class="slider-range slider" type="range" min="0" max="100" value="100" disabled></span>';
	result += '</div></div>';
	result += '<div id="settings-modal-actions" class="actions">';
	result += '<div id="settings-modal-save-btn" class="ui large positive button">Save</div>';
	result += '<div id="settings-modal-cancel-btn" class="ui large negative button">Cancel</div>';
	result += '</div></div>';
	return result;
}

function RemoveSelectedRaid( room ) {
	if ( settings.layout.orientation === "horizontal" ) {
		socket.emit( 'unsubscribe', {
			room: room
		} );
		selectedRaidsArray.splice( selectedRaidsArray.indexOf( room ), 1 );
		localStorage.setItem( "selectedRaids", JSON.stringify( selectedRaidsArray ) );
		document.getElementById( room ).remove();
	} else {
		socket.emit( 'unsubscribe', {
			room: room
		} );
		selectedRaidsArray.splice( selectedRaidsArray.indexOf( room ), 1 );
		for ( var i = 0; i < individualSettings.length; i++ ) {
			if ( room === individualSettings[ i ].room ) {
				individualSettings.splice( i, 1 );
				break;
			}
		}
		localStorage.setItem( "selectedRaids", JSON.stringify( selectedRaidsArray ) );
		document.getElementById( room + "-card" ).remove();
		for ( var i = raids.length - 1; i >= 0; i-- ) {
			if ( room === raids[ i ].room ) {
				raids.splice( i, 1 );
			}
		}
	}
}

function LoadSavedSettings() {
	if ( localStorage.getItem( "savedSettings" ) ) {
		var tempSettings = JSON.parse( localStorage.getItem( "savedSettings" ) );
		if ( tempSettings.version === settings.version ) {
			Object.assign( settings, tempSettings );
			if ( settings.notification.desktopNotifOn ) {
				document.getElementById( "enable-notif" ).innerHTML = 'Disable Desktop Notifications<i class="right remove circle icon"></i>';
				document.getElementById( "enable-notif" ).classList.add( "negative" );
				document.getElementById( "desktop-notif-size-control" ).classList.remove( "input-control-disabled" );
				document.getElementById( "desktop-notif-size-control" ).classList.add( "input-control" );
				document.getElementById( "desktop-notif-size-dropdown" ).classList.remove( "disabled" );
			}
			document.getElementById( "desktop-notif-size-input" ).value = settings.notification.desktopNotifSize;
			if ( settings.notification.soundNotifOn ) {
				document.getElementById( "enable-sound" ).innerHTML = 'Disable Sound Notifications<i class="right alarm mute outline icon"></i>';
				document.getElementById( "enable-sound" ).classList.add( "negative" );
				document.getElementById( "sound-volume-control" ).classList.remove( "slider-control-disabled" );
				document.getElementById( "sound-volume-control" ).classList.add( "slider-control" );
				document.getElementById( "sound-volume-slider" ).disabled = false;
				document.getElementById( "sound-choice-control" ).classList.remove( "input-control-disabled" );
				document.getElementById( "sound-choice-control" ).classList.add( "input-control" );
				document.getElementById( "sound-choice-dropdown" ).classList.remove( "disabled" );
			}
			document.getElementById( "sound-volume-slider" ).value = settings.notification.soundNotifVolume;
			document.getElementById( "sound-choice-input" ).value = settings.notification.soundNotifChoice;
			if ( settings.layout.orientation === "vertical" ) {
				document.getElementById( "vertical-layout-btn" ).classList.add( "primary" );
				document.getElementById( "horiz-layout-btn" ).classList.remove( "primary" );
				document.getElementById( "vertical-stacking-control" ).classList.remove( "input-control-disabled" );
				document.getElementById( "vertical-stacking-control" ).classList.add( "input-control" );
				document.getElementById( "vertical-stacking-dropdown" ).classList.remove( "disabled" );
			}
			document.getElementById( "vertical-stacking-input" ).value = settings.layout.verticalStacking;
			document.getElementById( "info-level-input" ).value = settings.layout.infoLevel;
			document.getElementById( "raid-timeout" ).value = settings.layout.raidTimeout;
			document.getElementById( "raid-max-results" ).value = settings.layout.raidMaxResults;
			if ( settings.layout.nightMode ) {
				document.body.classList.add( "darken" );
				document.getElementById( "enable-night" ).classList.add( "negative" );
				document.getElementById( "enable-night" ).innerHTML = 'Disable Night Mode<i class="right sun icon"></i>';
			}
			SetupTable();
		} else {
			localStorage.clear();
			localStorage.setItem( "savedSettings", JSON.stringify( settings ) );
		}
	}
}

function SetupControls() {
	var clipboard = new Clipboard( '.copy-div', {
		text: function ( trigger ) {
			return trigger.dataset.clipboard;
		}
	} );

	document.getElementById( "enable-notif" ).addEventListener( "click", function ( event ) {
		ToggleDesktopNotifications( true );
	} );

	$( "#desktop-notif-size-dropdown" ).dropdown( {
		onChange: function ( value, text, $selectedItem ) {
			settings.notification.desktopNotifSize = value;
			if ( settings.layout.orientation === "vertical" ) {
				for ( var i = 0; i < individualSettings.length; i++ ) {
					individualSettings[ i ].settings.desktopNotifSize = value;
				}
			}
			localStorage.setItem( "savedSettings", JSON.stringify( settings ) );
		}
	} );

	document.getElementById( "enable-sound" ).addEventListener( "click", function ( event ) {
		ToggleSoundNotifications( true )
	} );

	document.getElementById( "sound-volume-slider" ).addEventListener( "input", function ( event ) {
		settings.notification.soundNotifVolume = event.target.value;
		if ( settings.layout.orientation === "vertical" ) {
			for ( var i = 0; i < individualSettings.length; i++ ) {
				individualSettings[ i ].settings.soundNotifVolume = event.target.value;
			}
		}
		localStorage.setItem( "savedSettings", JSON.stringify( settings ) );
	} );

	document.getElementById( "horiz-layout-btn" ).addEventListener( "click", function ( event ) {
		if ( settings.layout.orientation === "vertical" ) {
			settings.layout.orientation = "horizontal";
			localStorage.setItem( "savedSettings", JSON.stringify( settings ) );
			document.getElementById( "horiz-layout-btn" ).classList.add( "primary" );
			document.getElementById( "vertical-layout-btn" ).classList.remove( "primary" );
			document.getElementById( "vertical-stacking-control" ).classList.remove( "input-control" );
			document.getElementById( "vertical-stacking-control" ).classList.add( "input-control-disabled" );
			document.getElementById( "vertical-stacking-dropdown" ).classList.add( "disabled" );
			SetupTable();
			for ( var i = 0; i < selectedRaidsArray.length; i++ ) {
				AddSelectedRaid( selectedRaidsArray[ i ] );
			}
			for ( var i = 0; i < raids.length; i++ ) {
				CreateRaidRow( raids[ i ] );
			}
		}
	} );

	document.getElementById( "vertical-layout-btn" ).addEventListener( "click", function ( event ) {
		if ( settings.layout.orientation === "horizontal" ) {
			settings.layout.orientation = "vertical";
			localStorage.setItem( "savedSettings", JSON.stringify( settings ) );
			document.getElementById( "vertical-layout-btn" ).classList.add( "primary" );
			document.getElementById( "horiz-layout-btn" ).classList.remove( "primary" );
			document.getElementById( "vertical-stacking-control" ).classList.remove( "input-control-disabled" );
			document.getElementById( "vertical-stacking-control" ).classList.add( "input-control" );
			document.getElementById( "vertical-stacking-dropdown" ).classList.remove( "disabled" );
			SetupTable();
			for ( var i = 0; i < selectedRaidsArray.length; i++ ) {
				AddSelectedRaid( selectedRaidsArray[ i ] );
			}
			for ( var i = 0; i < raids.length; i++ ) {
				CreateRaidRow( raids[ i ] );
			}
		}
	} );

	$( "#vertical-stacking-dropdown" ).dropdown( {
		onChange: function ( value, text, $selectedItem ) {
			settings.layout.verticalStacking = value;
			localStorage.setItem( "savedSettings", JSON.stringify( settings ) );
			SetupTable();
			for ( var i = 0; i < selectedRaidsArray.length; i++ ) {
				AddSelectedRaid( selectedRaidsArray[ i ] );
			}
			for ( var i = 0; i < raids.length; i++ ) {
				CreateRaidRow( raids[ i ] );
			}
		}
	} );

	$( "#info-level" ).dropdown( {
		onChange: function ( value, text, $selectedItem ) {
			settings.layout.infoLevel = value;
			localStorage.setItem( "savedSettings", JSON.stringify( settings ) );
			SetupTable();
			for ( var i = 0; i < selectedRaidsArray.length; i++ ) {
				AddSelectedRaid( selectedRaidsArray[ i ] );
			}
			for ( var i = 0; i < raids.length; i++ ) {
				CreateRaidRow( raids[ i ] );
			}
		}
	} );

	$( "#sound-choice-dropdown" ).dropdown( {
		onChange: function ( value, text, $selectedItem ) {
			settings.notification.soundNotifChoice = value;
			if ( settings.layout.orientation === "vertical" ) {
				for ( var i = 0; i < individualSettings.length; i++ ) {
					individualSettings[ i ].settings.soundNotifChoice = value;
				}
			}
			localStorage.setItem( "savedSettings", JSON.stringify( settings ) );
			PlaySoundNotif();
		}
	} );

	document.getElementById( "raid-timeout" ).addEventListener( "input", function ( event ) {
		if ( event.target.value.match( /[a-z]/i ) || parseInt( event.target.value, 10 ) < 1 || parseInt( event.target.value, 10 ) > 300 ) {
			document.getElementById( "raid-timeout" ).parentElement.classList.add( "error" );
		} else {
			document.getElementById( "raid-timeout" ).parentElement.classList.remove( "error" );
			settings.layout.raidTimeout = event.target.value;
			localStorage.setItem( "savedSettings", JSON.stringify( settings ) );
		}
	} );

	document.getElementById( "raid-max-results" ).addEventListener( "input", function ( event ) {
		if ( event.target.value.match( /[a-z]/i ) || parseInt( event.target.value, 10 ) < 1 || parseInt( event.target.value, 10 ) > 50 ) {
			document.getElementById( "raid-max-results" ).parentElement.classList.add( "error" );
		} else {
			document.getElementById( "raid-max-results" ).parentElement.classList.remove( "error" );
			settings.layout.raidMaxResults = event.target.value;
			localStorage.setItem( "savedSettings", JSON.stringify( settings ) );
		}
	} );

	document.getElementById( "enable-night" ).addEventListener( "click", function ( event ) {
		if ( settings.layout.nightMode === false ) {
			settings.layout.nightMode = true;
			document.body.classList.add( "darken" );
			document.getElementById( "enable-night" ).classList.add( "negative" );
			document.getElementById( "enable-night" ).innerHTML = 'Disable Night Mode<i class="right sun icon"></i>';
		} else {
			settings.layout.nightMode = false;
			document.body.classList.remove( "darken" );
			document.getElementById( "enable-night" ).classList.remove( "negative" );
			document.getElementById( "enable-night" ).innerHTML = 'Enable Night Mode<i class="right moon icon"></i>';
		}
		localStorage.setItem( "savedSettings", JSON.stringify( settings ) );
	} );

	document.getElementById( "clear-list" ).addEventListener( "click", function ( event ) {
		raids = [];
		for ( var i = document.getElementById( "table-body" ).childNodes.length - 1; i >= 0; i-- ) {
			document.getElementById( "table-body" ).removeChild( document.getElementById( "table-body" ).childNodes[ i ] );
		}
	} );

	$( '.message .close' ).on( 'click', function () {
		$( this )
			.closest( '.message' )
			.transition( 'fade' );
	} );

	$( '.help' )
		.popup( {
			inline: true,
			position: "bottom left",
			perserve: true,
			setFluidWidth: false,
			lastResort: "bottom left",
			hoverable: true,
			jitter: 50
		} );

	$( '.ui.search' )
		.search( {
			source: raidConfigs,
			searchFields: [
				'english',
				'japanese'
			],
			searchFullText: true,
			fields: {
				title: 'english',
			},
			maxResults: 10,
			onSelect: function ( result, response ) {
				AddSelectedRaid( result.room );
				setTimeout( function () {
					document.getElementById( "searcher" ).value = "";
				}, 50 );
			},
			showNoResults: true
		} );

	$( '.tabular.menu .item' ).tab();
}

function ToggleDesktopNotifications( clicked ) {
	if ( settings.notification.desktopNotifOn === false ) {
		if ( Notification.permission !== "denied" ) {
			Notification.requestPermission( function ( permission ) {
				if ( permission === "granted" ) {
					if ( clicked ) {
						var notification = new Notification( "Thank you for enabling notifications!", {
							body: "Click on notifications to copy the ID!",
							icon: "/assets/stickers/heregoes-sticker.png"
						} );
					}
					settings.notification.desktopNotifOn = true;
					if ( settings.layout.orientation === "vertical" ) {
						for ( var i = 0; i < individualSettings.length; i++ ) {
							individualSettings[ i ].settings.desktopNotifOn = true;
						}
					}
					document.getElementById( "enable-notif" ).innerHTML = 'Disable Desktop Notifications<i class="right remove circle icon"></i>';
					document.getElementById( "enable-notif" ).classList.add( "negative" );
					document.getElementById( "desktop-notif-size-control" ).classList.remove( "input-control-disabled" );
					document.getElementById( "desktop-notif-size-control" ).classList.add( "input-control" );
					document.getElementById( "desktop-notif-size-dropdown" ).classList.remove( "disabled" );
					localStorage.setItem( "savedSettings", JSON.stringify( settings ) );
				}
			} );
		}
	} else {
		settings.notification.desktopNotifOn = false;
		if ( settings.layout.orientation === "vertical" ) {
			for ( var i = 0; i < individualSettings.length; i++ ) {
				individualSettings[ i ].settings.desktopNotifOn = false;
			}
		}
		document.getElementById( "enable-notif" ).innerHTML = 'Enable Desktop Notifications<i class="right check circle icon"></i>';
		document.getElementById( "enable-notif" ).classList.remove( "negative" );
		document.getElementById( "desktop-notif-size-control" ).classList.remove( "input-control" );
		document.getElementById( "desktop-notif-size-control" ).classList.add( "input-control-disabled" );
		document.getElementById( "desktop-notif-size-dropdown" ).classList.add( "disabled" );
		localStorage.setItem( "savedSettings", JSON.stringify( settings ) );
	}
}

function ToggleSoundNotifications( clicked ) {
	if ( settings.notification.soundNotifOn === false ) {
		settings.notification.soundNotifOn = true;
		if ( settings.layout.orientation === "vertical" ) {
			for ( var i = 0; i < individualSettings.length; i++ ) {
				individualSettings[ i ].settings.soundNotifOn = true;
			}
		}
		document.getElementById( "enable-sound" ).innerHTML = 'Disable Sound Notifications<i class="right alarm mute outline icon"></i>';
		document.getElementById( "enable-sound" ).classList.add( "negative" );
		document.getElementById( "sound-volume-control" ).classList.remove( "slider-control-disabled" );
		document.getElementById( "sound-volume-control" ).classList.add( "slider-control" );
		document.getElementById( "sound-volume-slider" ).disabled = false;
		document.getElementById( "sound-choice-control" ).classList.remove( "input-control-disabled" );
		document.getElementById( "sound-choice-control" ).classList.add( "input-control" );
		document.getElementById( "sound-choice-dropdown" ).classList.remove( "disabled" );
		localStorage.setItem( "savedSettings", JSON.stringify( settings ) );
		if ( clicked ) {
			PlaySoundNotif()
		}
	} else {
		settings.notification.soundNotifOn = false;
		if ( settings.layout.orientation === "vertical" ) {
			for ( var i = 0; i < individualSettings.length; i++ ) {
				individualSettings[ i ].settings.soundNotifOn = false;
			}
		}
		document.getElementById( "enable-sound" ).innerHTML = 'Enable Sound Notifications<i class="right alarm outline icon"></i>';
		document.getElementById( "enable-sound" ).classList.remove( "negative" );
		document.getElementById( "sound-volume-control" ).classList.remove( "slider-control" );
		document.getElementById( "sound-volume-control" ).classList.add( "slider-control-disabled" );
		document.getElementById( "sound-choice-control" ).classList.remove( "input-control" );
		document.getElementById( "sound-choice-control" ).classList.add( "input-control-disabled" );
		document.getElementById( "sound-choice-dropdown" ).classList.add( "disabled" );
		document.getElementById( "sound-volume-slider" ).disabled = true;
		localStorage.setItem( "savedSettings", JSON.stringify( settings ) );
	}
}
