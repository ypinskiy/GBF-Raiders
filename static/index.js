var socket = io.connect( '/' );
var raids = [];
var raidConfigs = [];
var selectedRaidsArray = [];
var individualSettings = [];

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
	}
};

socket.on( 'tweet', function ( data ) {
	if ( document.getElementById( data.id ) === null ) {
		raids.push( data );
		CreateRaidRow( data );
		PlaySoundNotif();
		SendDesktopNotif( data );
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

function FindRaid( id ) {
	var result = null;
	for ( var i = 0; i < raids.length; i++ ) {
		if ( raids[ i ].id === id ) {
			result = raids[ i ];
			break;
		}
	}
	return result;
}

function CreateRaidRow( data ) {
	if ( settings.layout.orientation === "horizontal" ) {
		if ( settings.layout.infoLevel === "compact" ) {
			CreateHorizontalCompactRaidRow( data );
		} else if ( settings.layout.infoLevel === "normal" ) {
			CreateHorizontalNormalRaidRow( data );
		} else {
			CreateHorizontalFullRaidRow( data );
		}
	} else {
		if ( settings.layout.infoLevel === "compact" ) {
			CreateVerticalCompactRaidRow( data );
		} else if ( settings.layout.infoLevel === "normal" ) {
			CreateVerticalNormalRaidRow( data );
		} else {
			CreateVerticalFullRaidRow( data );
		}
	}
}

function CreateHorizontalCompactRaidRow( data ) {
	var raidConfig = FindRaidConfig( data.room );
	var newLine = document.createElement( "tr" );
	newLine.id = data.id;
	newLine.classList.add( "copy-div" );
	newLine.dataset.clipboard = data.id;
	var imageTD = document.createElement( "td" );
	imageTD.innerHTML = '<div class="ui items"><div class="item"><div class="ui tiny image"><img src="' + raidConfig.image + '"></div><div class="content"><div class="header">' + raidConfig.english + '</div><div class="meta"><span>' + raidConfig.japanese + '</span></div></div></div>';
	var idTD = document.createElement( "td" );
	idTD.id = data.id + '-label';
	idTD.classList.add( "center", "aligned" );
	idTD.innerHTML = data.id;
	var joinTD = document.createElement( "td" );
	joinTD.classList.add( "center", "aligned" );
	var joinButton = document.createElement( "button" );
	if ( data.status === "unclicked" ) {
		joinButton.classList.add( "ui", "primary", "button", "right", "labeled", "icon", "toggle", "join-raid-btn" );
	} else if ( data.status === "error" ) {
		joinButton.classList.add( "ui", "negative", "button", "right", "labeled", "icon", "toggle", "join-raid-btn" );
	} else if ( data.status === "clicked" ) {
		joinButton.classList.add( "ui", "secondary", "button", "right", "labeled", "icon", "toggle", "join-raid-btn" );
	} else if ( data.status === "success" ) {
		joinButton.classList.add( "ui", "positive", "button", "right", "labeled", "icon", "toggle", "join-raid-btn" );
	}
	joinButton.id = data.id + '-btn';
	joinButton.innerHTML = 'Join Raid<i class="right sign in icon"></i>';
	joinTD.appendChild( joinButton );
	newLine.appendChild( imageTD );
	newLine.appendChild( idTD );
	newLine.appendChild( joinTD );
	joinButton.addEventListener( "click", function ( event ) {
		SendJoinCommand( event.target.id.substr( 0, 8 ) );
		joinButton.classList.remove( "primary" );
		joinButton.classList.add( "secondary" );
		data.status = "clicked";
	} );
	document.getElementById( "table-body" ).insertBefore( newLine, document.getElementById( "table-body" ).firstChild );
}

function CreateHorizontalNormalRaidRow( data ) {
	var raidConfig = FindRaidConfig( data.room );
	var newLine = document.createElement( "tr" );
	newLine.id = data.id;
	newLine.classList.add( "copy-div" );
	newLine.dataset.clipboard = data.id;
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
	if ( data.status === "unclicked" ) {
		joinButton.classList.add( "ui", "primary", "button", "right", "labeled", "icon", "toggle", "join-raid-btn" );
	} else if ( data.status === "error" ) {
		joinButton.classList.add( "ui", "negative", "button", "right", "labeled", "icon", "toggle", "join-raid-btn" );
	} else if ( data.status === "clicked" ) {
		joinButton.classList.add( "ui", "secondary", "button", "right", "labeled", "icon", "toggle", "join-raid-btn" );
	} else if ( data.status === "success" ) {
		joinButton.classList.add( "ui", "positive", "button", "right", "labeled", "icon", "toggle", "join-raid-btn" );
	}
	joinButton.id = data.id + '-btn';
	joinButton.innerHTML = 'Join Raid<i class="right sign in icon"></i>';
	joinTD.appendChild( joinButton );
	newLine.appendChild( imageTD );
	newLine.appendChild( idTD );
	newLine.appendChild( timeTD );
	newLine.appendChild( joinTD );
	joinButton.addEventListener( "click", function ( event ) {
		SendJoinCommand( event.target.id.substr( 0, 8 ) );
		joinButton.classList.remove( "primary" );
		joinButton.classList.add( "secondary" );
		data.status = "clicked";
	} );
	document.getElementById( "table-body" ).insertBefore( newLine, document.getElementById( "table-body" ).firstChild );
}

function CreateHorizontalFullRaidRow( data ) {
	var raidConfig = FindRaidConfig( data.room );
	var newLine = document.createElement( "tr" );
	newLine.id = data.id;
	newLine.classList.add( "copy-div" );
	newLine.dataset.clipboard = data.id;
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
	if ( data.status === "unclicked" ) {
		joinButton.classList.add( "ui", "primary", "button", "right", "labeled", "icon", "toggle", "join-raid-btn" );
	} else if ( data.status === "error" ) {
		joinButton.classList.add( "ui", "negative", "button", "right", "labeled", "icon", "toggle", "join-raid-btn" );
	} else if ( data.status === "clicked" ) {
		joinButton.classList.add( "ui", "secondary", "button", "right", "labeled", "icon", "toggle", "join-raid-btn" );
	} else if ( data.status === "success" ) {
		joinButton.classList.add( "ui", "positive", "button", "right", "labeled", "icon", "toggle", "join-raid-btn" );
	}
	joinButton.id = data.id + '-btn';
	joinButton.innerHTML = 'Join Raid<i class="right sign in icon"></i>';
	joinTD.appendChild( joinButton );
	newLine.appendChild( imageTD );
	newLine.appendChild( contentTD );
	newLine.appendChild( joinTD );
	joinButton.addEventListener( "click", function ( event ) {
		SendJoinCommand( event.target.id.substr( 0, 8 ) );
		joinButton.classList.remove( "primary" );
		joinButton.classList.add( "secondary" );
		data.status = "clicked";
	} );
	document.getElementById( "table-body" ).insertBefore( newLine, document.getElementById( "table-body" ).firstChild );
}

function CreateVerticalCompactRaidRow( data ) {
	var raidConfig = FindRaidConfig( data.room );
	var newLine = document.createElement( "tr" );
	newLine.id = data.id;
	newLine.classList.add( "copy-div" );
	newLine.dataset.clipboard = data.id;
	var idTD = document.createElement( "td" );
	idTD.id = data.id + '-label';
	idTD.classList.add( "center", "aligned" );
	idTD.innerHTML = data.id;
	var joinTD = document.createElement( "td" );
	joinTD.classList.add( "center", "aligned" );
	var joinButton = document.createElement( "button" );
	if ( data.status === "unclicked" ) {
		joinButton.classList.add( "ui", "primary", "button", "right", "labeled", "icon", "toggle", "join-raid-btn" );
	} else if ( data.status === "error" ) {
		joinButton.classList.add( "ui", "negative", "button", "right", "labeled", "icon", "toggle", "join-raid-btn" );
	} else if ( data.status === "clicked" ) {
		joinButton.classList.add( "ui", "secondary", "button", "right", "labeled", "icon", "toggle", "join-raid-btn" );
	} else if ( data.status === "success" ) {
		joinButton.classList.add( "ui", "positive", "button", "right", "labeled", "icon", "toggle", "join-raid-btn" );
	}
	joinButton.id = data.id + '-btn';
	joinButton.innerHTML = 'Join Raid<i class="right sign in icon"></i>';
	joinTD.appendChild( joinButton );
	newLine.appendChild( idTD );
	newLine.appendChild( joinTD );
	joinButton.addEventListener( "click", function ( event ) {
		SendJoinCommand( event.target.id.substr( 0, 8 ) );
		joinButton.classList.remove( "primary" );
		joinButton.classList.add( "secondary" );
		data.status = "clicked";
	} );
	document.getElementById( data.room + "-table-body" ).insertBefore( newLine, document.getElementById( data.room + "-table-body" ).firstChild );
}

function CreateVerticalNormalRaidRow( data ) {
	var raidConfig = FindRaidConfig( data.room );
	var newLine = document.createElement( "tr" );
	newLine.id = data.id;
	newLine.classList.add( "copy-div" );
	newLine.dataset.clipboard = data.id;
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
	if ( data.status === "unclicked" ) {
		joinButton.classList.add( "ui", "primary", "button", "right", "labeled", "icon", "toggle", "join-raid-btn" );
	} else if ( data.status === "error" ) {
		joinButton.classList.add( "ui", "negative", "button", "right", "labeled", "icon", "toggle", "join-raid-btn" );
	} else if ( data.status === "clicked" ) {
		joinButton.classList.add( "ui", "secondary", "button", "right", "labeled", "icon", "toggle", "join-raid-btn" );
	} else if ( data.status === "success" ) {
		joinButton.classList.add( "ui", "positive", "button", "right", "labeled", "icon", "toggle", "join-raid-btn" );
	}
	joinButton.id = data.id + '-btn';
	joinButton.innerHTML = 'Join Raid<i class="right sign in icon"></i>';
	joinTD.appendChild( joinButton );
	newLine.appendChild( idTD );
	newLine.appendChild( timeTD );
	newLine.appendChild( joinTD );
	joinButton.addEventListener( "click", function ( event ) {
		SendJoinCommand( event.target.id.substr( 0, 8 ) );
		joinButton.classList.remove( "primary" );
		joinButton.classList.add( "secondary" );
		data.status = "clicked";
	} );
	document.getElementById( data.room + "-table-body" ).insertBefore( newLine, document.getElementById( data.room + "-table-body" ).firstChild );
}

function CreateVerticalFullRaidRow( data ) {
	var raidConfig = FindRaidConfig( data.room );
	var newLine = document.createElement( "tr" );
	newLine.id = data.id;
	newLine.classList.add( "copy-div" );
	newLine.dataset.clipboard = data.id;
	var idTD = document.createElement( "td" );
	idTD.id = data.id + '-label';
	idTD.classList.add( "center", "aligned" );
	idTD.innerHTML = data.id;
	var messageTD = document.createElement( "td" );
	messageTD.classList.add( "center", "aligned" );
	messageTD.innerHTML = data.message;
	var timeTD = document.createElement( "td" );
	timeTD.id = data.id + '-time';
	timeTD.classList.add( "center", "aligned" );
	timeTD.innerHTML = "0 secs ago";
	var joinTD = document.createElement( "td" );
	joinTD.classList.add( "center", "aligned" );
	var joinButton = document.createElement( "button" );
	if ( data.status === "unclicked" ) {
		joinButton.classList.add( "ui", "primary", "button", "right", "labeled", "icon", "toggle", "join-raid-btn" );
	} else if ( data.status === "error" ) {
		joinButton.classList.add( "ui", "negative", "button", "right", "labeled", "icon", "toggle", "join-raid-btn" );
	} else if ( data.status === "clicked" ) {
		joinButton.classList.add( "ui", "secondary", "button", "right", "labeled", "icon", "toggle", "join-raid-btn" );
	} else if ( data.status === "success" ) {
		joinButton.classList.add( "ui", "positive", "button", "right", "labeled", "icon", "toggle", "join-raid-btn" );
	}
	joinButton.id = data.id + '-btn';
	joinButton.innerHTML = 'Join Raid<i class="right sign in icon"></i>';
	joinTD.appendChild( joinButton );
	newLine.appendChild( idTD );
	newLine.appendChild( messageTD );
	newLine.appendChild( timeTD );
	newLine.appendChild( joinTD );
	joinButton.addEventListener( "click", function ( event ) {
		SendJoinCommand( event.target.id.substr( 0, 8 ) );
		joinButton.classList.remove( "primary" );
		joinButton.classList.add( "secondary" );
		data.status = "clicked";
	} );
	document.getElementById( data.room + "-table-body" ).insertBefore( newLine, document.getElementById( data.room + "-table-body" ).firstChild );
}

function UpdateRaidRow( data ) {
	if ( raids.length > settings.layout.raidMaxResults ) {
		var raidDIV = document.getElementById( raids[ 0 ].id );
		if ( settings.layout.orientation === "horizontal" ) {
			document.getElementById( "table-body" ).removeChild( raidDIV );
		} else {
			document.getElementById( raids[ 0 ].room + "-table-body" ).removeChild( raidDIV );
		}
		raids.splice( 0, 1 );
	} else {
		var raidDIV = document.getElementById( data.id );
		if ( moment().diff( data.time, "seconds" ) > settings.layout.raidTimeout ) {
			if ( settings.layout.orientation === "horizontal" ) {
				document.getElementById( "table-body" ).removeChild( raidDIV );
			} else {
				document.getElementById( data.room + "-table-body" ).removeChild( raidDIV );
			}
			raids.splice( raids.indexOf( data ), 1 );
		} else {
			if ( settings.layout.infoLevel === "normal" || settings.layout.infoLevel === "full" ) {
				document.getElementById( data.id + '-time' ).innerHTML = moment().diff( data.time, "seconds" ) + ' secs ago';
			}
		}
	}
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
	} else {
		if ( document.getElementById( raid.room + "-card" ) === null ) {
			selectedRaidsArray.push( raid );
			individualSettings.push( {
				room: raid.room,
				settings: Object.assign( {}, settings.notification )
			} );
			if ( settings.layout.infoLevel === "compact" ) {
				AddSelectedVerticalCompactRaid( raid );
			} else if ( settings.layout.infoLevel === "normal" ) {
				AddSelectedVerticalNormalRaid( raid );
			} else {
				AddSelectedVerticalFullRaid( raid );
			}
			socket.emit( 'subscribe', {
				room: raid.room
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
		RemoveSelectedRaid( raid );
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
		RemoveSelectedRaid( raid );
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
		RemoveSelectedRaid( raid );
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

function RemoveSelectedRaid( raid ) {
	if ( settings.layout.orientation === "horizontal" ) {
		socket.emit( 'unsubscribe', {
			room: raid.room
		} );
		selectedRaidsArray.splice( selectedRaidsArray.indexOf( raid ), 1 );
		localStorage.setItem( "selectedRaids", JSON.stringify( selectedRaidsArray ) );
		document.getElementById( raid.room ).remove();
	} else {
		socket.emit( 'unsubscribe', {
			room: raid.room
		} );
		selectedRaidsArray.splice( selectedRaidsArray.indexOf( raid ), 1 );
		for ( var i = 0; i < individualSettings.length; i++ ) {
			if ( raid.room === individualSettings[ i ].room ) {
				individualSettings.splice( i, 1 );
				break;
			}
		}
		localStorage.setItem( "selectedRaids", JSON.stringify( selectedRaidsArray ) );
		document.getElementById( raid.room + "-card" ).remove();
		for ( var i = raids.length - 1; i >= 0; i-- ) {
			if ( raid.room === raids[ i ].room ) {
				raids.splice( i, 1 );
			}
		}
	}
}

function SetupTable() {
	if ( document.getElementById( "raid-table" ) !== null ) {
		document.getElementById( "raid-table" ).remove();
	}
	if ( document.getElementById( "raid-container" ) !== null ) {
		document.getElementById( "raid-container" ).remove();
	}
	if ( settings.layout.orientation === "horizontal" ) {
		if ( settings.layout.infoLevel === "normal" ) {
			CreateHorizontalNormalRaidTable();
		} else if ( settings.layout.infoLevel === "compact" ) {
			CreateHorizontalCompactRaidTable();
		} else {
			CreateHorizontalFullRaidTable();
		}
	} else {
		CreateVerticalRaidContainer();
	}
}

function CreateHorizontalCompactRaidTable() {
	var raidTable = document.createElement( "table" );
	raidTable.id = "raid-table";
	raidTable.classList.add( "ui", "blue", "celled", "selectable", "table", "compact" );
	if ( document.getElementById( "selected-raids-label" ) === null ) {
		var selectedRaidsDiv = document.createElement( "div" );
		selectedRaidsDiv.classList.add( "ui", "secondary", "inverted", "blue", "segment" );
		selectedRaidsDiv.innerHTML = '<div id="selected-raids-label">Selected Raids:</div><div id="selected-raids" class="ui segment">No raids selected. Please search for a raid in the search bar above.</div>';
		document.getElementById( "header" ).appendChild( selectedRaidsDiv );
	}
	raidTable.innerHTML = '<thead><tr><th class="center aligned nine wide">Raid Name</th><th class="center aligned single line three wide">Raid ID</th><th class="center aligned single line four wide">Join Raid</th></tr></thead>';
	var raidTableBody = document.createElement( "tbody" );
	raidTableBody.id = "table-body";
	raidTable.appendChild( raidTableBody );
	document.getElementById( "container" ).appendChild( raidTable );
}

function CreateHorizontalNormalRaidTable() {
	var raidTable = document.createElement( "table" );
	raidTable.id = "raid-table";
	raidTable.classList.add( "ui", "blue", "celled", "selectable", "table" );
	if ( document.getElementById( "selected-raids-label" ) === null ) {
		var selectedRaidsDiv = document.createElement( "div" );
		selectedRaidsDiv.classList.add( "ui", "secondary", "inverted", "blue", "segment" );
		selectedRaidsDiv.innerHTML = '<div id="selected-raids-label">Selected Raids:</div><div id="selected-raids" class="ui segment">No raids selected. Please search for a raid in the search bar above.</div>';
		document.getElementById( "header" ).appendChild( selectedRaidsDiv );
	}
	raidTable.classList.add( "padded" );
	raidTable.innerHTML = '<thead><tr><th class="center aligned eight wide">Raid Name</th><th class="center aligned single line two wide">Raid ID</th><th class="center aligned single line three wide">Time Tweeted</th><th class="center aligned single line three wide">Join Raid</th></tr></thead>';
	var raidTableBody = document.createElement( "tbody" );
	raidTableBody.id = "table-body";
	raidTable.appendChild( raidTableBody );
	document.getElementById( "container" ).appendChild( raidTable );
}

function CreateHorizontalFullRaidTable() {
	var raidTable = document.createElement( "table" );
	raidTable.id = "raid-table";
	raidTable.classList.add( "ui", "blue", "celled", "selectable", "table" );
	if ( document.getElementById( "selected-raids-label" ) === null ) {
		var selectedRaidsDiv = document.createElement( "div" );
		selectedRaidsDiv.classList.add( "ui", "secondary", "inverted", "blue", "segment" );
		selectedRaidsDiv.innerHTML = '<div id="selected-raids-label">Selected Raids:</div><div id="selected-raids" class="ui segment">No raids selected. Please search for a raid in the search bar above.</div>';
		document.getElementById( "header" ).appendChild( selectedRaidsDiv );
	}
	raidTable.classList.add( "padded" );
	raidTable.innerHTML = '<thead><tr><th class="center aligned four wide">Raid Image</th><th class="center aligned nine wide">Raid Content</th><th class="center aligned single line four wide">Join Info</th></tr></thead>';
	var raidTableBody = document.createElement( "tbody" );
	raidTableBody.id = "table-body";
	raidTable.appendChild( raidTableBody );
	document.getElementById( "container" ).appendChild( raidTable );
}

function CreateVerticalRaidContainer() {
	if ( document.getElementById( "selected-raids-label" ) !== null ) {
		document.getElementById( "selected-raids-label" ).parentElement.remove();
	}
	var raidContainer = document.createElement( "div" );
	raidContainer.id = "raid-container";
	if ( settings.layout.verticalStacking === "row" ) {
		raidContainer.classList.add( "rowed" );
	} else {
		raidContainer.classList.add( "stacking" );
	}
	raidContainer.innerHTML = CreateSettingsModalFrame();
	document.getElementById( "container" ).appendChild( raidContainer );
	document.getElementById( "modal-enable-notif" ).addEventListener( "click", function ( event ) {
		if ( document.getElementById( "modal-enable-notif" ).innerHTML === 'Disable Desktop Notifications<i class="right remove circle icon"></i>' ) {
			document.getElementById( "modal-enable-notif" ).innerHTML = 'Enable Desktop Notifications<i class="right check circle icon"></i>';
			document.getElementById( "modal-enable-notif" ).classList.remove( "negative" );
			document.getElementById( "modal-desktop-notif-size-control" ).classList.add( "input-control-disabled" );
			document.getElementById( "modal-desktop-notif-size-control" ).classList.remove( "input-control" );
			document.getElementById( "modal-desktop-notif-size-dropdown" ).classList.add( "disabled" );
		} else {
			document.getElementById( "modal-enable-notif" ).innerHTML = 'Disable Desktop Notifications<i class="right remove circle icon"></i>';
			document.getElementById( "modal-enable-notif" ).classList.add( "negative" );
			document.getElementById( "modal-desktop-notif-size-control" ).classList.remove( "input-control-disabled" );
			document.getElementById( "modal-desktop-notif-size-control" ).classList.add( "input-control" );
			document.getElementById( "modal-desktop-notif-size-dropdown" ).classList.remove( "disabled" );
		}
	} );
	document.getElementById( "modal-enable-sound" ).addEventListener( "click", function ( event ) {
		if ( document.getElementById( "modal-enable-sound" ).innerHTML === 'Disable Sound Notifications<i class="right alarm mute outline icon"></i>' ) {
			document.getElementById( "modal-enable-sound" ).innerHTML = 'Enable Sound Notifications<i class="right alarm outline icon"></i>';
			document.getElementById( "modal-enable-sound" ).classList.remove( "negative" );
			document.getElementById( "modal-sound-volume-control" ).classList.add( "slider-control-disabled" );
			document.getElementById( "modal-sound-volume-control" ).classList.remove( "slider-control" );
			document.getElementById( "modal-sound-volume-slider" ).disabled = true;
			document.getElementById( "modal-sound-choice-control" ).classList.add( "input-control-disabled" );
			document.getElementById( "modal-sound-choice-control" ).classList.remove( "input-control" );
			document.getElementById( "modal-sound-choice-dropdown" ).classList.add( "disabled" );
		} else {
			document.getElementById( "modal-enable-sound" ).innerHTML = 'Disable Sound Notifications<i class="right alarm mute outline icon"></i>';
			document.getElementById( "modal-enable-sound" ).classList.add( "negative" );
			document.getElementById( "modal-sound-volume-control" ).classList.remove( "slider-control-disabled" );
			document.getElementById( "modal-sound-volume-control" ).classList.add( "slider-control" );
			document.getElementById( "modal-sound-volume-slider" ).disabled = false;
			document.getElementById( "modal-sound-choice-control" ).classList.remove( "input-control-disabled" );
			document.getElementById( "modal-sound-choice-control" ).classList.add( "input-control" );
			document.getElementById( "modal-sound-choice-dropdown" ).classList.remove( "disabled" );
		}
	} );
	$( "#modal-desktop-notif-size-dropdown" ).dropdown();
	$( "#modal-sound-choice-dropdown" ).dropdown();
	document.getElementById( "settings-modal-save-btn" ).addEventListener( "click", function ( event ) {
		SaveIndividualSettings();
	} );
}

function CheckConnectionStatus() {
	if ( socket.connected ) {
		document.getElementById( "connection-status" ).classList.remove( "red" );
		document.getElementById( "connection-status" ).classList.add( "green" );
		document.getElementById( "connection-status-value" ).innerHTML = "UP";
	} else {
		document.getElementById( "connection-status" ).classList.remove( "green" );
		document.getElementById( "connection-status" ).classList.add( "red" );
		document.getElementById( "connection-status-value" ).innerHTML = "DOWN";
	}
}

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
		Object.assign( settings, JSON.parse( localStorage.getItem( "savedSettings" ) ) );
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

window.onload = function () {
	window.addEventListener( "message", onMessage, false );

	function onMessage( evt ) {
		if ( evt.data.type !== "result" ) {
			return;
		} else {
			if ( evt.data.result === "refill required" ) {
				document.getElementById( evt.data.id + '-btn' ).classList.remove( "secondary" );
				document.getElementById( evt.data.id + '-btn' ).classList.add( "negative" );
				FindRaid( evt.data.id ).status = "error";
				swal( {
					title: "No more BP!",
					text: "Please refill your BP or try again later.",
					imageUrl: "assets/stickers/waitup-sticker.png",
					imageSize: '150x150'
				} );
			} else if ( evt.data.result === "popup: This raid battle has already ended." ) {
				document.getElementById( evt.data.id + '-btn' ).classList.remove( "secondary" );
				document.getElementById( evt.data.id + '-btn' ).classList.add( "negative" );
				FindRaid( evt.data.id ).status = "error";
				swal( {
					title: "Raid has ended!",
					text: "Please try a different raid.",
					imageUrl: "assets/stickers/fail-sticker.png",
					imageSize: '150x150'
				} );
			} else if ( evt.data.result === "popup: This raid battle is full. You can't participate." ) {
				document.getElementById( evt.data.id + '-btn' ).classList.remove( "secondary" );
				document.getElementById( evt.data.id + '-btn' ).classList.add( "negative" );
				FindRaid( evt.data.id ).status = "error";
				swal( {
					title: "Raid is full!",
					text: "Please try a different raid.",
					imageUrl: "assets/stickers/sorry-sticker.png",
					imageSize: '150x150'
				} );
			} else if ( evt.data.result === "already in this raid" ) {
				document.getElementById( evt.data.id + '-btn' ).classList.remove( "secondary" );
				document.getElementById( evt.data.id + '-btn' ).classList.add( "positive" );
				FindRaid( evt.data.id ).status = "error";
				swal( {
					title: "You are already in this raid!",
					text: "Please try a different raid.",
					imageUrl: "assets/stickers/whoops-sticker.png",
					imageSize: '150x150'
				} );
			} else if ( evt.data.result === "ok" ) {
				document.getElementById( evt.data.id + '-btn' ).classList.remove( "secondary" );
				document.getElementById( evt.data.id + '-btn' ).classList.add( "positive" );
				FindRaid( evt.data.id ).status = "success";
			}
		}
	}

	LoadSavedSettings();
	SetupControls();
	localStorage.setItem( "savedSettings", JSON.stringify( settings ) );
	SetupTable();
	LoadSavedRaids();

	setInterval( function () {
		CheckConnectionStatus();
		if ( selectedRaidsArray.length === 0 ) {
			document.getElementById( "selected-raids" ).innerHTML = "No raids selected. Please search for a raid in the search bar above.";
		}
		for ( var i = raids.length - 1; i >= 0; i-- ) {
			UpdateRaidRow( raids[ i ] );
		}
	}, 500 );
};

function PlaySoundNotif() {
	if ( settings.layout.orientation === "horizontal" && settings.notification.soundNotifOn ) {
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
	} else if ( settings.layout.orientation === "vertical" ) {
		for ( var i = 0; i < individualSettings.length; i++ ) {
			if ( data.room === individualSettings[ i ].room ) {
				if ( individualSettings[ i ].settings.soundNotifOn ) {
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
				}
			}
		}
	}
}

function SendDesktopNotif( data ) {
	if ( settings.layout.orientation === "horizontal" && settings.notification.desktopNotifOn ) {
		var raidConfig = FindRaidConfig( data.room );
		if ( Notification.permission === "granted" ) {
			var notification = null;
			var title = "";
			if ( data.language === "EN" ) {
				title = raidConfig.english;
			} else {
				title = raidConfig.japanese;
			}
			if ( settings.notification.desktopNotifSize === "small" ) {
				notification = new Notification( title, {
					body: "ID: " + data.id,
					icon: raidConfig.image
				} );
			} else {
				notification = new Notification( title, {
					body: "ID: " + data.id,
					image: raidConfig.image
				} );
			}
			notification.onclick = function ( event ) {
				event.preventDefault();
				var raid = document.getElementById( data.id );
				raid.click();
				SendJoinCommand( data.id )
				document.getElementById( data.id + '-btn' ).classList.remove( "primary" );
				document.getElementById( data.id + '-btn' ).classList.add( "negative" );
				notification.close();
			}
		}
	} else if ( settings.layout.orientation === "vertical" ) {
		for ( var i = 0; i < individualSettings.length; i++ ) {
			if ( data.room === individualSettings[ i ].room ) {
				if ( individualSettings[ i ].settings.desktopNotifOn ) {
					var raidConfig = FindRaidConfig( data.room );
					if ( Notification.permission === "granted" ) {
						var notification = null;
						var title = "";
						if ( data.language === "EN" ) {
							title = raidConfig.english;
						} else {
							title = raidConfig.japanese;
						}
						if ( individualSettings[ i ].settings.desktopNotifSize === "small" ) {
							notification = new Notification( title, {
								body: "ID: " + data.id,
								icon: raidConfig.image
							} );
						} else {
							notification = new Notification( title, {
								body: "ID: " + data.id,
								image: raidConfig.image
							} );
						}
						notification.onclick = function ( event ) {
							event.preventDefault();
							var raid = document.getElementById( data.id );
							raid.click();
							SendJoinCommand( data.id )
							document.getElementById( data.id + '-btn' ).classList.remove( "primary" );
							document.getElementById( data.id + '-btn' ).classList.add( "negative" );
							notification.close();
						}
					}
				}
				break;
			}
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

function SendJoinCommand( id ) {
	document.getElementById( "viramate-api" ).contentWindow.postMessage( {
		type: "tryJoinRaid",
		id: id,
		raidCode: id
	}, "*" );
}
