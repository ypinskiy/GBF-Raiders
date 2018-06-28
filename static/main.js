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
	version: "3.8",
	newsSeen: false,
	cardSlots: 8,
	disablePopups: false,
	strikeTime: "",
	disableJoined: false,
	viramateID: "fgpokpknehglcioijejfeebigdnbnokj"
};

var statistics = {
	"succeded": {
		"total": 0,
		"individual": []
	},
	"failed": {
		"total": 0,
		"individual": []
	}
};

function CheckConnectionStatus() {
	if ( socket.connected && wasDown ) {
		document.getElementById( "connection-status" ).classList.remove( "red" );
		document.getElementById( "connection-status" ).classList.add( "green" );
		document.getElementById( "connection-status-value" ).innerHTML = "UP";
		logger.AddLog( "info", "Recovering from connection down..." );
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

function AddStatistic( id, succeded ) {
	var raidConfig = FindRaidConfig( FindRaid( id ).room );
	if ( succeded ) {
		if ( statistics.succeded.individual.filter( stat => { return stat.room == raidConfig.english; } ).length > 0 ) {
			var statIndex = statistics.succeded.individual.findIndex( stat => { return stat.room == raidConfig.english; } );
			statistics.succeded.individual[ statIndex ].count++;
		} else {
			statistics.succeded.individual.push( { "room": raidConfig.english, "count": 1 } );
		}
		statistics.succeded.total++;
	} else {
		if ( statistics.failed.individual.filter( stat => { return stat.room == raidConfig.english; } ).length > 0 ) {
			var statIndex = statistics.failed.individual.findIndex( stat => { return stat.room == raidConfig.english; } );
			statistics.failed.individual[ statIndex ].count++;
		} else {
			statistics.failed.individual.push( { "room": raidConfig.english, "count": 1 } );
		}
		statistics.failed.total++;
	}
}

function ChangeButtonStatus( event, id ) {
	if ( event === "refill required" ) {
		document.getElementById( id + '-btn' ).classList.remove( "secondary" );
		document.getElementById( id + '-btn' ).classList.remove( "negative" );
		document.getElementById( id + '-btn' ).classList.add( "yellow" );
		document.getElementById( id + '-btn' ).innerHTML = 'No BP<i class="right quarter thermometer icon"></i>';
		FindRaid( id ).status = "error";
	} else if ( event === "popup: This raid battle has already ended." ) {
		document.getElementById( id + '-btn' ).classList.remove( "secondary" );
		document.getElementById( id + '-btn' ).classList.add( "negative", "blocked" );
		document.getElementById( id + '-btn' ).innerHTML = 'Raid Over<i class="right hourglass empty icon"></i>';
		document.getElementById( id + '-btn' ).disabled = true;
		FindRaid( id ).status = "error";
	} else if ( event === "api disabled" ) {
		document.getElementById( id + '-btn' ).classList.remove( "secondary" );
		document.getElementById( id + '-btn' ).classList.remove( "negative" );
		document.getElementById( id + '-btn' ).classList.add( "orange" );
		document.getElementById( id + '-btn' ).innerHTML = 'Viramate Disabled<i class="right power icon"></i>';
		FindRaid( id ).status = "error";
	} else if ( event === "No granblue tab found" ) {
		document.getElementById( id + '-btn' ).classList.remove( "secondary" );
		document.getElementById( id + '-btn' ).classList.remove( "negative" );
		document.getElementById( id + '-btn' ).classList.add( "orange" );
		document.getElementById( id + '-btn' ).innerHTML = 'No Granblue<i class="right help icon"></i>';
		FindRaid( id ).status = "error";
	} else if ( event === "popup: This raid battle is full. You can't participate." ) {
		document.getElementById( id + '-btn' ).classList.remove( "secondary" );
		document.getElementById( id + '-btn' ).classList.add( "negative", "blocked" );
		document.getElementById( id + '-btn' ).innerHTML = 'Full Raid<i class="right users icon"></i>';
		document.getElementById( id + '-btn' ).disabled = true;
		FindRaid( id ).status = "error";
	} else if ( event === "popup: The number that you entered doesn't match any battle." ) {
		document.getElementById( id + '-btn' ).classList.remove( "secondary" );
		document.getElementById( id + '-btn' ).classList.remove( "negative" );
		document.getElementById( id + '-btn' ).classList.add( "yellow", "blocked" );
		document.getElementById( id + '-btn' ).innerHTML = 'Unknown ID<i class="right question icon"></i>';
		document.getElementById( id + '-btn' ).disabled = true;
		FindRaid( id ).status = "error";
	} else if ( event === "popup: Your rank isn't high enough to participate in this battle.<br><div class='pop-text-yellow'>Requirements: Rank 101</div>" ) {
		document.getElementById( id + '-btn' ).classList.remove( "secondary" );
		document.getElementById( id + '-btn' ).classList.add( "negative", "blocked" );
		document.getElementById( id + '-btn' ).innerHTML = 'Rank Low<i class="right user plus icon"></i>';
		document.getElementById( id + '-btn' ).disabled = true;
		FindRaid( id ).status = "error";
	} else if ( event === "popup: Your rank isn't high enough to participate in this battle.<br><div class='pop-text-yellow'>Requirements: Rank 50</div>" ) {
		document.getElementById( id + '-btn' ).classList.remove( "secondary" );
		document.getElementById( id + '-btn' ).classList.add( "negative", "blocked" );
		document.getElementById( id + '-btn' ).innerHTML = 'Rank Low<i class="right user plus icon"></i>';
		document.getElementById( id + '-btn' ).disabled = true;
		FindRaid( id ).status = "error";
	} else if ( event === "popup: Your rank isn't high enough to participate in this battle.<br><div class='pop-text-yellow'>Requirements: Rank 40</div>" ) {
		document.getElementById( id + '-btn' ).classList.remove( "secondary" );
		document.getElementById( id + '-btn' ).classList.add( "negative", "blocked" );
		document.getElementById( id + '-btn' ).innerHTML = 'Rank Low<i class="right user plus icon"></i>';
		document.getElementById( id + '-btn' ).disabled = true;
		FindRaid( id ).status = "error";
	} else if ( event === "popup: Check your pending battles." ) {
		document.getElementById( id + '-btn' ).classList.remove( "secondary" );
		document.getElementById( id + '-btn' ).classList.remove( "negative" );
		document.getElementById( id + '-btn' ).classList.add( "yellow" );
		document.getElementById( id + '-btn' ).innerHTML = 'Pending Battles<i class="right help icon"></i>';
		document.getElementById( id + '-btn' ).disabled = true;
		FindRaid( id ).status = "error";
	} else if ( event === "already in this raid" ) {
		document.getElementById( id + '-btn' ).classList.remove( "secondary" );
		document.getElementById( id + '-btn' ).classList.remove( "negative" );
		document.getElementById( id + '-btn' ).classList.add( "positive" );
		document.getElementById( id + '-btn' ).innerHTML = 'Already Joined<i class="right hand peace icon"></i>';
		if ( settings.disableJoined ) {
			document.getElementById( id + '-btn' ).disabled = true;
			document.getElementById( id + '-btn' ).classList.add( "blocked" );
		}
		FindRaid( id ).status = "success";
	} else if ( event === "ok" ) {
		document.getElementById( id + '-btn' ).classList.remove( "secondary" );
		document.getElementById( id + '-btn' ).classList.remove( "negative" );
		document.getElementById( id + '-btn' ).classList.add( "positive" );
		document.getElementById( id + '-btn' ).innerHTML = 'Just Joined<i class="right hand peace icon"></i>';
		if ( settings.disableJoined ) {
			document.getElementById( id + '-btn' ).disabled = true;
			document.getElementById( id + '-btn' ).classList.add( "blocked" );
		}
		FindRaid( id ).status = "success";
	}
}

function onMessage( evt ) {
	logger.AddLog( "info", "Viramate message recieved." );
	if ( evt.data.type !== "result" ) {
		logger.AddLog( "info", "Viramate message not a result." );
		return;
	} else {
		logger.AddLog( "info", "Viramate message is a result.", evt.data );
		ChangeButtonStatus( evt.data.result, evt.data.id );
		if ( evt.data.result === "refill required" ) {
			if ( !settings.disablePopups ) {
				swal( {
					title: "No more BP!",
					text: "Please refill your BP or try again later.",
					icon: "assets/stickers/waitup-sticker.png",
					imageSize: '150x150',
					timer: 2000
				} );
			}
		} else if ( evt.data.result === "popup: This raid battle has already ended." ) {
			AddStatistic( evt.data.id, false );
			socket.emit( 'raid-over', {
				room: FindRaid( evt.data.id ).room,
				id: evt.data.id,
				event: evt.data.result
			} );
			if ( !settings.disablePopups ) {
				swal( {
					title: "Raid has ended!",
					text: "Please try a different raid.",
					icon: "assets/stickers/fail-sticker.png",
					imageSize: '150x150',
					timer: 2000
				} );
			}
		} else if ( evt.data.result.error === "api disabled" ) {
			if ( !settings.disablePopups ) {
				swal( {
					title: "Viramate Web API is disabled!",
					text: "Please enable the web API in Viramate, refresh your GBF tab, and try again.",
					icon: "/assets/stickers/aboutthat-sticker.png",
					imageSize: '150x150',
					timer: 2000
				} );
			}
		} else if ( evt.data.result.error === "No granblue tab found" ) {
			if ( !settings.disablePopups ) {
				swal( {
					title: "You don't have Granblue open!",
					text: "Please open the game and then try joining a raid.",
					icon: "assets/stickers/aboutthat-sticker.png",
					imageSize: '150x150',
					timer: 2000
				} );
			}
		} else if ( evt.data.result === "popup: This raid battle is full. You can't participate." ) {
			AddStatistic( evt.data.id, false );
			socket.emit( 'raid-over', {
				room: FindRaid( evt.data.id ).room,
				id: evt.data.id,
				event: evt.data.result
			} );
			if ( !settings.disablePopups ) {
				swal( {
					title: "Raid is full!",
					text: "Please try a different raid.",
					icon: "assets/stickers/sorry-sticker.png",
					imageSize: '150x150',
					timer: 2000
				} );
			}
		} else if ( evt.data.result === "popup: The number that you entered doesn't match any battle." ) {
			AddStatistic( evt.data.id, false );
			socket.emit( 'raid-over', {
				room: FindRaid( evt.data.id ).room,
				id: evt.data.id,
				event: evt.data.result
			} );
			if ( !settings.disablePopups ) {
				swal( {
					title: "Error with Raid ID!",
					text: "Sorry, but that raid ID doesn't match any raid.",
					icon: "/assets/stickers/totallycrushed-sticker.png",
					imageSize: '150x150',
					timer: 2000
				} );
			}
		} else if ( evt.data.result === "popup: Your rank isn't high enough to participate in this battle.<br><div class='pop-text-yellow'>Requirements: Rank 101</div>" ) {
			AddStatistic( evt.data.id, false );
			if ( !settings.disablePopups ) {
				swal( {
					title: "Sorry!",
					text: "Your rank is too low! You need to be at least rank 101.",
					icon: "/assets/stickers/totallycrushed-sticker.png",
					imageSize: '150x150',
					timer: 2000
				} );
			}
		} else if ( evt.data.result === "popup: Check your pending battles." ) {
			if ( !settings.disablePopups ) {
				swal( {
					title: "Check your pending battles!",
					text: "You are a part of too many battles.",
					icon: "assets/stickers/whoops-sticker.png",
					imageSize: '150x150',
					timer: 2000
				} );
			}
		} else if ( evt.data.result === "popup: Your rank isn't high enough to participate in this battle.<br><div class='pop-text-yellow'>Requirements: Rank 50</div>" ) {
			AddStatistic( evt.data.id, false );
			if ( !settings.disablePopups ) {
				swal( {
					title: "Sorry!",
					text: "Your rank is too low! You need to be at least rank 50.",
					icon: "/assets/stickers/totallycrushed-sticker.png",
					imageSize: '150x150',
					timer: 2000
				} );
			}
		} else if ( evt.data.result === "popup: Your rank isn't high enough to participate in this battle.<br><div class='pop-text-yellow'>Requirements: Rank 40</div>" ) {
			AddStatistic( evt.data.id, false );
			if ( !settings.disablePopups ) {
				swal( {
					title: "Sorry!",
					text: "Your rank is too low! You need to be at least rank 40.",
					icon: "/assets/stickers/totallycrushed-sticker.png",
					imageSize: '150x150',
					timer: 2000
				} );
			}
		} else if ( evt.data.result === "already in this raid" ) {
			if ( !settings.disablePopups ) {
				swal( {
					title: "You are already in this raid!",
					text: "Please try a different raid.",
					icon: "assets/stickers/whoops-sticker.png",
					imageSize: '150x150',
					timer: 2000
				} );
			}
		} else if ( evt.data.result === "ok" ) {
			AddStatistic( evt.data.id, true );
			FindRaid( evt.data.id ).status = "success";
		}
	}
}

window.addEventListener( 'load', function () {
	logger.AddLog( "info", "Window loaded.", "Page version: " + settings.version );
	if ( !navigator.onLine ) {
		logger.AddLog( "info", "Page loaded offline." );
		swal( {
			title: "You are offline!",
			text: "Please make sure your internet is connected or try again later.",
			icon: "assets/stickers/nope-sticker.png",
			imageSize: '150x150'
		} );
	}
	window.addEventListener( 'online', function ( event ) {
		logger.AddLog( "info", "Page came back online." );
		swal( {
			title: "You came back online!",
			text: "Things should start working again!",
			icon: "assets/stickers/iknowthatalready-sticker.png",
			imageSize: '150x150'
		} );
	} );

	window.addEventListener( 'offline', function ( event ) {
		logger.AddLog( "info", "Page is offline." );
		swal( {
			title: "You are offline!",
			text: "Please make sure your internet is connected or try again later.",
			icon: "assets/stickers/nope-sticker.png",
			imageSize: '150x150'
		} );
	} );

	window.addEventListener( 'message', onMessage, false );

	logger.AddLog( "info", "Getting raid configs..." );
	fetch( "/getraids" ).then( function ( response ) {
		return response.json();
	} ).then( function ( raidResults ) {
		logger.AddLog( "info", "Raid configs recieved." );
		raidConfigs = raidResults;
		LoadSavedSettings();
		try {
			SetupControls();
		} catch ( err ) {
			logger.AddLog( "error", `Error setting up controls: ${err.message}`, err );
		}

		socket = io.connect( '/' );
		socket.on( 'tweet', function ( data ) {
			logger.AddLog( "info", "Tweet recieved: " + data.room, data );
			document.getElementById( "connection-status" ).classList.remove( "red" );
			document.getElementById( "connection-status" ).classList.add( "green" );
			document.getElementById( "connection-status-value" ).innerHTML = "UP";
			noTwitter = false;
			if ( document.getElementById( data.id ) === null ) {
				raids.push( data );
				CreateRaidRow( data );
				PlaySoundNotif( data );
				SendDesktopNotif( data );
			}
		} );
		socket.on( 'warning', function ( data ) {
			logger.AddLog( "info", "Warning recieved: " + data.room, data );
			if ( data.type == "twitter" ) {
				document.getElementById( "connection-status" ).classList.remove( "green" );
				document.getElementById( "connection-status" ).classList.add( "red" );
				document.getElementById( "connection-status-value" ).innerHTML = "DOWN";
				noTwitter = true;
			}
		} );
		socket.on( 'raid-over', function ( data ) {
			logger.AddLog( "info", "Raid Over recieved: " + data.room, data );
			ChangeButtonStatus( data.event, data.id );
		} );
		if ( socket.connected ) {
			document.getElementById( "connection-status" ).classList.remove( "red" );
			document.getElementById( "connection-status" ).classList.add( "green" );
			document.getElementById( "connection-status-value" ).innerHTML = "UP";
		} else {
			document.getElementById( "connection-status" ).classList.remove( "green" );
			document.getElementById( "connection-status" ).classList.add( "red" );
			document.getElementById( "connection-status-value" ).innerHTML = "DOWN";
		}

		LoadSavedRaids();

		try {
			setInterval( function () {
				if ( selectedRaidsArray.length === 0 && document.getElementById( "selected-raids" ) ) {
					document.getElementById( "selected-raids" ).innerHTML = "No raids selected. Please search for a raid in the search bar above.";
				}
			}, 500 );
			setInterval( function () {
				for ( var i = raids.length - 1; i >= 0; i-- ) {
					UpdateRaidRow( raids[ i ] );
				}
			}, 2000 );
			setInterval( function () {
				if ( !noTwitter ) {
					CheckConnectionStatus();
				}
			}, 10000 );
			logger.AddLog( "info", "Setup of page intervals complete." );
		} catch ( err ) {
			logger.AddLog( "error", `Error setting up page interval: ${err.message}`, err );
		}

	} );
} );

function PlaySoundNotif( data ) {
	logger.AddLog( "info", `Playing sound notif for: ${data.room}`, settings.notification );
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
			logger.AddLog( "info", `Played sound notif for: ${data.room}`, settings.notification );
		} catch ( error ) {
			logger.AddLog( "error", `Error playing sound notif for: ${data.room}`, error, settings.notification );
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
						logger.AddLog( "info", `Played sound notif for: ${data.room}`, settings.notification );
					} catch ( error ) {
						logger.AddLog( "error", `Error playing sound notif for: ${data.room}`, error, settings.notification );
					}
				}
			}
		}
	}
}

function SendDesktopNotif( data ) {
	logger.AddLog( "info", `Sending desktop notif for: ${data.room}`, settings.notification );
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
					SendJoinCommand( data.id )
					document.getElementById( data.id + '-btn' ).classList.remove( "primary" );
					document.getElementById( data.id + '-btn' ).classList.add( "negative" );
					notification.close();
				}
				logger.AddLog( "info", `Sent desktop notif for: ${data.room}`, settings.notification );
			} catch ( error ) {
				logger.AddLog( "error", `Error sending desktop notif for: ${data.room}`, error, settings.notification );
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
							logger.AddLog( "info", `Sent desktop notif for: ${data.room}`, settings.notification );
						} catch ( error ) {
							logger.AddLog( "error", `Error sending desktop notif for: ${data.room}`, error, settings.notification );
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
		logger.AddLog( "error", `Error sending join command to Viramate: ${error.message}`, error );
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
			logger.AddLog( "error", `Error setting StrikeTime reminder: ${err.message}`, err );
		}
	} else {
		if ( document.getElementById( "time-until" ) ) {
			document.getElementById( "time-until" ).remove();
		}
	}
}
