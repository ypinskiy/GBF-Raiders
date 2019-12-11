let socket = null;
let raids = [];
let raidConfigs = [];
let selectedRaidsArray = [];
let individualSettings = [];
let wasDown = false;
let noTwitter = false;

let soundNotifs = {
	"funf-dancho": '/assets/sounds/funf.mp3',
	"beeps": '/assets/sounds/Beeps_Appear.wav',
	"lily-event-ringring": '/assets/sounds/Lily_Event_RingRing.mp3',
	"andira-oniichan": '/assets/sounds/Andira_Oniichan.mp3',
	"titanfall-droppingnow": '/assets/sounds/Titanfall_DroppingNow.mp3',
	"sakura-hoeeeee": '/assets/sounds/HOEEEEE.mp3',
	"alarm-foghorn": '/assets/sounds/ALARM_Foghorn_full_stereo.wav',
	"alarm-submarine": '/assets/sounds/ALARM_Submarine_Slow_loop_stereo.wav',
	"scifi-sweep": '/assets/sounds/CHARGE_Sci-Fi_Sweep.wav',
	"female-gogogo": '/assets/sounds/female_go_go_go.ogg',
	"male-gogogo": '/assets/sounds/male_go_go_go.ogg',
	"female-hurryup": '/assets/sounds/female_hurry_up.ogg',
	"male-hurryup": '/assets/sounds/male_hurry_up.ogg',
	"jingle-nes": '/assets/sounds/jingles_NES16.ogg',
	"jingle-sax": '/assets/sounds/jingles_SAX00.ogg',
	"jingle-steel": '/assets/sounds/jingles_STEEL00.ogg',
	"jingle-steel2": '/assets/sounds/jingles_STEEL16.ogg',
	"zap-3tone": '/assets/sounds/zapThreeToneUp.mp3',
	"zap-2tone": '/assets/sounds/zapTwoTone2.mp3',
	"magic-spell": '/assets/sounds/MAGIC_SPELL_Attacking.wav'
};

let selectedSoundNotif = new Audio();

let settings = {
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
		nightMode: false,
		toolbarShrink: false
	},
	version: "5.8",
	newsSeen: false,
	cardSlots: 8,
	strikeTime: "",
	paused: false,
	autoCopy: false
};

toastr.options = {
	"closeButton": false,
	"debug": false,
	"newestOnTop": false,
	"progressBar": false,
	"positionClass": "toast-top-center",
	"preventDuplicates": false,
	"onclick": null,
	"showDuration": "300",
	"hideDuration": "1000",
	"timeOut": "5000",
	"extendedTimeOut": "1000",
	"showEasing": "swing",
	"hideEasing": "linear",
	"showMethod": "fadeIn",
	"hideMethod": "fadeOut"
}

if ( !window.chrome ) {
	console.log( "Detected browser is not Chrome. Changing to preloading css..." );
	const preloadedLinks = [ "https://fonts.googleapis.com/css?family=Open+Sans", "semantic/dist/semantic.min.css", "darken.css", "sliders.css", "main.css" ];
	for ( let i = 0; i < preloadedLinks.length; i++ ) {
		let preloadLink = document.createElement( "link" );
		preloadLink.href = preloadedLinks[ i ];
		preloadLink.rel = "stylesheet";
		document.head.appendChild( preloadLink );
	}
}

async function ResetSite() {
	localStorage.clear();
	sessionStorage.clear();
	window.history.pushState( {}, document.title, "/" );
	if ( currentRegistration != null ) {
		const allCaches = await caches.keys();
		const cacheDeletionPromises = allCaches.map( cache => caches.delete( cache ) );
		await Promise.all( [ currentRegistration.unregister(), ...cacheDeletionPromises ] );
		currentRegistration.update();
	}
	location.reload( true );
}

function CheckConnectionStatus() {
	if ( socket.connected && wasDown ) {
		document.getElementById( "connection-status" ).classList.remove( "red" );
		document.getElementById( "connection-status" ).classList.add( "green" );
		document.getElementById( "connection-status-value" ).innerHTML = "UP";
		console.log( "Recovering from connection down..." );
		if ( localStorage.getItem( "selectedRaids" ) ) {
			let tempSelectedRaids = JSON.parse( localStorage.getItem( "selectedRaids" ) );
			for ( let i = 0; i < tempSelectedRaids.length; i++ ) {
				socket.emit( 'subscribe', {
					room: tempSelectedRaids[ i ]
				} );
			}
		}
		wasDown = false;
	} else if ( !socket.connected ) {
		document.getElementById( "connection-status" ).classList.remove( "green" );
		document.getElementById( "connection-status" ).classList.add( "red" );
		document.getElementById( "connection-status-value" ).innerHTML = "DOWN";
		wasDown = true;
	}
}

