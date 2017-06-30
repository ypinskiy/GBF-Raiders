var socket = io.connect( '/' );
var raids = [];
var raidConfigs = [];
var selectedRaidsArray = [];

var beepsSoundNotif = new Audio( '/assets/Beeps_Appear.wav' );
var lilyRingRingSoundNotif = new Audio( '/assets/Lily_Event_RingRing.mp3' );
var andiraOniichanSoundNotif = new Audio( '/assets/Andira_Oniichan.mp3' );
var titanfallDroppingNowSoundNotif = new Audio( '/assets/Titanfall_DroppingNow.mp3' );

var settings = {
	notification: {
		soundNotifOn: false,
		soundNotifVolume: 100,
		soundNotifChoice: "beeps",
		desktopNotifOn: false,
		desktopNotifSize: "large"
	},
	layout: {
		orientation: "horizontal",
		infoLevel: "normal",
		raidTimeout: 120,
		raidMaxResults: 30
	}
};

socket.on( 'tweet', function ( data ) {
	if ( document.getElementById( data.id ) === null ) {
		raids.push( data );
		CreateRaidRow( data );
		if ( settings.notification.soundNotifOn ) {
			PlaySoundNotif();
		}
		var raidConfig = FindRaidConfig( data.room );
		if ( settings.notification.desktopNotifOn ) {
			if ( Notification.permission === "granted" ) {
				var notification = null;
				if ( settings.notification.desktopNotifSize === "small" ) {
					notification = new Notification( raidConfig.english, {
						body: "ID: " + data.id,
						icon: raidConfig.image
					} );
				} else {
					notification = new Notification( raidConfig.english, {
						body: "ID: " + data.id,
						image: raidConfig.image
					} );
				}
				notification.onclick = function ( event ) {
					event.preventDefault();
					var raid = document.getElementById( data.id );
					raid.click();
					document.getElementById( "viramate-api" ).contentWindow.postMessage( {
						type: "tryJoinRaid",
						id: ( Math.floor( Math.random() * 900000 ) + 100000 ),
						raidCode: data.id
					}, "*" );
					document.getElementById( data.id + '-btn' ).classList.remove( "primary" );
					document.getElementById( data.id + '-btn' ).classList.add( "negative" );
					notification.close();
				}
			}
		}
	}
} );

function FindRaidConfig( room ) {
	var result = null;
	for ( var i = 0; i < raidConfigs.length; i++ ) {
		if ( raidConfigs[ i ].room == room ) {
			result = raidConfigs[ i ];
			break;
		}
	}
	return result;
}

