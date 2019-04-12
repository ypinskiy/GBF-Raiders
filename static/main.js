var socket = null;
var raids = [];
var raidConfigs = [];
var selectedRaidsArray = [];
var individualSettings = [];
var wasDown = false;
var noTwitter = false;

var funfNotif = new Audio( '/assets/sounds/funf.mp3' );
var beepsSoundNotif = new Audio( '/assets/sounds/Beeps_Appear.wav' );
var lilyRingRingSoundNotif = new Audio( '/assets/sounds/Lily_Event_RingRing.mp3' );
var andiraOniichanSoundNotif = new Audio( '/assets/sounds/Andira_Oniichan.mp3' );
var titanfallDroppingNowSoundNotif = new Audio( '/assets/sounds/Titanfall_DroppingNow.mp3' );
var hoeeeeeSoundNotif = new Audio( '/assets/sounds/HOEEEEE.mp3' );
var alarmFoghornSoundNotif = new Audio( '/assets/sounds/ALARM_Foghorn_full_stereo.wav' );
var alarmSubmarineSoundNotif = new Audio( '/assets/sounds/ALARM_Submarine_Slow_loop_stereo.wav' );
var chargeSciFiSweepSoundNotif = new Audio( '/assets/sounds/CHARGE_Sci-Fi_Sweep.wav' );
var femaleGoGoGoSoundNotif = new Audio( '/assets/sounds/female_go_go_go.ogg' );
var maleGoGoGoSoundNotif = new Audio( '/assets/sounds/male_go_go_go.ogg' );
var femaleHurryUpSoundNotif = new Audio( '/assets/sounds/female_hurry_up.ogg' );
var maleHurryUpSoundNotif = new Audio( '/assets/sounds/male_hurry_up.ogg' );
var jingleNESSoundNotif = new Audio( '/assets/sounds/jingles_NES16.ogg' );
var jingleSaxSoundNotif = new Audio( '/assets/sounds/jingles_SAX00.ogg' );
var jingleSteel0SoundNotif = new Audio( '/assets/sounds/jingles_STEEL00.ogg' );
var jingleSteel16SoundNotif = new Audio( '/assets/sounds/jingles_STEEL16.ogg' );
var magicSpellSoundNotif = new Audio( '/assets/sounds/MAGIC_SPELL_Attacking.wav' );
var zapThreeToneSoundNotif = new Audio( '/assets/sounds/zapThreeToneUp.mp3' );
var zapTwoToneSoundNotif = new Audio( '/assets/sounds/zapTwoTone2.mp3' );
var customSoundNotif = new Audio();

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
		nightMode: false,
		toolbarShrink: false
	},
	version: "5.2",
	newsSeen: false,
	cardSlots: 8,
	strikeTime: "",
	paused: false
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

function ResetSite() {
	localStorage.clear();
	window.history.pushState( {}, document.title, "/" );
	location.reload( true );
}