window.addEventListener( 'load', function () {
	console.log( "Window loaded.", "Page version: " + settings.version );

	console.log( "Getting raid configs..." );
	fetch( "/getraids", { cache: 'no-store' } ).then( function ( response ) {
		return response.json();
	} ).then( function ( raidResults ) {
		console.log( "Raid configs recieved." );
		raidConfigs = raidResults;
		LoadSavedSettings();
		try {
			SetupControls();
		} catch ( err ) {
			console.log( `Error setting up controls: ${err.message}`, err );
		}

		socket = io.connect( ':8080/' );
		document.getElementById( "connection-status" ).classList.remove( "red" );
		document.getElementById( "connection-status" ).classList.add( "green" );
		document.getElementById( "connection-status-value" ).innerHTML = "UP";
		socket.on( 'tweet', function ( data ) {
			console.log( "Tweet recieved: " + data.room );
			document.getElementById( "connection-status" ).classList.remove( "red" );
			document.getElementById( "connection-status" ).classList.add( "green" );
			document.getElementById( "connection-status-value" ).innerHTML = "UP";
			noTwitter = false;
			if ( document.getElementById( data.id ) === null ) {
				if ( !settings.paused ) {
					raids.push( data );
					CreateRaidRow( data );
					PlaySoundNotif( data );
					SendDesktopNotif( data );
					if ( settings.autoCopy ) {
						console.log( "Autocopying raid id: " + data.id );
						let raidLabel = document.getElementById( data.id + '-label' );
						if ( raidLabel !== null ) {
							if ( window.getSelection ) {
								raidLabel.focus();
								let selection = window.getSelection();
								let range = document.createRange();
								range.selectNodeContents( raidLabel );
								selection.removeAllRanges();
								selection.addRange( range );
								document.execCommand( "copy" );
								if ( window.getSelection ) {
									if ( window.getSelection().empty ) { // Chrome
										window.getSelection().empty();
									} else if ( window.getSelection().removeAllRanges ) { // Firefox
										window.getSelection().removeAllRanges();
									}
								} else if ( document.selection ) { // IE?
									document.selection.empty();
								}
							}
						}
					} else {
						console.log( "Autocopy set to off." );
					}
				} else {
					console.log( "Raid updates are paused." );
				}
			} else {
				console.log( "Raid already exists on page." );
			}
		} );
		socket.on( 'warning', function ( data ) {
			console.log( "Warning recieved:", data );
			if ( data.type == "twitter" ) {
				document.getElementById( "connection-status" ).classList.remove( "green" );
				document.getElementById( "connection-status" ).classList.add( "red" );
				document.getElementById( "connection-status-value" ).innerHTML = "DOWN";
				noTwitter = true;
			}
		} );
		socket.on( 'maint', function ( isMaint ) {
			console.log( `Maintinence message recieved: isMaint is ${isMaint}` );
			if ( isMaint ) {
				document.getElementById( "maint-message" ).classList.remove( "hidden" );
			} else {
				document.getElementById( "maint-message" ).classList.add( "hidden" );
			}
		} );
		CheckConnectionStatus();
		LoadSavedRaids();

		try {
			setInterval( function () {
				if ( selectedRaidsArray.length === 0 && document.getElementById( "selected-raids" ) ) {
					document.getElementById( "selected-raids" ).innerHTML = "No raids selected. Please search for a raid in the search bar above.";
				}
			}, 500 );
			setInterval( function () {
				if ( raids.length > 0 ) {
					TrimExtraRaids();
					for ( let i = raids.length - 1; i >= 0; i-- ) {
						UpdateRaidRow( raids[ i ] );
					}
				}
			}, 1000 );
			setInterval( function () {
				if ( !noTwitter ) {
					CheckConnectionStatus();
				}
			}, 10000 );
			setInterval( function () {
				fetch( "/getraids", { cache: 'no-store' } ).then( function ( response ) {
					return response.json();
				} ).then( function ( raidResults ) {
					console.log( "Raid configs recieved." );
					raidConfigs = raidResults;
				} );
			}, 7200000 );
			console.log( "Setup of page intervals complete." );
		} catch ( err ) {
			console.log( `Error setting up page interval: ${err.message}`, err );
		}
	} );
} );