function CreateRaidRow( data ) {
	var raidConfig = FindRaidConfig( data.room );
	if ( settings.layout.orientation === "horizontal" ) {
		var newLine = document.createElement( "tr" );
		newLine.id = data.id;
		newLine.classList.add( "copy-div" );
		newLine.dataset.clipboard = data.id;
		if ( settings.layout.infoLevel === "compact" ) {
			var imageTD = document.createElement( "td" );
			imageTD.innerHTML = '<div class="ui items"><div class="item"><div class="ui tiny image"><img src="' + raidConfig.image + '"></div><div class="content"><div class="header">' + raidConfig.english + '</div><div class="meta"><span>' + raidConfig.japanese + '</span></div></div></div>';
			var idTD = document.createElement( "td" );
			idTD.id = data.id + '-label';
			idTD.classList.add( "center", "aligned" );
			idTD.innerHTML = data.id;
			var joinTD = document.createElement( "td" );
			joinTD.classList.add( "center", "aligned" );
			var joinButton = document.createElement( "button" );
			joinButton.classList.add( "ui", "primary", "button", "right", "labeled", "icon", "toggle", "join-raid-btn" );
			joinButton.id = data.id + '-btn';
			joinButton.innerHTML = 'Join Raid<i class="right sign in icon"></i>';
			joinTD.appendChild( joinButton );
			newLine.appendChild( imageTD );
			newLine.appendChild( idTD );
			newLine.appendChild( joinTD );
			joinButton.addEventListener( "click", function ( event ) {
				document.getElementById( "viramate-api" ).contentWindow.postMessage( {
					type: "tryJoinRaid",
					id: ( Math.floor( Math.random() * 900000 ) + 100000 ),
					raidCode: event.target.id.substr( 0, 8 )
				}, "*" );
				joinButton.classList.remove( "primary" );
				joinButton.classList.add( "negative" );
			} );
		} else if ( settings.layout.infoLevel === "normal" ) {
			var imageTD = document.createElement( "td" );
			imageTD.innerHTML = '<div class="ui items"><div class="item"><div class="ui image"><img src="' + raidConfig.image + '"></div><div class="content"><div class="header">' + raidConfig.english + '</div><div class="meta"><span>' + raidConfig.japanese + '</span></div></div></div>';
			var idTD = document.createElement( "td" );
			idTD.id = data.id + '-label';
			idTD.classList.add( "center", "aligned" );
			idTD.innerHTML = data.id;
			var timeTD = document.createElement( "td" );
			timeTD.id = data.id + '-time';
			timeTD.classList.add( "center", "aligned" );
			timeTD.innerHTML = "0 secs ago";
			var joinTD = document.createElement( "td" );
			joinTD.classList.add( "center", "aligned" );
			var joinButton = document.createElement( "button" );
			joinButton.classList.add( "ui", "primary", "button", "right", "labeled", "icon", "toggle", "join-raid-btn" );
			joinButton.id = data.id + '-btn';
			joinButton.innerHTML = 'Join Raid<i class="right sign in icon"></i>';
			joinTD.appendChild( joinButton );
			newLine.appendChild( imageTD );
			newLine.appendChild( idTD );
			newLine.appendChild( timeTD );
			newLine.appendChild( joinTD );
			joinButton.addEventListener( "click", function ( event ) {
				document.getElementById( "viramate-api" ).contentWindow.postMessage( {
					type: "tryJoinRaid",
					id: ( Math.floor( Math.random() * 900000 ) + 100000 ),
					raidCode: event.target.id.substr( 0, 8 )
				}, "*" );
				joinButton.classList.remove( "primary" );
				joinButton.classList.add( "negative" );
			} );
		} else {
			var imageTD = document.createElement( "td" );
			imageTD.classList.add( "center", "aligned" );
			imageTD.innerHTML = '<img src="' + raidConfig.image + '">';
			var contentTD = document.createElement( "td" );
			contentTD.classList.add( "center", "aligned" );
			var nameDiv = document.createElement( "div" );
			nameDiv.classList.add( "ui", "two", "column", "divided", "grid" );
			nameDiv.innerHTML = '<div class="column item"><div class="name-header">' + raidConfig.english + '</div><div class="name-meta">' + raidConfig.japanese + '</div></div>';
			var idSpan = document.createElement( "span" );
			idSpan.id = data.id + '-label';
			idSpan.classList.add( "column" );
			idSpan.innerHTML = data.id;
			nameDiv.appendChild( idSpan );
			contentTD.appendChild( nameDiv );
			var messageDiv = document.createElement( "div" );
			messageDiv.innerHTML = data.message;
			contentTD.innerHTML += '<div class="ui divider"></div>';
			contentTD.appendChild( messageDiv );
			var joinTD = document.createElement( "td" );
			joinTD.classList.add( "center", "aligned" );
			var timediv = document.createElement( "div" );
			timediv.id = data.id + '-time';
			timediv.classList.add( "time-filler" );
			timediv.innerHTML = "0 secs ago";
			joinTD.appendChild( timediv );
			joinTD.innerHTML += '<div class="ui divider"></div>';
			var joinButton = document.createElement( "button" );
			joinButton.classList.add( "ui", "primary", "button", "right", "labeled", "icon", "toggle", "join-raid-btn" );
			joinButton.id = data.id + '-btn';
			joinButton.innerHTML = 'Join Raid<i class="right sign in icon"></i>';
			joinTD.appendChild( joinButton );
			newLine.appendChild( imageTD );
			newLine.appendChild( contentTD );
			newLine.appendChild( joinTD );
			joinButton.addEventListener( "click", function ( event ) {
				document.getElementById( "viramate-api" ).contentWindow.postMessage( {
					type: "tryJoinRaid",
					id: ( Math.floor( Math.random() * 900000 ) + 100000 ),
					raidCode: event.target.id.substr( 0, 8 )
				}, "*" );
				joinButton.classList.remove( "primary" );
				joinButton.classList.add( "negative" );
			} );
		}
		document.getElementById( "table-body" ).insertBefore( newLine, document.getElementById( "table-body" ).firstChild );
	} else {

	}
}

