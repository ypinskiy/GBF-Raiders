let express = require( 'express' );
let twitter = require( 'twitter' );
let st = require( 'st' );
let fs = require( 'fs' );
let app = express();
let helmet = require( 'helmet' );
let bodyParser = require( 'body-parser' );
let compression = require( 'compression' );
let morgan = require( 'morgan' );
let port = process.env.PORT || 80;
let io = null;

if ( process.env.sslEnabled === "true" ) {
	const options = {
		cert: fs.readFileSync( __dirname + '/sslcert/fullchain.pem' ),
		key: fs.readFileSync( __dirname + '/sslcert/privkey.pem' )
	};
	let sslServer = require( 'https' ).createServer( options, app );
	sslServer.listen( 443 );
	io = require( 'socket.io' ).listen( sslServer );
} else {
	let server = require( 'http' ).createServer( app );
	server.listen( port );
	io = require( 'socket.io' ).listen( server );
}

let client = new twitter( {
	consumer_key: process.env.consumer_key,
	consumer_secret: process.env.consumer_secret,
	access_token_key: process.env.access_token_key,
	access_token_secret: process.env.access_token_secret
} );

function TimedLogger( data ) {
	console.log( new Date().toString() + " - " + data );
}

let raidConfigs = require( './raids.json' );

app.set( 'json spaces', 0 );
app.use( helmet() );
app.use( morgan( 'combined' ) );
app.use( compression() );
app.use( bodyParser.json() );
app.use( bodyParser.urlencoded( {
	extended: true
} ) );

app.get( '/health-check', ( req, res ) => res.sendStatus( 200 ) );

app.get( '/getraids', function ( req, res ) {
	res.header( 'Cache-Control', 'public, max-age=432000000' );
	res.header( 'Access-Control-Allow-Origin', '*' )
	res.send( raidConfigs );
} );

app.use( st( {
	path: __dirname + '/static',
	url: '/',
	index: '/index.html',
	gzip: true,
	dot: true,
	cors: true,
	cache: {
		content: {
			max: 1024 * 1024 * 64, // how much memory to use on caching contents (bytes * kilo * mega)
			maxAge: 1000 * 60 * 60 * 24 * 7, // how long to cache contents for (milliseconds * seconds * minutes * hours * days)
		}
	},
	passthrough: false
} ) );

let keywords = "";

for ( let i = 0; i < raidConfigs.length; i++ ) {
	keywords += raidConfigs[ i ].english + "," + raidConfigs[ i ].japanese;
	if ( i != raidConfigs.length - 1 ) {
		keywords += ',';
	}
}

function searchTextForRaids( text ) {
	let result = null;
	for ( let i = 0; i < raidConfigs.length; i++ ) {
		if ( text.indexOf( raidConfigs[ i ].english ) != -1 || text.indexOf( raidConfigs[ i ].japanese ) != -1 ) {
			result = raidConfigs[ i ].room;
			break;
		}
	}
	return result;
}

function DoesTweetContainMessage( data ) {
	let result = false;
	if ( data.text.substr( 0, 10 ) !== "参加者募集！参戦ID" && data.text.substr( 0, 10 ) !== "I need bac" ) {
		result = true;
	}
	return result;
}

function GetTweetLanguage( data ) {
	if ( data.text.indexOf( '参戦ID' ) !== -1 ) {
		return "JP";
	} else if ( data.text.indexOf( 'Battle ID' ) !== -1 ) {
		return "EN";
	} else {
		return null;
	}
}

function GetTweetMessage( data ) {
	let result = {
		language: "JP",
		message: "No Twitter Message."
	};
	if ( GetTweetLanguage( data ) === "JP" ) {
		result.message = data.text.substring( 0, data.text.indexOf( '参戦ID' ) - 7 );
		result.language = "JP";
	} else if ( GetTweetLanguage( data ) === "EN" ) {
		result.message = data.text.substring( 0, data.text.indexOf( 'Battle ID' ) - 15 );
		result.language = "EN";
	}
	return result;
}

