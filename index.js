const express = require( 'express' );
const twitter = require( 'node-tweet-stream' );
const https = require( 'https' );
const spdy = require( 'spdy' );
const fetch = require( 'node-fetch' );
const st = require( 'st' );
const helmet = require( 'helmet' );
const bodyParser = require( 'body-parser' );
const compression = require( 'compression' );
const fs = require( 'fs' );
const cluster = require( 'cluster' );
const OS = require( 'os' );
const raidConfigs = require( './raids.json' );
const raidRooms = raidConfigs.map( raid => raid.room );

let raidsCounter = {};
let isMaintinence = false;

function objectFlip( obj ) {
	const ret = {};
	Object.keys( obj ).forEach( ( key ) => {
		ret[ obj[ key ] ] = key;
	} );
	return ret;
}

function ResetRaidsCounter() {
	raidsCounter = Object.assign( {}, raidRooms );
	raidsCounter = objectFlip( raidsCounter );
	raidRooms.forEach( function ( room ) {
		raidsCounter[ room ] = 0;
	} );
}

function SortCountersDesc( a, b ) {
	if ( a.tweeted < b.tweeted ) {
		return 1;
	}
	if ( a.tweeted > b.tweeted ) {
		return -1;
	}
	return 0
}

function SortRoomsDesc( a, b ) {
	if ( a.subbed < b.subbed ) {
		return 1;
	}
	if ( a.subbed > b.subbed ) {
		return -1;
	}
	return 0
}

function ParseCounters() {
	let rooms = [];
	rooms = raidRooms.map( room => {
		return { "room": room, "tweeted": raidsCounter[ room ] };
	} );
	rooms.sort( SortCountersDesc );
	return rooms;
}

function ParseRooms( rooms ) {
	let raids = [];
	raidConfigs.forEach( function ( raid ) {
		if ( rooms[ raid.room ] ) {
			raids.push( { "room": raid.room, "subbed": rooms[ raid.room ].length } );
		}
	} );
	raids.sort( SortRoomsDesc );
	return raids;
}