function UpdateRaidRow( data, index ) {
	var raidDIV = document.getElementById( data.id );
	if ( moment().diff( data.time, "seconds" ) > settings.layout.raidTimeout || index > settings.layout.raidMaxResults ) {
		document.getElementById( "table-body" ).removeChild( raidDIV );
		raids.splice( index, 1 );
	} else {
		if ( settings.layout.infoLevel === "normal" || settings.layout.infoLevel === "full" ) {
			document.getElementById( data.id + '-time' ).innerHTML = moment().diff( data.time, "seconds" ) + ' secs ago';
		}
	}
}

window.onload = function () {
	window.addEventListener( "message", onMessage, false );

	function onMessage( evt ) {
		if ( evt.data.type !== "result" ) {
			return;
		} else {
			console.log( evt );
		}
	}

	LoadSavedSettings();
	SetupControls();
	localStorage.setItem( "savedSettings", JSON.stringify( settings ) );
	SetupTable();
	LoadSavedRaids();

	setInterval( function () {
		if ( selectedRaidsArray.length === 0 ) {
			document.getElementById( "selected-raids" ).innerHTML = "No raids selected. Please search for a raid in the search bar above.";
		}
		for ( var i = raids.length - 1; i >= 0; i-- ) {
			UpdateRaidRow( raids[ i ], i );
		}
	}, 500 );
};

function LoadSavedRaids() {
	if ( localStorage.getItem( "selectedRaids" ) ) {
		var tempSelectedRaids = JSON.parse( localStorage.getItem( "selectedRaids" ) );
		for ( var i = 0; i < tempSelectedRaids.length; i++ ) {
			AddSelectedRaid( tempSelectedRaids[ i ] );
		}
	}
}

function LoadSavedSettings() {
	if ( localStorage.getItem( "savedSettings" ) ) {
		settings = JSON.parse( localStorage.getItem( "savedSettings" ) );
		if ( settings.notification.desktopNotifOn ) {
			document.getElementById( "enable-notif" ).innerHTML = 'Disable Desktop Notifications<i class="right announcement icon"></i>';
			document.getElementById( "enable-notif" ).classList.add( "negative" );
			document.getElementById( "desktop-notif-size-control" ).classList.remove( "input-control-disabled" );
			document.getElementById( "desktop-notif-size-control" ).classList.add( "input-control" );
			document.getElementById( "desktop-notif-size-dropdown" ).classList.remove( "disabled" );
		}
		document.getElementById( "desktop-notif-size-input" ).value = settings.notification.desktopNotifSize;
		if ( settings.notification.soundNotifOn ) {
			document.getElementById( "enable-sound" ).innerHTML = 'Disable Sound Notifications<i class="right alarm outline icon"></i>';
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
		}
		document.getElementById( "info-level-input" ).value = settings.layout.infoLevel;
		document.getElementById( "raid-timeout" ).value = settings.layout.raidTimeout;
		document.getElementById( "raid-max-results" ).value = settings.layout.raidMaxResults;
		SetupTable();
	}
}

function PlaySoundNotif() {
	if ( settings.notification.soundNotifOn ) {
		if ( settings.notification.soundNotifChoice === "beeps" ) {
			beepsSoundNotif.volume = ( settings.notification.soundNotifVolume / 100 );
			beepsSoundNotif.play();
		} else if ( settings.notification.soundNotifChoice === "lily-event-ringring" ) {
			lilyRingRingSoundNotif.volume = ( settings.notification.soundNotifVolume / 100 );
			lilyRingRingSoundNotif.play();
		} else if ( settings.notification.soundNotifChoice === "andira-oniichan" ) {
			andiraOniichanSoundNotif.volume = ( settings.notification.soundNotifVolume / 100 );
			andiraOniichanSoundNotif.play();
		} else if ( settings.notification.soundNotifChoice === "titanfall-droppingnow" ) {
			titanfallDroppingNowSoundNotif.volume = ( settings.notification.soundNotifVolume / 100 );
			titanfallDroppingNowSoundNotif.play();
		}
	}
}