function PlaySoundNotif( data = { room: "sound-test" } ) {
	console.log( `Playing sound notif for: ${data.room}`, settings.notification );
	if ( settings.layout.orientation === "horizontal" && settings.notification.soundNotifOn ) {
		try {
			selectedSoundNotif.volume = ( settings.notification.soundNotifVolume / 100 );
			selectedSoundNotif.play();
			console.log( `Played sound notif for: ${data.room}`, settings.notification );
		} catch ( error ) {
			console.log( `Error playing sound notif for: ${data.room}`, error, settings.notification );
		}
	} else if ( settings.layout.orientation === "vertical" ) {
		for ( let i = 0; i < individualSettings.length; i++ ) {
			if ( data.room === individualSettings[ i ].room ) {
				if ( individualSettings[ i ].settings.soundNotifOn ) {
					try {
						selectedSoundNotif.src = soundNotifs[ individualSettings[ i ].settings.soundNotifChoice ];
						selectedSoundNotif.volume = ( individualSettings[ i ].settings.soundNotifVolume / 100 );
						selectedSoundNotif.play();
						console.log( `Played sound notif for: ${data.room}`, settings.notification );
					} catch ( error ) {
						console.log( `Error playing sound notif for: ${data.room}`, error, settings.notification );
					}
				}
			}
		}
	}
}

function SendDesktopNotif( data ) {
	console.log( `Sending desktop notif for: ${data.room}`, settings.notification );
	if ( settings.layout.orientation === "horizontal" && settings.notification.desktopNotifOn ) {
		if ( Notification.permission === "granted" ) {
			try {
				let raidConfig = FindRaidConfig( data.room );
				let notification = null;
				let title = "";
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
					let raidLabel = document.getElementById( data.id + '-label' );
					if ( raidLabel !== null ) {
						if ( window.getSelection ) {
							raidLabel.focus();
							let selection = window.getSelection();
							let range = document.createRange();
							range.selectNodeContents( raidLabel );
							selection.removeAllRanges();
							selection.addRange( range );
							document.execCommand( "copy" );
						}
					}
					notification.close();
				}
				console.log( `Sent desktop notif for: ${data.room}`, settings.notification );
			} catch ( error ) {
				console.log( `Error sending desktop notif for: ${data.room}`, error, settings.notification );
			}
		}
	} else if ( settings.layout.orientation === "vertical" ) {
		for ( let i = 0; i < individualSettings.length; i++ ) {
			if ( data.room === individualSettings[ i ].room ) {
				if ( individualSettings[ i ].settings.desktopNotifOn ) {
					let raidConfig = FindRaidConfig( data.room );
					if ( Notification.permission === "granted" ) {
						try {
							let raidConfig = FindRaidConfig( data.room );
							let notification = null;
							let title = "";
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
								let raidLabel = document.getElementById( data.id + '-label' );
								if ( raidLabel !== null ) {
									if ( window.getSelection ) {
										raidLabel.focus();
										let selection = window.getSelection();
										let range = document.createRange();
										range.selectNodeContents( raidLabel );
										selection.removeAllRanges();
										selection.addRange( range );
										document.execCommand( "copy" );
									}
								}
								document.getElementById( data.id + '-btn' ).classList.remove( "primary" );
								document.getElementById( data.id + '-btn' ).classList.add( "secondary" );
								notification.close();
							}
							console.log( `Sent desktop notif for: ${data.room}`, settings.notification );
						} catch ( error ) {
							console.log( `Error sending desktop notif for: ${data.room}`, error, settings.notification );
						}
					}
				}
				break;
			}
		}
	}
}

