var socket = io.connect( '/' );
var raids = [];
var raidConfigs = [];
var selectedRaidsArray = [];
var individualSettings = [];
var wasDown = false;

var beepsSoundNotif = new Audio( '/assets/sounds/Beeps_Appear.wav' );
var lilyRingRingSoundNotif = new Audio( '/assets/sounds/Lily_Event_RingRing.mp3' );
var andiraOniichanSoundNotif = new Audio( '/assets/sounds/Andira_Oniichan.mp3' );
var titanfallDroppingNowSoundNotif = new Audio( '/assets/sounds/Titanfall_DroppingNow.mp3' );

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
		verticalStacking: "row",
		infoLevel: "normal",
		raidTimeout: 120,
		raidMaxResults: 30,
		nightMode: false
	},
	version: "1.7",
	newsSeen: false,
	cardSlots: 8,
	debugLevel: 0
};

socket.on( 'tweet', function ( data ) {
	if ( settings.debugLevel > 0 ) {
		console.log( "Tweet recieved:" );
		console.dir( data );
	}
	if ( document.getElementById( data.id ) === null ) {
		raids.push( data );
		CreateRaidRow( data );
		PlaySoundNotif( data );
		SendDesktopNotif( data );
	}
} );

function CheckConnectionStatus() {
	if ( settings.debugLevel > 1 ) {
		console.log( "Checking connection status..." );
	}
	if ( socket.connected ) {
		if ( settings.debugLevel > 1 ) {
			console.log( "Connection Status: UP" );
		}
		document.getElementById( "connection-status" ).classList.remove( "red" );
		document.getElementById( "connection-status" ).classList.add( "green" );
		document.getElementById( "connection-status-value" ).innerHTML = "UP";
		if ( wasDown ) {
			if ( settings.debugLevel > 1 ) {
				console.log( "Recovering from connection down..." );
			}
			if ( localStorage.getItem( "selectedRaids" ) ) {
				var tempSelectedRaids = JSON.parse( localStorage.getItem( "selectedRaids" ) );
				for ( var i = 0; i < tempSelectedRaids.length; i++ ) {
					socket.emit( 'subscribe', {
						room: tempSelectedRaids[ i ]
					} );
				}
			}
		}
		wasDown = false;
	} else {
		if ( settings.debugLevel > 1 ) {
			console.log( "Connection Status: DOWN" );
		}
		document.getElementById( "connection-status" ).classList.remove( "green" );
		document.getElementById( "connection-status" ).classList.add( "red" );
		document.getElementById( "connection-status-value" ).innerHTML = "DOWN";
		wasDown = true;
	}
}

