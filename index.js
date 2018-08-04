const express = require( 'express' );
const twitter = require( 'node-tweet-stream' );
const { exec } = require( 'child_process' );
const st = require( 'st' );
let fs = require( 'fs' );
let app = express();
const helmet = require( 'helmet' );
const bodyParser = require( 'body-parser' );
const compression = require( 'compression' );
const morgan = require( 'morgan' );
const moment = require( 'moment' );
const port = process.env.PORT || 80;
let io = null;
let lastTweet = new Date().getTime();

let server = require( 'http' ).createServer( app );
server.listen( port );
if ( process.env.sslEnabled === "true" ) {
	const options = {
		cert: fs.readFileSync( __dirname + '/sslcert/fullchain.pem' ),
		key: fs.readFileSync( __dirname + '/sslcert/privkey.pem' )
	};
	let sslServer = require( 'https' ).createServer( options, app );
	sslServer.listen( 443 );
	io = require( 'socket.io' ).listen( sslServer );
} else {
	io = require( 'socket.io' ).listen( server );
}

let twitterOptions = {
	consumer_key: process.env.consumer_key,
	consumer_secret: process.env.consumer_secret,
	token: process.env.access_token_key,
	token_secret: process.env.access_token_secret
};

let twitterBackupOptions = {
	consumer_key: process.env.backup_consumer_key || "",
	consumer_secret: process.env.backup_consumer_secret || "",
	token: process.env.backup_access_token_key || "",
	token_secret: process.env.backup_access_token_secret || ""
};
let usingTwitterBackup = false;
let twitterClient = null;
let errors = [];

let raidConfigs = require( './raids.json' );

app.set( 'json spaces', 0 );
app.use( helmet() );
//app.use( morgan( 'combined' ) );
app.use( compression() );
app.use( bodyParser.json() );
app.use( bodyParser.urlencoded( {
	extended: true
} ) );

app.get( '/health-check', ( req, res ) => res.sendStatus( 200 ) );

app.get( '/getraids', function ( req, res ) {
	res.header( 'Cache-Control', 'public, max-age=432000000' );
	res.header( 'Access-Control-Allow-Origin', '*' );
	res.send( raidConfigs );
} );

app.get( '/serviceWorker.js', function ( req, res ) {
	res.header( 'Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate' );
	res.sendFile( __dirname + '/static/serviceWorker.js' );
} );

app.get( '/errorlogs', function ( req, res ) {
	res.header( 'Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate' );
	res.header( 'Access-Control-Allow-Origin', '*' );
	let htmlString = '<html lang="en"><head><meta charset="UTF-8"><title>GBF Raiders Errors</title><style>';
	htmlString += `
	body {
		padding: 50px;
	}
	caption {
		font-size: 26px;
		font-weight: bold;
		text-decoration: underline;
	}
	table {
		width: 100%;
		border: 2px solid black;
	}
	td {
		padding: 10px;
		border: 1px solid black;
	}
	th {
		padding: 10px;
		border: 2px solid black;
	}`;
	htmlString += '</style></head><body><table><caption>Most recent errors since up</caption><thead><tr><th scope="col">Date</th><th scope="col">Time</th><th scope="col">Message</th><th scope="col">Data</th></tr></thead><tbody>';
	errors.reverse();
	errors.forEach( function ( error ) {
		htmlString += `<tr><td>${error.date}</td><td>${error.time}</td><td>${error.message}</td><td>${JSON.stringify(error.data)}</td></tr>`;
	} );
	htmlString += '</tbody></table></body></html>';
	errors.reverse();
	res.status( 200 ).type( 'html' ).send( new Buffer( htmlString ) );
} );

