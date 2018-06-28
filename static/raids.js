function FindRaidConfig( room ) {
	console.log( "Trying to find raid config for room: " + room );
	var result = raidConfigs.filter( ( raid ) => { return raid.room == room; } );
	if ( result.length > 0 ) {
		console.log( "Found raid config:" );
		console.dir( result[ 0 ] );
	} else {
		console.log( "Error finding raid config." );
	}
	return result[ 0 ] || {};
}

function FindRaid( id ) {
	console.log( "Trying to find raid for id: " + id );
	var result = null;
	for ( var i = 0; i < raids.length; i++ ) {
		if ( raids[ i ].id === id ) {
			result = raids[ i ];
			console.log( "Found raid: " );
			console.dir( raids[ i ] );
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
	console.log( "Creating Horizontal Compact Raid Row for data: " );
	console.dir( data );
	var raidConfig = FindRaidConfig( data.room );
	var newLine = document.createElement( "tr" );
	newLine.id = data.id;
	newLine.classList.add( "copy-div", "smaller" );
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
	try {
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
	} catch ( error ) {
		console.log( "Error appending Horizontal Compact Raid Row: " + error );
	}
}

function CreateHorizontalNormalRaidRow( data ) {
	console.log( "Creating Horizontal Normal Raid Row for data: " );
	console.dir( data );
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
	try {
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
	} catch ( error ) {
		console.log( "Error appending Horizontal Normal Raid Row: " + error );
	}
}

function CreateHorizontalFullRaidRow( data ) {
	console.log( "Creating Horizontal Full Raid Row for data: " );
	console.dir( data );
	var raidConfig = FindRaidConfig( data.room );
	var newLine = document.createElement( "tr" );
	newLine.id = data.id;
	newLine.classList.add( "copy-div" );
	newLine.dataset.clipboard = data.id;
	var imageTD = document.createElement( "td" );
	imageTD.classList.add( "center", "aligned", "larger" );
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
	try {
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
	} catch ( error ) {
		console.log( "Error appending Horizontal Full Raid Row: " + error );
	}
}

function CreateVerticalCompactRaidRow( data ) {
	console.log( "Creating Vertical Compact Raid Row for data: " );
	console.dir( data );
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
	try {
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
	} catch ( error ) {
		console.log( "Error appending Vertical Compact Raid Row: " + error );
	}
}

function CreateVerticalNormalRaidRow( data ) {
	console.log( "Creating Vertical Normal Raid Row for data: " );
	console.dir( data );
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
	try {
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
	} catch ( error ) {
		console.log( "Error appending Vertical Normal Raid Row: " + error );
	}
}

function CreateVerticalFullRaidRow( data ) {
	console.log( "Creating Vertical Normal Raid Row for data: " );
	console.dir( data );
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
	try {
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
	} catch ( error ) {
		console.log( "Error appending Vertical Full Raid Row: " + error );
	}
}

function UpdateRaidRow( data ) {
	if ( settings.layout.orientation === "horizontal" ) {
		if ( raids.length > settings.layout.raidMaxResults ) {
			console.log( 'Too many raids (' + raids.length + ') for raidMaxResults: ' + settings.layout.raidMaxResults );
			try {
				var raidDIV = document.getElementById( raids[ 0 ].id );
				document.getElementById( "table-body" ).removeChild( raidDIV );
				raids.splice( 0, 1 );
			} catch ( error ) {
				console.log( "Error removing raid row that was over max results: " + error );
			}
		} else {
			var raidDIV = document.getElementById( data.id );
			if ( moment().diff( data.time, "seconds" ) > settings.layout.raidTimeout ) {
				console.log( 'Raid too old(' + moment().diff( data.time, "seconds" ) + ') for selected timeout: ' + settings.layout.raidTimeout );
				try {
					document.getElementById( "table-body" ).removeChild( raidDIV );
					raids.splice( raids.indexOf( data ), 1 );
				} catch ( error ) {
					console.log( "Error removing raid row that too old: " + error );
				}
			} else {
				if ( settings.layout.infoLevel === "normal" || settings.layout.infoLevel === "full" ) {
					document.getElementById( data.id + '-time' ).innerHTML = moment().diff( data.time, "seconds" ) + ' secs ago';
				}
			}
		}
	} else {
		if ( raids.filter( raid => raid.room === data.room ).length > settings.layout.raidMaxResults ) {
			var roomedRaids = raids.filter( raid => raid.room === data.room );
			console.log( 'Too many raids (' + roomedRaids.length + ') in room ' + data.room + ' for raidMaxResults: ' + settings.layout.raidMaxResults );
			try {
				var raidDIV = document.getElementById( roomedRaids[ 0 ].id );
				document.getElementById( roomedRaids[ 0 ].room + "-table-body" ).removeChild( raidDIV );
				raids.splice( raids.indexOf( roomedRaids[ 0 ] ), 1 );
			} catch ( error ) {
				console.log( "Error removing raid row that was over max results: " + error );
			}
		} else {
			var raidDIV = document.getElementById( data.id );
			if ( moment().diff( data.time, "seconds" ) > settings.layout.raidTimeout ) {
				console.log( 'Raid too old(' + moment().diff( data.time, "seconds" ) + ') for selected timeout: ' + settings.layout.raidTimeout );
				try {
					document.getElementById( data.room + "-table-body" ).removeChild( raidDIV );
					raids.splice( raids.indexOf( data ), 1 );
				} catch ( error ) {
					console.log( "Error removing raid row that too old: " + error );
				}
			} else {
				if ( settings.layout.infoLevel === "normal" || settings.layout.infoLevel === "full" ) {
					document.getElementById( data.id + '-time' ).innerHTML = moment().diff( data.time, "seconds" ) + ' secs ago';
				}
			}
		}
	}
}

function SetupTable() {
	console.log( "Setting up table..." );
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
	console.log( "Creating Horizontal Compact raid table..." );
	var raidTable = document.createElement( "table" );
	raidTable.id = "raid-table";
	raidTable.classList.add( "ui", "blue", "celled", "unstackable", "table", "compact" );
	if ( document.getElementById( "selected-raids-label" ) === null ) {
		var selectedRaidsDiv = document.createElement( "div" );
		selectedRaidsDiv.classList.add( "ui", "secondary", "inverted", "blue", "segment" );
		selectedRaidsDiv.id = "selected-raids-container";
		selectedRaidsDiv.innerHTML = '<div id="selected-raids-label">Selected Raids:</div><div id="selected-raids" class="ui segment">No raids selected. Please search for a raid in the search bar above.</div>';
		document.getElementById( "header" ).appendChild( selectedRaidsDiv );
	}
	raidTable.innerHTML = '<thead><tr><th class="center aligned nine wide">Raid Name</th><th class="center aligned single line three wide">Raid ID</th><th class="center aligned single line four wide">Join Raid</th></tr></thead>';
	var raidTableBody = document.createElement( "tbody" );
	raidTableBody.id = "table-body";
	try {
		raidTable.appendChild( raidTableBody );
		document.getElementById( "container" ).appendChild( raidTable );
	} catch ( error ) {
		console.log( "Error appending Horizontal Compact raid table: " + error );
	}
}

function CreateHorizontalNormalRaidTable() {
	console.log( "Creating Horizontal Normal raid table..." );
	var raidTable = document.createElement( "table" );
	raidTable.id = "raid-table";
	raidTable.classList.add( "ui", "blue", "unstackable", "celled", "compact", "table" );
	if ( document.getElementById( "selected-raids-label" ) === null ) {
		var selectedRaidsDiv = document.createElement( "div" );
		selectedRaidsDiv.classList.add( "ui", "secondary", "inverted", "blue", "segment" );
		selectedRaidsDiv.id = "selected-raids-container";
		selectedRaidsDiv.innerHTML = '<div id="selected-raids-label">Selected Raids:</div><div id="selected-raids" class="ui segment">No raids selected. Please search for a raid in the search bar above.</div>';
		document.getElementById( "header" ).appendChild( selectedRaidsDiv );
	}
	raidTable.innerHTML = '<thead><tr><th class="center aligned eight wide">Raid Name</th><th class="center aligned single line two wide">Raid ID</th><th class="center aligned single line three wide">Time Tweeted</th><th class="center aligned single line three wide">Join Raid</th></tr></thead>';
	var raidTableBody = document.createElement( "tbody" );
	raidTableBody.id = "table-body";
	try {
		raidTable.appendChild( raidTableBody );
		document.getElementById( "container" ).appendChild( raidTable );
	} catch ( error ) {
		console.log( "Error appending Horizontal Normal raid table: " + error );
	}
}

function CreateHorizontalFullRaidTable() {
	console.log( "Creating Horizontal Full raid table..." );
	var raidTable = document.createElement( "table" );
	raidTable.id = "raid-table";
	raidTable.classList.add( "ui", "blue", "unstackable", "celled", "compact", "table" );
	if ( document.getElementById( "selected-raids-label" ) === null ) {
		var selectedRaidsDiv = document.createElement( "div" );
		selectedRaidsDiv.classList.add( "ui", "secondary", "inverted", "blue", "segment" );
		selectedRaidsDiv.id = "selected-raids-container";
		selectedRaidsDiv.innerHTML = '<div id="selected-raids-label">Selected Raids:</div><div id="selected-raids" class="ui segment">No raids selected. Please search for a raid in the search bar above.</div>';
		document.getElementById( "header" ).appendChild( selectedRaidsDiv );
	}
	raidTable.innerHTML = '<thead><tr><th class="center aligned four wide">Raid Image</th><th class="center aligned nine wide">Raid Content</th><th class="center aligned single line four wide">Join Info</th></tr></thead>';
	var raidTableBody = document.createElement( "tbody" );
	raidTableBody.id = "table-body";
	try {
		raidTable.appendChild( raidTableBody );
		document.getElementById( "container" ).appendChild( raidTable );
	} catch ( error ) {
		console.log( "Error appending Horizontal Full raid table: " + error );
	}
}

function CreateVerticalRaidContainer() {
	console.log( "Creating Vertical raid container..." );
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
	try {
		raidContainer.innerHTML = CreateSettingsModalFrame();
		document.getElementById( "container" ).appendChild( raidContainer );
	} catch ( error ) {
		console.log( "Error appending Vertical raid container: " + error );
	}
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
	$( '.ui.modal' ).modal();
}

function ConstructRaidURL() {
	let URLString = "/?";
	selectedRaidsArray.forEach( function ( raid ) {
		URLString += "raid=" + raid + "&";
	} );
	URLString = URLString.slice( 0, -1 );
	history.replaceState( {}, "", URLString );
}

function GetRaidsFromURL() {
	let parsedURL = new URL( window.location.href );
	return parsedURL.searchParams.getAll( 'raid' );
}

function LoadSavedRaids() {
	console.log( "Loading saved raids..." );
	let URLRaids = GetRaidsFromURL();
	if ( URLRaids.length > 0 ) {
		console.log( "Found URL saved raids." );
		URLRaids.forEach( function ( raid ) {
			AddSelectedRaid( raid );
		} );
	} else {
		console.log( "No URL raids found. Checking for local storage saved raids..." );
		if ( localStorage.getItem( "selectedRaids" ) ) {
			console.log( "Found local storage saved raids." );
			try {
				var tempSelectedRaids = JSON.parse( localStorage.getItem( "selectedRaids" ) );
				try {
					for ( var i = 0; i < tempSelectedRaids.length; i++ ) {
						AddSelectedRaid( tempSelectedRaids[ i ] );
					}
				} catch ( error ) {
					console.log( "Error adding saved raids: " + error );
				}
			} catch ( error ) {
				console.log( "Error parsing saved raids: " + error );
			}
		} else {
			console.log( "Could not find local storage saved raids." );
		}
	}
}

function AddSelectedRaid( room ) {
	console.log( "Adding selected raid: " + room );
	if ( settings.layout.orientation === "horizontal" ) {
		if ( document.getElementById( room ) === null ) {
			if ( document.getElementById( "selected-raids" ).innerHTML === "No raids selected. Please search for a raid in the search bar above." ) {
				document.getElementById( "selected-raids" ).innerHTML = "";
			}
			console.log( "Adding selected raid to Horizontal selected raids segment..." );
			try {
				selectedRaidsArray.push( room );
				ConstructRaidURL();
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
			} catch ( error ) {
				console.log( "Error adding selected raid to Horizontal selected raids segment: " + error );
			}
		}
	} else {
		if ( document.getElementById( room + "-card" ) === null ) {
			console.log( "Adding selected raid as Vertical card..." );
			try {
				selectedRaidsArray.push( room );
				ConstructRaidURL();
				var indivSettingExists = false;
				for ( var i = 0; i < individualSettings.length; i++ ) {
					if ( room === individualSettings[ i ].room ) {
						indivSettingExists = true;
						break;
					}
				}
				if ( !indivSettingExists ) {
					individualSettings.push( {
						room: room,
						settings: Object.assign( {}, settings.notification )
					} );
					localStorage.setItem( "individualSettings", JSON.stringify( individualSettings ) );
				}
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
			} catch ( error ) {
				console.log( "Error adding selected raid as Vertical card: " + error );
			}
		}
	}
}

function AddSelectedVerticalCompactRaid( raid ) {
	console.log( "Adding Vertical Compact raid:" );
	console.dir( raid );
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
	settingsButton.classList.add( "ui", "tiny", "primary", "button", "left", "labeled", "icon" );
	settingsButton.id = raid.room + '-settings';
	settingsButton.innerHTML = 'Settings<i class="left settings icon"></i>';
	raidSettings.appendChild( settingsButton );
	raidSettings.appendChild( removeButton );
	raidContent.appendChild( raidSettings );
	raidDiv.appendChild( raidContent );
	var raidTableContainer = document.createElement( "div" );
	raidTableContainer.classList.add( "extra", "content" );
	var raidTable = document.createElement( "table" );
	raidTable.classList.add( "ui", "blue", "celled", "unstackable", "table", "compact", "smaller" );
	raidTable.id = raid.room + "-table";
	raidTable.innerHTML = '<thead><tr><th class="center aligned single line">Raid ID</th><th class="center aligned single line">Join Raid</th></tr></thead>';
	var raidTableBody = document.createElement( "tbody" );
	raidTableBody.id = raid.room + "-table-body";
	try {
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
		if ( settings.layout.verticalStacking === "row" ) {
			Draggable.create( document.getElementById( raid.room + "-card" ), {
				type: "x",
				autoScroll: 1,
				liveSnap: true,
				snap: {
					points: CalculatePoints( raid.room, false ),
					radius: 165
				}
			} );
		}
	} catch ( error ) {
		console.log( "Error adding Vertical Compact raid: " + error );
	}
}

function AddSelectedVerticalNormalRaid( raid ) {
	console.log( "Adding Vertical Normal raid:" );
	console.dir( raid );
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
	settingsButton.classList.add( "ui", "tiny", "primary", "button", "left", "labeled", "icon" );
	settingsButton.id = raid.room + '-settings';
	settingsButton.innerHTML = 'Settings<i class="left settings icon"></i>';
	raidSettings.appendChild( settingsButton );
	raidSettings.appendChild( removeButton );
	raidContent.appendChild( raidSettings );
	raidDiv.appendChild( raidContent );
	var raidTableContainer = document.createElement( "div" );
	raidTableContainer.classList.add( "extra", "content" );
	var raidTable = document.createElement( "table" );
	raidTable.classList.add( "ui", "blue", "celled", "unstackable", "table", "compact", "smaller" );
	raidTable.id = raid.room + "-table";
	raidTable.innerHTML = '<thead><tr><th class="center aligned single line">Raid ID</th><th class="center aligned single line">Time Tweeted</th><th class="center aligned single line">Join Raid</th></tr></thead>';
	var raidTableBody = document.createElement( "tbody" );
	raidTableBody.id = raid.room + "-table-body";
	try {
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
		if ( settings.layout.verticalStacking === "row" ) {
			Draggable.create( document.getElementById( raid.room + "-card" ), {
				type: "x",
				autoScroll: 1,
				liveSnap: true,
				snap: {
					points: CalculatePoints( raid.room, false ),
					radius: 165
				}
			} );
		}
	} catch ( error ) {
		console.log( "Error adding Vertical Normal raid: " + error );
	}
}

function AddSelectedVerticalFullRaid( raid ) {
	console.log( "Adding Vertical Full raid:" );
	console.dir( raid );
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
	settingsButton.classList.add( "ui", "tiny", "primary", "button", "left", "labeled", "icon" );
	settingsButton.id = raid.room + '-settings';
	settingsButton.innerHTML = 'Settings<i class="left settings icon"></i>';
	raidSettings.appendChild( settingsButton );
	raidSettings.appendChild( removeButton );
	raidContent.appendChild( raidSettings );
	raidDiv.appendChild( raidContent );
	var raidTableContainer = document.createElement( "div" );
	raidTableContainer.classList.add( "extra", "content" );
	var raidTable = document.createElement( "table" );
	raidTable.classList.add( "ui", "blue", "unstackable", "celled", "table", "compact", "smaller" );
	raidTable.id = raid.room + "-table";
	raidTable.innerHTML = '<thead><tr><th class="center aligned single line">ID</th><th class="center aligned">Message</th><th class="center aligned single line">Time Tweeted</th><th class="center aligned single line">Join Raid</th></tr></thead>';
	var raidTableBody = document.createElement( "tbody" );
	raidTableBody.id = raid.room + "-table-body";
	try {
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
		if ( settings.layout.verticalStacking === "row" ) {
			Draggable.create( document.getElementById( raid.room + "-card" ), {
				type: "x",
				autoScroll: 1,
				liveSnap: true,
				snap: {
					points: CalculatePoints( raid.room, true ),
					radius: 215
				}
			} );
		}
	} catch ( error ) {
		console.log( "Error adding Vertical Full raid: " + error );
	}
}

function CalculatePoints( room, isFull ) {
	var result = [];
	var raidIndex = selectedRaidsArray.indexOf( room );
	for ( var i = 0; i < ( settings.cardSlots - raidIndex ); i++ ) {
		if ( isFull ) {
			result.push( {
				x: i * 415,
				y: 0
			} );
		} else {
			result.push( {
				x: i * 315,
				y: 0
			} );
		}
	}
	for ( var i = 0; i < raidIndex; i++ ) {
		if ( isFull ) {
			result.push( {
				x: ( i + 1 ) * -415,
				y: 0
			} );
		} else {
			result.push( {
				x: ( i + 1 ) * -315,
				y: 0
			} );
		}
	}
	return result;
}

function RemoveSelectedRaid( room ) {
	console.log( "Removing selected raid: " + room );
	if ( settings.layout.orientation === "horizontal" ) {
		try {
			socket.emit( 'unsubscribe', {
				room: room
			} );
			selectedRaidsArray.splice( selectedRaidsArray.indexOf( room ), 1 );
			ConstructRaidURL();
			localStorage.setItem( "selectedRaids", JSON.stringify( selectedRaidsArray ) );
			document.getElementById( room ).remove();
		} catch ( error ) {
			console.log( "Error removing Horizontal raid: " + error );
		}
	} else {
		try {
			socket.emit( 'unsubscribe', {
				room: room
			} );
			selectedRaidsArray.splice( selectedRaidsArray.indexOf( room ), 1 );
			ConstructRaidURL();
			for ( var i = 0; i < individualSettings.length; i++ ) {
				if ( room === individualSettings[ i ].room ) {
					individualSettings.splice( i, 1 );
					break;
				}
			}
			localStorage.setItem( "individualSettings", JSON.stringify( individualSettings ) );
			localStorage.setItem( "selectedRaids", JSON.stringify( selectedRaidsArray ) );
			document.getElementById( room + "-card" ).remove();
			for ( var i = raids.length - 1; i >= 0; i-- ) {
				if ( room === raids[ i ].room ) {
					raids.splice( i, 1 );
				}
			}
		} catch ( error ) {
			console.log( "Error removing Vertical raid: " + error );
		}
	}
}