window.onload = function () {
	if ( settings.debugLevel > 0 ) {
		console.log( "Window loaded." );
	}
	window.addEventListener( "message", onMessage, false );

	function onMessage( evt ) {
		if ( settings.debugLevel > 0 ) {
			console.log( "Viramate message recieved." );
		}
		if ( evt.data.type !== "result" ) {
			if ( settings.debugLevel > 0 ) {
				console.log( "Viramate message not a result." );
			}
			return;
		} else {
			if ( settings.debugLevel > 0 ) {
				console.log( "Viramate message:" );
				console.dir( evt.data );
			}
			if ( evt.data.result === "refill required" ) {
				document.getElementById( evt.data.id + '-btn' ).classList.remove( "secondary" );
				document.getElementById( evt.data.id + '-btn' ).classList.add( "negative" );
				FindRaid( evt.data.id ).status = "error";
				swal( {
					title: "No more BP!",
					text: "Please refill your BP or try again later.",
					imageUrl: "assets/stickers/waitup-sticker.png",
					imageSize: '150x150',
					timer: 2000
				} );
			} else if ( evt.data.result === "popup: This raid battle has already ended." ) {
				document.getElementById( evt.data.id + '-btn' ).classList.remove( "secondary" );
				document.getElementById( evt.data.id + '-btn' ).classList.add( "negative" );
				FindRaid( evt.data.id ).status = "error";
				swal( {
					title: "Raid has ended!",
					text: "Please try a different raid.",
					imageUrl: "assets/stickers/fail-sticker.png",
					imageSize: '150x150',
					timer: 2000
				} );
			} else if ( evt.data.result === "popup: This raid battle is full. You can't participate." ) {
				document.getElementById( evt.data.id + '-btn' ).classList.remove( "secondary" );
				document.getElementById( evt.data.id + '-btn' ).classList.add( "negative" );
				FindRaid( evt.data.id ).status = "error";
				swal( {
					title: "Raid is full!",
					text: "Please try a different raid.",
					imageUrl: "assets/stickers/sorry-sticker.png",
					imageSize: '150x150',
					timer: 2000
				} );
			} else if ( evt.data.result === "already in this raid" ) {
				document.getElementById( evt.data.id + '-btn' ).classList.remove( "secondary" );
				document.getElementById( evt.data.id + '-btn' ).classList.add( "positive" );
				FindRaid( evt.data.id ).status = "error";
				swal( {
					title: "You are already in this raid!",
					text: "Please try a different raid.",
					imageUrl: "assets/stickers/whoops-sticker.png",
					imageSize: '150x150',
					timer: 2000
				} );
			} else if ( evt.data.result === "ok" ) {
				document.getElementById( evt.data.id + '-btn' ).classList.remove( "secondary" );
				document.getElementById( evt.data.id + '-btn' ).classList.add( "positive" );
				FindRaid( evt.data.id ).status = "success";
			}
		}
	}

	var xmlHttp = new XMLHttpRequest();
	if ( settings.debugLevel > 0 ) {
		console.log( "Getting raid configs..." );
	}
	xmlHttp.onreadystatechange = function () {
		if ( xmlHttp.readyState === 4 && xmlHttp.status === 200 && xmlHttp.responseText != undefined ) {
			if ( settings.debugLevel > 0 ) {
				console.log( "Raid configs recieved." );
			}
			raidConfigs = JSON.parse( xmlHttp.responseText );
			LoadSavedSettings();
			SetupControls();
			localStorage.setItem( "savedSettings", JSON.stringify( settings ) );
			SetupTable();
			LoadSavedRaids();
			if ( socket.connected ) {
				document.getElementById( "connection-status" ).classList.remove( "red" );
				document.getElementById( "connection-status" ).classList.add( "green" );
				document.getElementById( "connection-status-value" ).innerHTML = "UP";
			} else {
				document.getElementById( "connection-status" ).classList.remove( "green" );
				document.getElementById( "connection-status" ).classList.add( "red" );
				document.getElementById( "connection-status-value" ).innerHTML = "DOWN";
			}
			setInterval( function () {
				CheckConnectionStatus();
				if ( selectedRaidsArray.length === 0 ) {
					document.getElementById( "selected-raids" ).innerHTML = "No raids selected. Please search for a raid in the search bar above.";
				}
				for ( var i = raids.length - 1; i >= 0; i-- ) {
					UpdateRaidRow( raids[ i ] );
				}
			}, 500 );
		}
	};
	xmlHttp.open( "GET", '/getraids', true );
	xmlHttp.send();
};

function PlaySoundNotif( data ) {
	if ( settings.debugLevel > 0 ) {
		console.log( "Playing sound notif for: " + data.room );
		console.log( 'Sound Settings: Layout Orientation = "' + settings.layout.orientation + '", Are Sound Notifs On = "' + settings.notification.soundNotifOn + '", Sound Notif Choice = "' + settings.notification.soundNotifChoice + '", Sound Notif Volume = "' + settings.notification.soundNotifVolume + '"' );
	}
	if ( settings.layout.orientation === "horizontal" && settings.notification.soundNotifOn ) {
		try {
			if ( settings.debugLevel > 0 ) {
				console.log( "Trying to play sound notif..." );
			}
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
			if ( settings.debugLevel > 0 ) {
				console.log( "Played sound notif." );
			}
		} catch ( error ) {
			console.log( "Error playing sound notif: " + error );
		}
	} else if ( settings.layout.orientation === "vertical" ) {
		for ( var i = 0; i < individualSettings.length; i++ ) {
			if ( data.room === individualSettings[ i ].room ) {
				if ( individualSettings[ i ].settings.soundNotifOn ) {
					try {
						if ( settings.debugLevel > 0 ) {
							console.log( "Trying to play sound notif..." );
						}
						if ( individualSettings[ i ].settings.soundNotifChoice === "beeps" ) {
							beepsSoundNotif.volume = ( individualSettings[ i ].settings.soundNotifVolume / 100 );
							beepsSoundNotif.play();
						} else if ( individualSettings[ i ].settings.soundNotifChoice === "lily-event-ringring" ) {
							lilyRingRingSoundNotif.volume = ( individualSettings[ i ].settings.soundNotifVolume / 100 );
							lilyRingRingSoundNotif.play();
						} else if ( individualSettings[ i ].settings.soundNotifChoice === "andira-oniichan" ) {
							andiraOniichanSoundNotif.volume = ( individualSettings[ i ].settings.soundNotifVolume / 100 );
							andiraOniichanSoundNotif.play();
						} else if ( individualSettings[ i ].settings.soundNotifChoice === "titanfall-droppingnow" ) {
							titanfallDroppingNowSoundNotif.volume = ( individualSettings[ i ].settings.soundNotifVolume / 100 );
							titanfallDroppingNowSoundNotif.play();
						}
						if ( settings.debugLevel > 0 ) {
							console.log( "Played sound notif." );
						}
					} catch ( error ) {
						console.log( "Error playing sound notif: " + error );
					}
				}
			}
		}
	}
}

