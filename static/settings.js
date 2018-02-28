function SetupSettingsModal( raid ) {
	console.log( "Setting up settings modal for raid: " + raid.room );
	document.getElementById( "settings-modal" ).dataset.room = raid.room;
	document.getElementById( "settings-modal-header" ).innerHTML = raid.english;
	document.getElementById( "settings-modal-image" ).src = raid.image;
	for ( var i = 0; i < individualSettings.length; i++ ) {
		if ( raid.room === individualSettings[ i ].room ) {
			console.log( "Settings for selected raid:" );
			console.dir( individualSettings[ i ] );
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
	try {
		$( '.ui.modal' ).modal( 'setting', 'closable', false ).modal( 'show' );
	} catch ( error ) {
		console.log( "Error showing individual settings modal: " + error );
	}
}

function SaveIndividualSettings() {
	for ( var i = 0; i < individualSettings.length; i++ ) {
		if ( document.getElementById( "settings-modal" ).dataset.room === individualSettings[ i ].room ) {
			console.log( "Saving individual settings for raid: " + individualSettings[ i ].room );
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
			console.log( "Saved individual settings for raid: " + individualSettings[ i ].room );
			console.dir( individualSettings[ i ] );
			localStorage.setItem( "individualSettings", JSON.stringify( individualSettings ) );
			break;
		}
	}
}

function CreateSettingsModalFrame() {
	console.log( "Creating Settings Modal..." );
	var result = '<div id="settings-modal" class="ui modal">';
	result += '<div id="settings-modal-header" class="header">Lvl ??? Raid Boss</div>';
	result += '<div class="image content">';
	result += '<img id="settings-modal-image" class="ui medium rounded image" src="https://via.placeholder.com/250x250">';
	result += '<div id="settings-modal-desc" class="description">';
	result += '<button id="modal-enable-notif" class="ui bigger button right labeled icon">Enable Desktop Notifications<i class="right check circle icon"></i></button>';
	result += '<span id="modal-desktop-notif-size-control" class="input-control-disabled"><span class="input-title">Desktop Notification Size</span><div id="modal-desktop-notif-size-dropdown" class="ui disabled compact selection dropdown"><input id="modal-desktop-notif-size-input" type="hidden" name="formatting" value="large"><i class="dropdown icon"></i><div class="default text">Notif Size</div><div class="menu"><div class="item" data-value="small">Small</div><div class="item" data-value="large">Large</div></div></div></span>';
	result += '<button id="modal-enable-sound" class="ui bigger button right labeled icon">Enable Sound Notifications<i class="right alarm outline icon"></i></button>';
	result += '<span id="modal-sound-choice-control" class="input-control-disabled"><span class="input-title">Sound Notification Choice</span><div id="modal-sound-choice-dropdown" class="ui compact selection disabled dropdown"><input id="modal-sound-choice-input" type="hidden" name="formatting" value="beeps"><i class="dropdown icon"></i><div class="default text">Sound Choice</div><div class="menu">';
	result += '<div class="item" data-value="beeps">Beeps Appear</div>';
	result += '<div class="item" data-value="lily-event-ringring">GBF - Lily (Event) - Ring Ring</div>';
	result += '<div class="item" data-value="andira-oniichan">GBF - Andira - Onii-chan</div>';
	result += '<div class="item" data-value="titanfall-droppingnow">Titanfall - Dropping Now</div>';
	result += '<div class="item" data-value="sakura-hoeeeee">GBF - Sakura (Event) - HOEEEEE</div>';
	result += '<div class="item" data-value="alarm-foghorn">Alarm - Foghorn</div>';
	result += '<div class="item" data-value="alarm-submarine">Alarm - Submarine</div>';
	result += '<div class="item" data-value="scifi-sweep">Sci Fi Sweep</div>';
	result += '<div class="item" data-value="female-gogogo">Female - "Go Go Go!"</div>';
	result += '<div class="item" data-value="male-gogogo">Male - "Go Go Go!"</div>';
	result += '<div class="item" data-value="female-hurryup">Female - "Hurry Up!"</div>';
	result += '<div class="item" data-value="male-hurryup">Male - "Hurry Up!"</div>';
	result += '<div class="item" data-value="jingle-nes">Jingle - NES</div>';
	result += '<div class="item" data-value="jingle-sax">Jingle - Sax</div>';
	result += '<div class="item" data-value="jingle-steel">Jingle - Steel Drum</div>';
	result += '<div class="item" data-value="jingle-steel2">Jingle - Steel Drum 2</div>';
	result += '<div class="item" data-value="zap-3tone">Zap - Three Tone</div>';
	result += '<div class="item" data-value="zap-2tone">Jingle - Two Tone</div>';
	result += '<div class="item" data-value="magic-spell">Magic Spell</div>';
	result += '<div class="item" data-value="custom">Custom</div>';
	result += '</div></div></span>';
	result += '<span id="modal-sound-volume-control" class="slider-control-disabled"><span class="slider-title">Sound Notification Volume</span><input id="modal-sound-volume-slider" class="slider-range slider" type="range" min="0" max="100" value="100" disabled></span>';
	result += '</div></div>';
	result += '<div id="settings-modal-actions" class="actions">';
	result += '<div id="settings-modal-save-btn" class="ui large positive button">Save</div>';
	result += '<div id="settings-modal-cancel-btn" class="ui large negative button">Cancel</div>';
	result += '</div></div>';
	return result;
}

function LoadSavedSettings() {
	console.log( "Loading settings from localstorage..." );
	if ( localStorage.getItem( "savedSettings" ) ) {
		console.log( "Found settings in localstorage." );
		try {
			var tempSettings = JSON.parse( localStorage.getItem( "savedSettings" ) );
		} catch ( error ) {
			console.log( "Error parsing settings from localstorage: " + error );
		}
		if ( tempSettings.version === settings.version ) {
			console.log( "Loaded version matches current version." );
			settings.newsSeen = tempSettings.newsSeen;
		} else {
			console.log( "Loaded version does not match current version." );
			settings.newsSeen = false;
		}
		try {
			Object.assign( settings.notification, tempSettings.notification );
			Object.assign( settings.layout, tempSettings.layout );
		} catch ( error ) {
			console.log( "Error assigning saved settings to current settings: " + error );
		}
		settings.viramateID = tempSettings.viramateID;
		settings.disableJoined = tempSettings.disableJoined;
		document.getElementById( "viramate-id-input" ).value = settings.viramateID;
		if ( document.getElementById( "viramate-api" ) !== null ) {
			document.getElementById( "viramate-api" ).src = "chrome-extension://" + settings.viramateID + "/content/api.html";
		}
		settings.strikeTime = tempSettings.strikeTime;
		document.getElementById( "time-picker" ).value = settings.strikeTime;
		SetTime();
		if ( settings.disableJoined ) {
			document.getElementById( "join-disable-input" ).checked = true;
		}
		if ( !settings.newsSeen ) {
			document.getElementById( "news-message" ).classList.remove( "hidden" );
		}
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
			document.getElementById( "sound-input-control" ).classList.remove( "input-control-disabled" );
			document.getElementById( "sound-input-control" ).classList.add( "input-control" );
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
		if ( settings.layout.toolbarShrink ) {
			document.getElementById( "toolbar-shrinker-input" ).checked = true;
			document.getElementById( "header" ).classList.add( "header-shrink" );
		}
		if ( settings.layout.nightMode ) {
			document.body.classList.add( "darken" );
			document.getElementById( "favicon" ).href = "/assets/misc/GBFRaidersIconv1.png";
			document.getElementById( "enable-night" ).classList.add( "negative" );
			document.getElementById( "enable-night" ).innerHTML = 'Disable Night Mode<i class="right sun icon"></i>';
		}
		document.getElementById( "viramate-id-input" ).value = settings.viramateID;
		if ( localStorage.getItem( "individualSettings" ) ) {
			try {
				var tempIndivSettings = JSON.parse( localStorage.getItem( "individualSettings" ) );
			} catch ( error ) {
				console.log( "Error parsing individual settings from localstorage: " + error );
			}
			try {
				Object.assign( individualSettings, tempIndivSettings );
			} catch ( error ) {
				console.log( "Error assigning saved individual settings to current individual settings: " + error );
			}
		}
		SetupTable();
	}
}

function SetupControls() {
	try {
		var clipboard = new Clipboard( '.copy-div', {
			text: function ( trigger ) {
				console.log( "Copying to clipboard: " + trigger.dataset.clipboard );
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

		document.getElementById( "join-disable-input" ).addEventListener( 'change', function ( evt ) {
			if ( document.getElementById( "join-disable-input" ).checked ) {
				settings.disableJoined = true;
			} else {
				settings.disableJoined = false;
			}
			localStorage.setItem( "savedSettings", JSON.stringify( settings ) );
		} );

		document.getElementById( "time-picker" ).addEventListener( 'input', function ( evt ) {
			settings.strikeTime = evt.target.value;
			localStorage.setItem( "savedSettings", JSON.stringify( settings ) );
			SetTime();
		} );

		setInterval( function () {
			SetTime();
		}, 10000 );

		document.getElementById( "view-statistics" ).addEventListener( 'click', function () {
			var statsTable = document.createElement( "table" );
			var statsTableBody = document.createElement( "tbody" );
			if ( statistics.succeded.total == 0 && statistics.failed.total == 0 ) {
				var statsTableBodyRow = document.createElement( "tr" );
				var statsTableBodyRowTD = document.createElement( "td" );
				statsTableBodyRowTD.innerHTML = "No statistics so far!";
				statsTableBodyRow.appendChild( statsTableBodyRowTD );
				statsTableBody.appendChild( statsTableBodyRow );
			} else {
				statistics.succeded.individual.forEach( function ( statItem ) {
					var statsTableBodyRow = document.createElement( "tr" );
					var statsTableBodyRowRoomTD = document.createElement( "td" );
					statsTableBodyRowRoomTD.innerHTML = statItem.room + " joined:";
					var statsTableBodyRowCountTD = document.createElement( "td" );
					statsTableBodyRowCountTD.innerHTML = statItem.count + " time(s)";
					statsTableBodyRow.appendChild( statsTableBodyRowRoomTD );
					statsTableBodyRow.appendChild( statsTableBodyRowCountTD );
					statsTableBody.appendChild( statsTableBodyRow );
				} );
				statistics.failed.individual.forEach( function ( statItem ) {
					var statsTableBodyRow = document.createElement( "tr" );
					var statsTableBodyRowRoomTD = document.createElement( "td" );
					statsTableBodyRowRoomTD.innerHTML = statItem.room + " failed:";
					var statsTableBodyRowCountTD = document.createElement( "td" );
					statsTableBodyRowCountTD.innerHTML = statItem.count + " time(s)";
					statsTableBodyRow.appendChild( statsTableBodyRowRoomTD );
					statsTableBodyRow.appendChild( statsTableBodyRowCountTD );
					statsTableBody.appendChild( statsTableBodyRow );
				} );
			}
			statsTable.appendChild( statsTableBody );

			swal( {
				title: "Current Statistics",
				content: statsTable
			} );
		} );

		document.getElementById( "enable-sound" ).addEventListener( "click", function ( event ) {
			console.dir( event );
			ToggleSoundNotifications( true )
		} );

		document.getElementById( "local-file-input" ).addEventListener( "change", function () {
			console.log( "Changing custom sound notif..." );
			customSoundNotif.src = URL.createObjectURL( this.files[ 0 ] );
			customSoundNotif.onend = function ( e ) {
				URL.revokeObjectURL( this.src );
			}
		} );

		document.getElementById( "viramate-id-input" ).addEventListener( 'input', function ( event ) {
			console.log( "Changing Viramate id to " + event.target.value );
			settings.viramateID = event.target.value;
			localStorage.setItem( "savedSettings", JSON.stringify( settings ) );
			if ( document.getElementById( "viramate-api" ) !== null ) {
				document.getElementById( "viramate-api" ).src = "chrome-extension://" + settings.viramateID + "/content/api.html";
			}
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
				document.getElementById( "favicon" ).href = "/assets/misc/GBFRaidersIconv1.png";
				document.getElementById( "enable-night" ).classList.add( "negative" );
				document.getElementById( "enable-night" ).innerHTML = 'Disable Night Mode<i class="right sun icon"></i>';
			} else {
				settings.layout.nightMode = false;
				document.body.classList.remove( "darken" );
				document.getElementById( "favicon" ).href = "/assets/misc/GBFRaidersIconv2.png";
				document.getElementById( "enable-night" ).classList.remove( "negative" );
				document.getElementById( "enable-night" ).innerHTML = 'Enable Night Mode<i class="right moon icon"></i>';
			}
			localStorage.setItem( "savedSettings", JSON.stringify( settings ) );
		} );

		document.getElementById( "open-settings" ).addEventListener( 'click', function ( event ) {
			console.log( "Opening settings bar..." );
			try {
				$( '.ui.sidebar' ).sidebar( 'toggle' );
			} catch ( error ) {
				console.log( "Error opening settings bar: " + error );
			}
		} );

		document.getElementById( "clear-list" ).addEventListener( "click", function ( event ) {
			console.log( "Clearing all raids from tables..." );
			raids = [];
			try {
				if ( settings.layout.orientation === "horizontal" ) {
					while ( document.getElementById( "table-body" ).firstChild ) {
						document.getElementById( "table-body" ).firstChild.remove();
					}
				} else {
					for ( var i = 0; i < selectedRaidsArray.length; i++ ) {
						while ( document.getElementById( selectedRaidsArray[ i ] + "-table-body" ).firstChild ) {
							document.getElementById( selectedRaidsArray[ i ] + "-table-body" ).firstChild.remove();
						}
					}
				}
			} catch ( error ) {
				console.log( "Error clearing raids from tables: " + error );
			}
		} );

		document.getElementById( "full-screen" ).addEventListener( "click", function ( event ) {
			if ( document.fullscreenElement || document.fullScreen || document.mozFullScreen || document.webkitIsFullScreen ) {
				document.getElementById( "full-screen" ).innerHTML = 'Full Screen<i class="right expand icon"></i>';
				document.getElementById( "full-screen" ).classList.remove( "negative" );
				document.getElementById( "full-screen" ).classList.add( "primary" );
				if ( document.exitFullscreen ) {
					document.exitFullscreen();
				} else if ( document.mozCancelFullScreen ) {
					document.mozCancelFullScreen();
				} else if ( document.webkitCancelFullScreen ) {
					document.webkitCancelFullScreen();
				}
			} else {
				document.getElementById( "full-screen" ).innerHTML = 'Normal Screen<i class="right compress icon"></i>';
				document.getElementById( "full-screen" ).classList.remove( "primary" );
				document.getElementById( "full-screen" ).classList.add( "negative" );
				if ( document.body.requestFullscreen ) {
					document.body.requestFullscreen();
				} else if ( document.body.mozRequestFullScreen ) {
					document.body.mozRequestFullScreen();
				} else if ( document.body.webkitRequestFullScreen ) {
					document.body.webkitRequestFullScreen();
				} else if ( document.body.msRequestFullscreen ) {
					document.body.msRequestFullscreen();
				}
			}
		} );

		$( '.message .close' ).on( 'click', function () {
			$( this ).closest( '.message' ).transition( 'fade' );
			settings.newsSeen = true;
			localStorage.setItem( "savedSettings", JSON.stringify( settings ) );
		} );

		$( '.ui.checkbox' ).checkbox().first().checkbox( {
			onChecked: function () {
				settings.layout.toolbarShrink = true;
				document.getElementById( "header" ).classList.add( "header-shrink" );
			},
			onUnchecked: function () {
				settings.layout.toolbarShrink = false;
				document.getElementById( "header" ).classList.remove( "header-shrink" );
			}
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

		$( '.donate' )
			.popup( {
				inline: true,
				position: "bottom left",
				perserve: true,
				setFluidWidth: false,
				lastResort: "bottom left",
				hoverable: false,
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
					description: 'element'
				},
				maxResults: 10,
				onSelect: function ( result, response ) {
					console.log( "Adding selected raid..." );
					try {
						AddSelectedRaid( result.room );
					} catch ( error ) {
						console.log( "Error adding raid to selected raids: " + error );
					}
					setTimeout( function () {
						document.getElementById( "searcher" ).value = "";
					}, 50 );
				},
				showNoResults: true
			} );

		$( '.tabular.menu .item' ).tab();
	} catch ( error ) {
		console.log( "Error setting up controls: " + error );
	}
}

function ToggleDesktopNotifications( clicked ) {
	console.log( "Toggling desktop notifications..." );
	if ( settings.notification.desktopNotifOn === false ) {
		if ( Notification.permission !== "denied" ) {
			Notification.requestPermission( function ( permission ) {
				if ( permission === "granted" ) {
					if ( clicked ) {
						try {
							var notification = new Notification( "Thank you for enabling notifications!", {
								body: "Click on notifications to copy the ID!",
								icon: "/assets/stickers/heregoes-sticker.png"
							} );
						} catch ( error ) {
							console.log( "Error sending initial desktop notif: " + error );
						}
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
	console.log( "Toggling sound notifications..." );
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
		document.getElementById( "sound-input-control" ).classList.remove( "input-control-disabled" );
		document.getElementById( "sound-input-control" ).classList.add( "input-control" );
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
		document.getElementById( "sound-input-control" ).classList.add( "input-control-disabled" );
		document.getElementById( "sound-input-control" ).classList.remove( "input-control" );
		document.getElementById( "sound-choice-dropdown" ).classList.add( "disabled" );
		document.getElementById( "sound-volume-slider" ).disabled = true;
		localStorage.setItem( "savedSettings", JSON.stringify( settings ) );
	}
}