if ( cluster.isMaster ) {
	console.log( "Starting cluster master..." );
	let io = null;
	let stats = {
		connected: 0,
		tweets: 0,
		maxConnected: 0,
		maxTweets: 0
	};
	ResetRaidsCounter();

	function SendToWorkers( message ) {
		for ( const id in cluster.workers ) {
			cluster.workers[ id ].send( message );
		}
	}
	const numCPUs = OS.cpus().length;
	while ( Object.keys( cluster.workers ).length < numCPUs ) {
		console.log( `Creating fork # ${Object.keys(cluster.workers).length}` );
		cluster.fork();
	}

	cluster.on( 'exit', function ( deadWorker, code, signal ) {
		// Restart the worker
		let worker = cluster.fork();

		// Note the process IDs
		let newPID = worker.process.pid;
		let oldPID = deadWorker.process.pid;

		// Log the event
		console.log( 'Worker ' + oldPID + ' died.' );
		console.log( 'Worker ' + newPID + ' born.' );
	} );

	let lastTweet = new Date().getTime();
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
	let keywords = "";
	for ( let i = 0; i < raidConfigs.length; i++ ) {
		keywords += raidConfigs[ i ].english + "," + raidConfigs[ i ].japanese;
		if ( i != raidConfigs.length - 1 ) {
			keywords += ',';
		}
	}

	function SearchTextForRaids( text ) {
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
		//let splitString = data.text.split( '\n' );
		//let tempMessage = splitString[ 1 ];
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
		let result = null;
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
			if ( SearchTextForRaids( data.text ) === null ) {
				console.log( "No Raid Name", data.text );
			} else {
				if ( DoesTweetContainMessage( data ) && SearchTextForRaids( GetTweetMessage( data ).message ) !== null ) {
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
		try {
			console.log( `Starting twitter stream, using options: ${JSON.stringify(options)}` );
			twitterClient = new twitter( options );
			twitterClient.on( 'tweet', function ( tweet ) {
				//console.log( "Tweet recieved: " + tweet.id );
				if ( IsValidTweet( tweet ) ) {
					let raidInfo = {
						id: GetRaidID( tweet ),
						user: "@" + tweet.user.screen_name,
						time: tweet.created_at,
						room: SearchTextForRaids( tweet.text ),
						message: "No Twitter Message.",
						language: "JP",
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
					stats.tweets++;
					raidsCounter[ raidInfo.room ]++;
				}
			} );
			twitterClient.on( 'error', function ( error ) {
				console.log( "Twitter Client Error", JSON.stringify( error ) );
				twitterClient.abort();
			} );
			twitterClient.on( 'reconnect', function ( reconnect ) {
				console.log( "Twitter Client Reconnect", JSON.stringify( reconnect ) );
				twitterClient.reconnect();
			} );
			twitterClient.track( keywords );
		} catch ( error ) {
			console.log( "Twitter Client Error", JSON.stringify( error ) );
			if ( twitterClient ) {
				twitterClient.abort();
			}
		}
	}
	setInterval( function () {
		console.log( "Sending stats to workers..." );
		stats.processuptime = process.uptime().toFixed( 0 );
		stats.servertime = new Date().toString();
		stats.tweets = stats.tweets;
		if ( stats.tweets > stats.maxTweets ) {
			stats.maxTweets = stats.tweets;
		}
		if ( stats.connected > stats.maxConnected ) {
			stats.maxConnected = stats.connected;
		}
		stats.mostsubbed = ParseRooms( io.sockets.adapter.rooms ).slice( 0, 3 );
		stats.mosttweeted = ParseCounters().slice( 0, 3 );
		SendToWorkers( stats );
		console.log( stats );
		stats.tweets = 0;
		ResetRaidsCounter();
	}, 60000 );
	setInterval( function () {
		if ( new Date().getTime() - 600000 > lastTweet && !isMaintinence ) {
			console.log( "No tweets in 10 mins..." );
			try {
				lastTweet = new Date().getTime();
				io.sockets.emit( 'warning', { type: "twitter", message: "No tweets in 10 mins" } );
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
				console.log( "Twitter Client Restart Error", error );
			}
		}
	}, 60000 );
	setInterval( function () {
		console.log( "Checking for maintinence..." );
		fetch( 'http://game.granbluefantasy.jp' )
			.then( function ( response ) {
				if ( response.status == "200" && response.redirected && response.url.includes( "maintenance" ) ) {
					console.log( "Game is in maintenance." );
					isMaintinence = true;
				} else {
					isMaintinence = false;
				}
				io.sockets.emit( 'maint', isMaintinence );
			} )
			.catch( function ( error ) {
				console.log( "Error checking for maintinence:", error );
			} );
	}, 60000 );
	try {
		console.log( "Setting up websocket server..." );
		if ( process.env.sslEnabled === "true" ) {
			const options = {
				cert: fs.readFileSync( __dirname + '/sslcert/fullchain.pem' ),
				key: fs.readFileSync( __dirname + '/sslcert/privkey.pem' )
			};
			let sslServer = https.createServer( options );
			sslServer.listen( 8080 );
			io = require( 'socket.io' ).listen( sslServer );
		} else {
			let server = require( 'http' ).createServer();
			server.listen( 8080 );
			io = require( 'socket.io' ).listen( server );
		}
		io.sockets.on( 'connection', function ( socket ) {
			stats.connected++;
			socket.emit( 'maint', isMaintinence );
			socket.on( 'subscribe',
				function ( data ) {
					socket.join( data.room );
				} );
			socket.on( 'unsubscribe',
				function ( data ) {
					socket.leave( data.room );
				} );
			socket.on( 'disconnect',
				function () {
					stats.connected--;
				} );
		} );
	} catch ( error ) {
		console.log( "Error setting up websockets: ", error );
	}
	StartTwitterStream( twitterOptions );
} else {
	let localStats = [];
	let app = express();
	app.set( 'json spaces', 0 );
	app.use( helmet() );
	app.use( compression() );
	app.use( bodyParser.json() );
	app.use( bodyParser.urlencoded( {
		extended: true
	} ) );
	app.use( function ( error, req, res, next ) {
		if ( error ) {
			console.log( "EXPRESS Error: " + JSON.stringify( error ) );
		}
	} )
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
	app.get( '/', function ( req, res ) {
		res.sendFile( __dirname + '/static/index.html' );
	} );
	app.get( '/stats', function ( req, res ) {
		res.sendFile( __dirname + '/static/stats.html' );
	} );
	app.get( '/stats.json', function ( req, res ) {
		res.header( 'Access-Control-Allow-Origin', '*' );
		res.header( 'Cache-Control', 'private, no-cache, no-store, must-revalidate' );
		res.header( 'Expires', '-1' );
		res.header( 'Pragma', 'no-cache' );
		res.json( localStats );
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
				maxAge: 1000 * 60 * 60 * 24 * 365, // how long to cache contents for (milliseconds * seconds * minutes * hours * days)
			}
		},
		passthrough: true
	} ) );
	if ( process.env.sslEnabled === "true" ) {
		const options = {
			cert: fs.readFileSync( __dirname + '/sslcert/fullchain.pem' ),
			key: fs.readFileSync( __dirname + '/sslcert/privkey.pem' )
		};
		spdy.createServer( options, app ).listen( 443, ( error ) => {
			if ( error ) {
				console.log( "SPDY Error: " + JSON.stringify( error ) );
			}
		} );
	}
	process.on( 'message', function ( msg ) {
		localStats.push( msg );
		if ( localStats.length > 180 ) {
			localStats.shift();
		}
	} );
	require( 'http' ).createServer( app ).listen( 80 );
}