function CheckConnectionStatus() {
	if ( socket.connected && wasDown ) {
		document.getElementById( "connection-status" ).classList.remove( "red" );
		document.getElementById( "connection-status" ).classList.add( "green" );
		document.getElementById( "connection-status-value" ).innerHTML = "UP";
		console.log( "Recovering from connection down..." );
		if ( localStorage.getItem( "selectedRaids" ) ) {
			var tempSelectedRaids = JSON.parse( localStorage.getItem( "selectedRaids" ) );
			for ( var i = 0; i < tempSelectedRaids.length; i++ ) {
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
				} else {
					console.log( "Raid updates are paused." );
				}
			} else {
				console.log( "Raid already exists on page." );
			}
		} );
		socket.on( 'warning', function ( data ) {
			console.log( "Warning recieved: " + data.room, data );
			if ( data.type == "twitter" ) {
				document.getElementById( "connection-status" ).classList.remove( "green" );
				document.getElementById( "connection-status" ).classList.add( "red" );
				document.getElementById( "connection-status-value" ).innerHTML = "DOWN";
				noTwitter = true;
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
					for ( var i = raids.length - 1; i >= 0; i-- ) {
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

function PlaySoundNotif( data ) {
	console.log( `Playing sound notif for: ${data.room}`, settings.notification );
	if ( settings.layout.orientation === "horizontal" && settings.notification.soundNotifOn ) {
		try {
			switch ( settings.notification.soundNotifChoice ) {
				case "alarm-foghorn":
					alarmFoghornSoundNotif.volume = ( settings.notification.soundNotifVolume / 100 );
					alarmFoghornSoundNotif.play();
					break;
				case "alarm-submarine":
					alarmSubmarineSoundNotif.volume = ( settings.notification.soundNotifVolume / 100 );
					alarmSubmarineSoundNotif.play();
					break;
				case "scifi-sweep":
					chargeSciFiSweepSoundNotif.volume = ( settings.notification.soundNotifVolume / 100 );
					chargeSciFiSweepSoundNotif.play();
					break;
				case "female-gogogo":
					femaleGoGoGoSoundNotif.volume = ( settings.notification.soundNotifVolume / 100 );
					femaleGoGoGoSoundNotif.play();
					break;
				case "male-gogogo":
					maleGoGoGoSoundNotif.volume = ( settings.notification.soundNotifVolume / 100 );
					maleGoGoGoSoundNotif.play();
					break;
				case "female-hurryup":
					femaleHurryUpSoundNotif.volume = ( settings.notification.soundNotifVolume / 100 );
					femaleHurryUpSoundNotif.play();
					break;
				case "male-hurryup":
					maleHurryUpSoundNotif.volume = ( settings.notification.soundNotifVolume / 100 );
					maleHurryUpSoundNotif.play();
					break;
				case "jingle-nes":
					jingleNESSoundNotif.volume = ( settings.notification.soundNotifVolume / 100 );
					jingleNESSoundNotif.play();
					break;
				case "jingle-sax":
					jingleSaxSoundNotif.volume = ( settings.notification.soundNotifVolume / 100 );
					jingleSaxSoundNotif.play();
					break;
				case "jingle-steel":
					jingleSteel0SoundNotif.volume = ( settings.notification.soundNotifVolume / 100 );
					jingleSteel0SoundNotif.play();
					break;
				case "jingle-steel2":
					jingleSteel16SoundNotif.volume = ( settings.notification.soundNotifVolume / 100 );
					jingleSteel16SoundNotif.play();
					break;
				case "zap-3tone":
					zapThreeToneSoundNotif.volume = ( settings.notification.soundNotifVolume / 100 );
					zapThreeToneSoundNotif.play();
					break;
				case "zap-2tone":
					zapTwoToneSoundNotif.volume = ( settings.notification.soundNotifVolume / 100 );
					zapTwoToneSoundNotif.play();
					break;
				case "magic-spell":
					magicSpellSoundNotif.volume = ( settings.notification.soundNotifVolume / 100 );
					magicSpellSoundNotif.play();
					break;
				case "custom":
					customSoundNotif.volume = ( settings.notification.soundNotifVolume / 100 );
					customSoundNotif.play();
					break;
				case "beeps":
					beepsSoundNotif.volume = ( settings.notification.soundNotifVolume / 100 );
					beepsSoundNotif.play();
					break;
				case "lily-event-ringring":
					lilyRingRingSoundNotif.volume = ( settings.notification.soundNotifVolume / 100 );
					lilyRingRingSoundNotif.play();
					break;
				case "andira-oniichan":
					andiraOniichanSoundNotif.volume = ( settings.notification.soundNotifVolume / 100 );
					andiraOniichanSoundNotif.play();
					break;
				case "titanfall-droppingnow":
					titanfallDroppingNowSoundNotif.volume = ( settings.notification.soundNotifVolume / 100 );
					titanfallDroppingNowSoundNotif.play();
					break;
				case "sakura-hoeeeee":
					hoeeeeeSoundNotif.volume = ( settings.notification.soundNotifVolume / 100 );
					hoeeeeeSoundNotif.play();
					break;
				case "funf-dancho":
					funfNotif.volume = ( settings.notification.soundNotifVolume / 100 );
					funfNotif.play();
					break;
			}
			console.log( `Played sound notif for: ${data.room}`, settings.notification );
		} catch ( error ) {
			console.log( `Error playing sound notif for: ${data.room}`, error, settings.notification );
		}
	} else if ( settings.layout.orientation === "vertical" ) {
		for ( var i = 0; i < individualSettings.length; i++ ) {
			if ( data.room === individualSettings[ i ].room ) {
				if ( individualSettings[ i ].settings.soundNotifOn ) {
					try {
						switch ( individualSettings[ i ].settings.soundNotifChoice ) {
							case "alarm-foghorn":
								alarmFoghornSoundNotif.volume = ( individualSettings[ i ].settings.soundNotifVolume / 100 );
								alarmFoghornSoundNotif.play();
								break;
							case "alarm-submarine":
								alarmSubmarineSoundNotif.volume = ( individualSettings[ i ].settings.soundNotifVolume / 100 );
								alarmSubmarineSoundNotif.play();
								break;
							case "scifi-sweep":
								chargeSciFiSweepSoundNotif.volume = ( individualSettings[ i ].settings.soundNotifVolume / 100 );
								chargeSciFiSweepSoundNotif.play();
								break;
							case "female-gogogo":
								femaleGoGoGoSoundNotif.volume = ( individualSettings[ i ].settings.soundNotifVolume / 100 );
								femaleGoGoGoSoundNotif.play();
								break;
							case "male-gogogo":
								maleGoGoGoSoundNotif.volume = ( individualSettings[ i ].settings.soundNotifVolume / 100 );
								maleGoGoGoSoundNotif.play();
								break;
							case "female-hurryup":
								femaleHurryUpSoundNotif.volume = ( individualSettings[ i ].settings.soundNotifVolume / 100 );
								femaleHurryUpSoundNotif.play();
								break;
							case "male-hurryup":
								maleHurryUpSoundNotif.volume = ( individualSettings[ i ].settings.soundNotifVolume / 100 );
								maleHurryUpSoundNotif.play();
								break;
							case "jingle-nes":
								jingleNESSoundNotif.volume = ( individualSettings[ i ].settings.soundNotifVolume / 100 );
								jingleNESSoundNotif.play();
								break;
							case "jingle-sax":
								jingleSaxSoundNotif.volume = ( individualSettings[ i ].settings.soundNotifVolume / 100 );
								jingleSaxSoundNotif.play();
								break;
							case "jingle-steel":
								jingleSteel0SoundNotif.volume = ( individualSettings[ i ].settings.soundNotifVolume / 100 );
								jingleSteel0SoundNotif.play();
								break;
							case "jingle-steel2":
								jingleSteel16SoundNotif.volume = ( individualSettings[ i ].settings.soundNotifVolume / 100 );
								jingleSteel16SoundNotif.play();
								break;
							case "zap-3tone":
								zapThreeToneSoundNotif.volume = ( individualSettings[ i ].settings.soundNotifVolume / 100 );
								zapThreeToneSoundNotif.play();
								break;
							case "zap-2tone":
								zapTwoToneSoundNotif.volume = ( individualSettings[ i ].settings.soundNotifVolume / 100 );
								zapTwoToneSoundNotif.play();
								break;
							case "magic-spell":
								magicSpellSoundNotif.volume = ( individualSettings[ i ].settings.soundNotifVolume / 100 );
								magicSpellSoundNotif.play();
								break;
							case "custom":
								customSoundNotif.volume = ( individualSettings[ i ].settings.soundNotifVolume / 100 );
								customSoundNotif.play();
								break;
							case "beeps":
								beepsSoundNotif.volume = ( individualSettings[ i ].settings.soundNotifVolume / 100 );
								beepsSoundNotif.play();
								break;
							case "lily-event-ringring":
								lilyRingRingSoundNotif.volume = ( individualSettings[ i ].settings.soundNotifVolume / 100 );
								lilyRingRingSoundNotif.play();
								break;
							case "andira-oniichan":
								andiraOniichanSoundNotif.volume = ( individualSettings[ i ].settings.soundNotifVolume / 100 );
								andiraOniichanSoundNotif.play();
								break;
							case "titanfall-droppingnow":
								titanfallDroppingNowSoundNotif.volume = ( individualSettings[ i ].settings.soundNotifVolume / 100 );
								titanfallDroppingNowSoundNotif.play();
								break;
							case "sakura-hoeeeee":
								hoeeeeeSoundNotif.volume = ( individualSettings[ i ].settings.soundNotifVolume / 100 );
								hoeeeeeSoundNotif.play();
								break;
							case "funf-dancho":
								funfNotif.volume = ( individualSettings[ i ].settings.soundNotifVolume / 100 );
								funfNotif.play();
								break;
						}
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
				var raidConfig = FindRaidConfig( data.room );
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
					var raidLabel = document.getElementById( data.id + '-label' );
					if ( raidLabel !== null ) {
						if ( window.getSelection ) {
							raidLabel.focus();
							var selection = window.getSelection();
							var range = document.createRange();
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
		for ( var i = 0; i < individualSettings.length; i++ ) {
			if ( data.room === individualSettings[ i ].room ) {
				if ( individualSettings[ i ].settings.desktopNotifOn ) {
					var raidConfig = FindRaidConfig( data.room );
					if ( Notification.permission === "granted" ) {
						try {
							var raidConfig = FindRaidConfig( data.room );
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
								var raidLabel = document.getElementById( data.id + '-label' );
								if ( raidLabel !== null ) {
									if ( window.getSelection ) {
										raidLabel.focus();
										var selection = window.getSelection();
										var range = document.createRange();
										range.selectNodeContents( raidLabel );
										selection.removeAllRanges();
										selection.addRange( range );
										document.execCommand( "copy" );
									}
								}
								SendJoinCommand( data.id )
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