function GetRaidID( data ) {
	var result = null;
	try {
		//result = data.text.substr( data.text.indexOf( 'ID' ) + 3, 9 );
		if ( data.text.charAt( 0 ) == " " ) {
			result = data.text.substr( 1, 8 );
		} else {
			result = data.text.substr( 0, 8 );
		}
	} catch ( error ) {
		TimedLogger( "Error getting raid ID: " + error );
	}
	return result;
}

function IsValidTweet( data ) {
	let result = false;
	if ( data.source !== '<a href="http://granbluefantasy.jp/" rel="nofollow">グランブルー ファンタジー</a>' ) {
		TimedLogger( "Invalid tweet source: " + data.source );
	} else {
		if ( searchTextForRaids( data.text ) === null ) {
			TimedLogger( "Invalid tweet: No raid name in tweet." );
		} else {
			if ( DoesTweetContainMessage( data ) && searchTextForRaids( GetTweetMessage( data ).message ) !== null ) {
				TimedLogger( "Invalid tweet: Message contains a raid name: " + GetTweetMessage( data ).message );
			} else {
				if ( GetRaidID( data ) === null ) {
					TimedLogger( "Invalid tweet: No raid ID in tweet." );
				} else {
					TimedLogger( "Tweet is valid." );
					result = true;
				}
			}
		}
	}
	return result;
}

function StartTwitterStream() {
	client.stream( 'statuses/filter', {
		track: keywords
	}, function ( stream ) {
		TimedLogger( "Twitter Stream started." );
		stream.on( 'data', function ( event ) {
			TimedLogger( "Tweet found." );
			if ( IsValidTweet( event ) ) {
				let raidInfo = {
					id: GetRaidID( event ),
					user: "@" + event.user.screen_name,
					time: event.created_at,
					room: searchTextForRaids( event.text ),
					message: "No Twitter Message.",
					language: "JP",
					status: "unclicked"
				};
				if ( DoesTweetContainMessage( event ) ) {
					let tweetMessage = GetTweetMessage( event );
					raidInfo.message = tweetMessage.message;
					raidInfo.language = tweetMessage.language;
				} else if ( GetTweetLanguage( event ) !== null ) {
					raidInfo.language = GetTweetLanguage( event );
				}
				TimedLogger( "Raid Info: " );
				console.dir( raidInfo );
				io.to( raidInfo.room ).emit( 'tweet', raidInfo );
			}
		} );

		stream.on( 'error', function ( error ) {
			TimedLogger( "Twitter Stream error:" );
			console.dir( error );
			StartTwitterStream();
		} );
		stream.on( 'disconnect', function ( disconnect ) {
			TimedLogger( "Twitter Stream disconnect:" );
			console.dir( disconnect );
			StartTwitterStream();
		} );
		stream.on( 'warning', function ( warning ) {
			TimedLogger( "Twitter Stream warning:" );
			console.dir( warning );
		} );
		stream.on( 'limit', function ( limit ) {
			TimedLogger( "Twitter Stream limit:" );
			console.dir( limit );
		} );
		stream.on( 'ping', function () {
			TimedLogger( "Twitter Stream ping." );
		} );
		stream.on( 'event', function ( event ) {
			TimedLogger( "Twitter Stream event:" );
			console.dir( event );
		} );
		stream.on( 'end', function ( end ) {
			TimedLogger( "Twitter Stream end:" );
			console.dir( end );
			StartTwitterStream();
		} );
	} );
}

io.sockets.on( 'connection', function ( socket ) {
	TimedLogger( "New connection established." );
	socket.on( 'subscribe',
		function ( data ) {
			TimedLogger( "Room subscribed: " + data.room );
			socket.join( data.room );
		} );

	socket.on( 'unsubscribe',
		function ( data ) {
			TimedLogger( "Room unsubscribed: " + data.room );
			socket.leave( data.room );
		} );
} );

TimedLogger( "Starting GBF Raiders on port " + port + "." );

StartTwitterStream();