function GetFilteredRaids() {
	let filter = document.getElementById( "filter-input" );
	let result = [];
	switch ( filter.value ) {
		case 'none':
			result = raidConfigs;
			break;
		case "current":
			result = raidConfigs.filter( ( config ) => { return config.category == "Current Event"; } );
			break;
		case "unf":
			result = raidConfigs.filter( ( config ) => { return config.category == "Unite and Fight"; } );
			break;
		case "rotb":
			result = raidConfigs.filter( ( config ) => { return config.category == "Rise of the Beasts"; } );
			break;
		case "events":
			result = raidConfigs.filter( ( config ) => { return config.category == "Event"; } );
			break;
		case "low":
			result = raidConfigs.filter( ( config ) => { return config.category == "Low Level"; } );
			break;
		case "primarch":
			result = raidConfigs.filter( ( config ) => { return config.category == "Primarch"; } );
			break;
		case "omega":
			result = raidConfigs.filter( ( config ) => { return config.category == "Tier 1" || config.category == "Tier 2" || config.category == "Omega"; } );
			break;
		case "nightmare":
			result = raidConfigs.filter( ( config ) => { return config.category == "Nightmare" || config.category == "Nightmare Omega"; } );
			break;
		case "impossible":
			result = raidConfigs.filter( ( config ) => { return config.category == "Impossible" || config.category == "Impossible Nightmare" || config.category == "Impossible Ultimate" || config.category == "Impossible Tier 1" || config.category == "Impossible Tier 3" || config.category == "Impossible Omega" || config.category == "Impossible Omega II"; } );
			break;
		case 'fire':
			result = raidConfigs.filter( ( config ) => { return config.element == "Fire"; } );
			break;
		case 'water':
			result = raidConfigs.filter( ( config ) => { return config.element == "Water"; } );
			break;
		case 'earth':
			result = raidConfigs.filter( ( config ) => { return config.element == "Earth"; } );
			break;
		case 'wind':
			result = raidConfigs.filter( ( config ) => { return config.element == "Wind"; } );
			break;
		case 'light':
			result = raidConfigs.filter( ( config ) => { return config.element == "Light"; } );
			break;
		case 'dark':
			result = raidConfigs.filter( ( config ) => { return config.element == "Dark"; } );
			break;
		default:
			result = raidConfigs;
			break;
	}
	return result;
}

function SetTime() {
	if ( settings.strikeTime && settings.strikeTime != "" ) {
		if ( document.getElementById( "time-until" ) == null ) {
			let timeSpan = document.createElement( "span" );
			timeSpan.innerHTML = "Strike Time: Not Set Yet";
			timeSpan.id = "time-until";
			timeSpan.value = settings.strikeTime;
			document.getElementById( "dashboard" ).insertBefore( timeSpan, document.getElementById( "searcher" ) );
		}
		try {
			let timeDisplay = document.getElementById( "time-until" );
			let unparsedTime = settings.strikeTime.split( ":" );
			let hour = parseInt( unparsedTime[ 0 ] );
			let minute = parseInt( unparsedTime[ 1 ] );
			let hoursDiff = moment().hour( hour ).minute( minute ).second( 0 ).diff( moment(), "hours", true );
			let minutesDiff = moment().hour( hour ).minute( minute ).second( 0 ).diff( moment(), "minutes", true );
			if ( hoursDiff > 0 ) {
				timeDisplay.innerHTML = "Strike Time: " + Math.floor( hoursDiff ) + "h and " + Math.floor( minutesDiff - ( 60 * Math.floor( hoursDiff ) ) ) + "m until";
				timeDisplay.classList.remove( "strike-time" );
			} else if ( hoursDiff < -1 ) {
				hoursDiff = moment().add( 1, "days" ).hour( hour ).minute( minute ).second( 0 ).diff( moment(), "hours", true );
				minutesDiff = moment().add( 1, "days" ).hour( hour ).minute( minute ).second( 0 ).diff( moment(), "minutes", true );
				timeDisplay.innerHTML = "Strike Time: " + Math.floor( hoursDiff ) + "h and " + Math.floor( minutesDiff - ( 60 * Math.floor( hoursDiff ) ) ) + "m until";
				timeDisplay.classList.remove( "strike-time" );
			} else if ( hoursDiff < 0 ) {
				let minutesLeftDiff = moment().hour( hour ).minute( minute ).second( 0 ).diff( moment(), "minutes", true );
				timeDisplay.innerHTML = "Strike Time: " + Math.floor( 60 + parseInt( minutesLeftDiff ) ) + " minutes left";
				timeDisplay.classList.add( "strike-time" );
			}
		} catch ( err ) {
			console.log( `Error setting StrikeTime reminder: ${err.message}`, err );
		}
	} else {
		if ( document.getElementById( "time-until" ) ) {
			document.getElementById( "time-until" ).remove();
		}
	}
}