app.get( '/', function ( req, res ) {
	res.sendFile( __dirname + '/static/index.html' );
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
	passthrough: true
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
	if ( data.text.indexOf( "参加者募集" ) != -1 || data.text.indexOf( "I need backup" ) != -1 ) {
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
	let splitString = data.text.split( '\n' );
	let tempMessage = splitString[ 1 ];
	if ( data.text.indexOf( ":" ) > 9 ) {
		result.message = data.text.substr( 0, data.text.indexOf( ":" ) - 10 );
	}
	if ( GetTweetLanguage( data ) === "JP" ) {
		result.language = "JP";
	} else if ( GetTweetLanguage( data ) === "EN" ) {
		result.language = "EN";
	}
	return result;
}

function GetRaidID( data ) {
	var result = null;
	try {
		result = data.text.substr( data.text.indexOf( ":" ) - 9, 8 );
	} catch ( error ) {
		console.log( error )
	}
	return result;
}

function IsValidTweet( data ) {
	let result = false;
	if ( data.source !== '<a href="http://granbluefantasy.jp/" rel="nofollow">グランブルー ファンタジー</a>' ) {
		console.log( "Invalid Tweet Source", data.source );
	} else {
		if ( searchTextForRaids( data.text ) === null ) {
			console.log( "No Raid Name", data.text );
		} else {
			if ( DoesTweetContainMessage( data ) && searchTextForRaids( GetTweetMessage( data ).message ) !== null ) {
				console.log( "Message Contains Name", data.text );
			} else {
				if ( GetRaidID( data ) === null ) {
					console.log( "No Raid ID", data.text );
				} else {
					result = true;
				}
			}
		}
	}
	return result;
}

function StartTwitterStream( options ) {
	console.log( "Starting Twitter Stream" );
	try {
		twitterClient = new twitter( options );
		twitterClient.on( 'tweet', function ( tweet ) {
			if ( IsValidTweet( tweet ) ) {
				let raidInfo = {
					id: GetRaidID( tweet ),
					user: "@" + tweet.user.screen_name,
					time: tweet.created_at,
					room: searchTextForRaids( tweet.text ),
					message: "No Twitter Message.",
					language: "JP",
					status: "unclicked",
					timer: 0
				};
				if ( DoesTweetContainMessage( tweet ) ) {
					let tweetMessage = GetTweetMessage( tweet );
					raidInfo.message = tweetMessage.message;
					raidInfo.language = tweetMessage.language;
				} else if ( GetTweetLanguage( tweet ) !== null ) {
					raidInfo.language = GetTweetLanguage( tweet );
				}
				lastTweet = new Date().getTime();
				io.to( raidInfo.room ).emit( 'tweet', raidInfo );
			}
		} );

		twitterClient.on( 'error', function ( error ) {
			errors.push( { date: new Date().toDateString(), time: new Date().toTimeString(), message: "Twitter Client Error", data: error } );
			console.log( "Twitter Client Error", error );
			twitterClient.abort();
		} );

		twitterClient.on( 'reconnect', function ( reconnect ) {
			errors.push( { date: new Date().toDateString(), time: new Date().toTimeString(), message: "Twitter Client Reconnect", data: reconnect } );
			console.log( "Twitter Client Reconnect", reconnect );
			twitterClient.reconnect();
		} );

		twitterClient.track( keywords );
	} catch ( error ) {
		errors.push( { date: new Date().toDateString(), time: new Date().toTimeString(), message: "Twitter Client Creation Error", data: error } );
		console.log( "Twitter Client Error", error );
		twitterClient.abort();
	}
}

setInterval( function () {
	if ( new Date().getTime() - 600000 > lastTweet ) {
		errors.push( { date: new Date().toDateString(), time: new Date().toTimeString(), message: "No Tweets", data: {} } );
		console.log( "No tweets in 10 mins..." );
		io.emit( 'warning', { type: "twitter" } );
		try {
			exec( 'echo "There hasn\'t been a tweet in 10 minutes! You should check up on things." | mail -s "Tweet Warning!" gene@pinskiy.us' );
			lastTweet = new Date().getTime();
			setTimeout( function () {
				console.log( "Restarting Twitter Client..." );
				twitterClient.abort();
				if ( !usingTwitterBackup ) {
					if ( twitterBackupOptions.consumer_key != "" ) {
						StartTwitterStream( twitterBackupOptions );
					}
				} else {
					StartTwitterStream( twitterOptions );
				}
				usingTwitterBackup = !usingTwitterBackup;
			}, 500 );
		} catch ( error ) {
			errors.push( { date: new Date().toDateString(), time: new Date().toTimeString(), message: "Twitter Client Restart Error", data: error } );
			console.log( "Twitter Client Restart Error", error );
		}
	}
}, 60000 )

io.sockets.on( 'connection', function ( socket ) {
	socket.on( 'subscribe',
		function ( data ) {
			socket.join( data.room );
		} );
	socket.on( 'raid-over',
		function ( data ) {
			io.to( data.room ).emit( 'raid-over', data );
		} );
	socket.on( 'unsubscribe',
		function ( data ) {
			socket.leave( data.room );
		} );
} );

console.log( "Starting GBF Raiders on Port " + port );
StartTwitterStream( twitterOptions );