function ToggleDesktopNotifications( clicked ) {
	if ( settings.notification.desktopNotifOn === false ) {
		if ( Notification.permission !== "denied" ) {
			Notification.requestPermission( function ( permission ) {
				if ( permission === "granted" ) {
					if ( clicked ) {
						var notification = new Notification( "Thank you for enabling notifications!", {
							body: "Click on notifications to copy the ID!",
							icon: "/assets/heregoessticker.png"
						} );
					}
					settings.notification.desktopNotifOn = true;
					document.getElementById( "enable-notif" ).innerHTML = 'Disable Desktop Notifications<i class="right announcement icon"></i>';
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
		document.getElementById( "enable-notif" ).innerHTML = 'Enable Desktop Notifications<i class="right announcement icon"></i>';
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
		document.getElementById( "enable-sound" ).innerHTML = 'Disable Sound Notifications<i class="right alarm outline icon"></i>';
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
			localStorage.setItem( "savedSettings", JSON.stringify( settings ) );
		}
	} );

	document.getElementById( "enable-sound" ).addEventListener( "click", function ( event ) {
		ToggleSoundNotifications( true )
	} );

	document.getElementById( "sound-volume-slider" ).addEventListener( "input", function ( event ) {
		settings.notification.soundNotifVolume = event.target.value;
		localStorage.setItem( "savedSettings", JSON.stringify( settings ) );
	} );

	document.getElementById( "horiz-layout-btn" ).addEventListener( "click", function ( event ) {
		if ( settings.layout.orientation === "vertical" ) {
			settings.layout.orientation = "horizontal";
			localStorage.setItem( "savedSettings", JSON.stringify( settings ) );
			document.getElementById( "horiz-layout-btn" ).classList.add( "primary" );
			document.getElementById( "vertical-layout-btn" ).classList.remove( "primary" );
		}
	} );

	document.getElementById( "vertical-layout-btn" ).addEventListener( "click", function ( event ) {
		if ( settings.layout.orientation === "horizontal" ) {
			settings.layout.orientation = "vertical";
			localStorage.setItem( "savedSettings", JSON.stringify( settings ) );
			document.getElementById( "vertical-layout-btn" ).classList.add( "primary" );
			document.getElementById( "horiz-layout-btn" ).classList.remove( "primary" );
		}
	} );

	$( "#info-level" ).dropdown( {
		onChange: function ( value, text, $selectedItem ) {
			settings.layout.infoLevel = value;
			localStorage.setItem( "savedSettings", JSON.stringify( settings ) );
			SetupTable();
			for ( var i = 0; i < raids.length; i++ ) {
				CreateRaidRow( raids[ i ] );
			}
		}
	} );

	$( "#sound-choice-dropdown" ).dropdown( {
		onChange: function ( value, text, $selectedItem ) {
			settings.notification.soundNotifChoice = value;
			localStorage.setItem( "savedSettings", JSON.stringify( settings ) );
			PlaySoundNotif();
		}
	} );

	document.getElementById( "raid-timeout" ).addEventListener( "input", function ( event ) {
		if ( event.target.value.match( /[a-z]/i ) || parseInt( event.target.value, 10 ) < 1 || parseInt( event.target.value, 10 ) > 999 ) {
			document.getElementById( "raid-timeout" ).parentElement.classList.add( "error" );
		} else {
			document.getElementById( "raid-timeout" ).parentElement.classList.remove( "error" );
			settings.layout.raidTimeout = event.target.value;
			localStorage.setItem( "savedSettings", JSON.stringify( settings ) );
		}
	} );

	document.getElementById( "raid-max-results" ).addEventListener( "input", function ( event ) {
		if ( event.target.value.match( /[a-z]/i ) || parseInt( event.target.value, 10 ) < 1 || parseInt( event.target.value, 10 ) > 999 ) {
			document.getElementById( "raid-max-results" ).parentElement.classList.add( "error" );
		} else {
			document.getElementById( "raid-max-results" ).parentElement.classList.remove( "error" );
			settings.layout.raidMaxResults = event.target.value;
			localStorage.setItem( "savedSettings", JSON.stringify( settings ) );
		}
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

	$( '.tabular.menu .item' ).tab();
	var xmlHttp = new XMLHttpRequest();
	xmlHttp.onreadystatechange = function () {
		if ( xmlHttp.readyState === 4 && xmlHttp.status === 200 && xmlHttp.responseText != undefined ) {
			raidConfigs = JSON.parse( xmlHttp.responseText );
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
						AddSelectedRaid( result );
						setTimeout( function () {
							document.getElementById( "searcher" ).value = "";
						}, 50 );
					},
					showNoResults: true
				} );
		}
	};
	xmlHttp.open( "GET", '/getraids', true );
	xmlHttp.send();
}

function AddSelectedRaid( raid ) {
	if ( settings.layout.orientation === "horizontal" ) {
		if ( document.getElementById( raid.room ) === null ) {
			if ( document.getElementById( "selected-raids" ).innerHTML === "No raids selected. Please search for a raid in the search bar above." ) {
				document.getElementById( "selected-raids" ).innerHTML = "";
			}
			selectedRaidsArray.push( raid );
			var selectedLabel = document.createElement( "div" );
			selectedLabel.classList.add( "ui", "big", "label", "image", "selected-raids-label" );
			selectedLabel.id = raid.room;
			selectedLabel.innerHTML = '<img src="' + raid.image + '">' + raid.english + '<i class="delete icon"></i>';
			document.getElementById( "selected-raids" ).appendChild( selectedLabel );
			selectedLabel.addEventListener( "click", function ( event ) {
				RemoveSelectedRaid( raid );
			}, false );
			socket.emit( 'subscribe', {
				room: raid.room
			} );
			localStorage.setItem( "selectedRaids", JSON.stringify( selectedRaidsArray ) );
		}
	}
}

function RemoveSelectedRaid( raid ) {
	if ( settings.layout.orientation === "horizontal" ) {
		socket.emit( 'unsubscribe', {
			room: raid.room
		} );
		selectedRaidsArray.splice( selectedRaidsArray.indexOf( raid ), 1 );
		localStorage.setItem( "selectedRaids", JSON.stringify( selectedRaidsArray ) );
		document.getElementById( raid.room ).remove();
	}
}

function SetupTable() {
	if ( document.getElementById( "raid-table" ) !== null ) {
		document.getElementById( "raid-table" ).remove();
	}
	if ( settings.layout.orientation === "horizontal" ) {
		var raidTable = document.createElement( "table" );
		raidTable.id = "raid-table";
		raidTable.classList.add( "ui", "blue", "celled", "selectable", "table" );
		if ( document.getElementById( "selected-raids-label" ) === null ) {
			var selectedRaidsDiv = document.createElement( "div" );
			selectedRaidsDiv.classList.add( "ui", "secondary", "inverted", "blue", "segment" );
			selectedRaidsDiv.innerHTML = '<div id="selected-raids-label">Selected Raids:</div><div id="selected-raids" class="ui segment">No raids selected. Please search for a raid in the search bar above.</div>';
			document.getElementById( "header" ).appendChild( selectedRaidsDiv );
		}
		if ( settings.layout.infoLevel === "normal" ) {
			raidTable.classList.add( "padded" );
			raidTable.innerHTML = '<thead><tr><th class="center aligned eight wide">Raid Name</th><th class="center aligned single line two wide">Raid ID</th><th class="center aligned single line three wide">Time Tweeted</th><th class="center aligned single line three wide">Join Raid</th></tr></thead>';
		} else if ( settings.layout.infoLevel === "compact" ) {
			raidTable.classList.add( "compact" );
			raidTable.innerHTML = '<thead><tr><th class="center aligned nine wide">Raid Name</th><th class="center aligned single line three wide">Raid ID</th><th class="center aligned single line four wide">Join Raid</th></tr></thead>';
		} else {
			raidTable.classList.add( "padded" );
			raidTable.innerHTML = '<thead><tr><th class="center aligned four wide">Raid Image</th><th class="center aligned nine wide">Raid Content</th><th class="center aligned single line four wide">Join Info</th></tr></thead>';
		}
		var raidTableBody = document.createElement( "tbody" );
		raidTableBody.id = "table-body";
		raidTable.appendChild( raidTableBody );
		document.getElementById( "container" ).appendChild( raidTable );
	} else {
		if ( settings.layout.infoLevel === "normal" ) {

		} else if ( settings.layout.infoLevel === "compact" ) {

		} else {

		}
	}
}