function SendDesktopNotif( data ) {
	if ( settings.debugLevel > 0 ) {
		console.log( "Sending desktop notif for: " + data.room );
		console.log( 'Desktop Settings: Layout Orientation = "' + settings.layout.orientation + '", Are Desktop Notifs On = "' + settings.notification.desktopNotifOn + '", Desktop Notif Size = "' + settings.notification.desktopNotifSize + '"' );
	}
	if ( settings.layout.orientation === "horizontal" && settings.notification.desktopNotifOn ) {
		if ( Notification.permission === "granted" ) {
			try {
				var raidConfig = FindRaidConfig( data.room );
				if ( settings.debugLevel > 0 ) {
					console.log( "Trying to send desktop notif..." );
				}
				var notification = null;
				var title = "";
				if ( data.language === "EN" ) {
					title = raidConfig.english;
				} else {
					title = raidConfig.japanese;
				}
				if ( settings.notification.desktopNotifSize === "small" ) {
					notification = new Notification( title, {
						body: "ID: " + data.id + "\nTweeter: " + data.user + "\nMessage: " + data.message,
						icon: raidConfig.image
					} );
				} else {
					notification = new Notification( title, {
						body: "ID: " + data.id,
						image: raidConfig.image
					} );
				}
				setTimeout( function () {
					notification.close();
				}, 5000 );
				notification.onclick = function ( event ) {
					event.preventDefault();
					var raid = document.getElementById( data.id );
					raid.click();
					SendJoinCommand( data.id )
					document.getElementById( data.id + '-btn' ).classList.remove( "primary" );
					document.getElementById( data.id + '-btn' ).classList.add( "negative" );
					notification.close();
				}
				if ( settings.debugLevel > 0 ) {
					console.log( "Sent desktop notif." );
				}
			} catch ( error ) {
				console.log( "Error sending desktop notif: " + error );
			}
		}
	} else if ( settings.layout.orientation === "vertical" ) {
		for ( var i = 0; i < individualSettings.length; i++ ) {
			if ( data.room === individualSettings[ i ].room ) {
				if ( individualSettings[ i ].settings.desktopNotifOn ) {
					var raidConfig = FindRaidConfig( data.room );
					if ( Notification.permission === "granted" ) {
						try {
							var raidConfig = FindRaidConfig( data.room );
							if ( settings.debugLevel > 0 ) {
								console.log( "Trying to send desktop notif..." );
							}
							var notification = null;
							var title = "";
							if ( data.language === "EN" ) {
								title = raidConfig.english;
							} else {
								title = raidConfig.japanese;
							}
							if ( individualSettings[ i ].settings.desktopNotifSize === "small" ) {
								notification = new Notification( title, {
									body: "ID: " + data.id + "\nTweeter: " + data.user + "\nMessage: " + data.message,
									icon: raidConfig.image
								} );
							} else {
								notification = new Notification( title, {
									body: "ID: " + data.id,
									image: raidConfig.image
								} );
							}
							setTimeout( function () {
								notification.close();
							}, 4000 );
							notification.onclick = function ( event ) {
								event.preventDefault();
								var raid = document.getElementById( data.id );
								raid.click();
								SendJoinCommand( data.id )
								document.getElementById( data.id + '-btn' ).classList.remove( "primary" );
								notification.close();
							}
							if ( settings.debugLevel > 0 ) {
								console.log( "Sent desktop notif." );
							}
						} catch ( error ) {
							console.log( "Error sending desktop notif: " + error );
						}
					}
				}
				break;
			}
		}
	}
}

function SendJoinCommand( id ) {
	try {
		document.getElementById( "viramate-api" ).contentWindow.postMessage( {
			type: "tryJoinRaid",
			id: id,
			raidCode: id
		}, "*" );
	} catch ( error ) {
		console.log( "Error sending message to Viramate: " + error );
	}
}

function ChangeDebugLevel( debugLevel ) {
	settings.debugLevel = debugLevel;
	localStorage.setItem( "savedSettings", JSON.stringify( settings ) );
	location.reload();
}
