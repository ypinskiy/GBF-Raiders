const express = require( 'express' );
const twitter = require( 'node-tweet-stream' );
const https = require( 'https' );
const st = require( 'st' );
const helmet = require( 'helmet' );
const bodyParser = require( 'body-parser' );
const compression = require( 'compression' );
//const morgan = require( 'morgan' );
//const moment = require( 'moment' );
const fs = require( 'fs' );
const cluster = require( 'cluster' );
const OS = require( 'os' );
const raidConfigs = require( './raids.json' );

if ( cluster.isMaster ) {
	console.log( "Starting cluster master..." );
	let io = null;

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
			//console.log( "Invalid Tweet Source", data.source );
		} else {
			if ( searchTextForRaids( data.text ) === null ) {
				//console.log( "No Raid Name", data.text );
			} else {
				if ( DoesTweetContainMessage( data ) && searchTextForRaids( GetTweetMessage( data ).message ) !== null ) {
					//console.log( "Message Contains Name", data.text );
				} else {
					if ( GetRaidID( data ) === null ) {
						//console.log( "No Raid ID", data.text );
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
			console.log( `Starting twitter stream, using backup options: ${usingTwitterBackup}` );
			twitterClient = new twitter( options );
			twitterClient.on( 'tweet', function ( tweet ) {
				console.log( "Tweet recieved: " + tweet.id );
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
					let raidHealthIndex = FindStoredRaidHealth( raidInfo );
					io.to( raidInfo.room ).emit( 'tweet', raidInfo );
					if ( raidHealthIndex >= 0 ) {
						console.log( "Found pre-stored raid health data for raid id: '" + raidInfo.id + "', sending to client..." );
						io.to( raidInfo.room ).emit( 'raid-health', storedRaidHealths[ raidHealthIndex ] );
						storedRaidHealths.splice( raidHealthIndex, 1 );
					}
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
			twitterClient.abort();
		}
	}
	setInterval( function () {
		if ( new Date().getTime() - 600000 > lastTweet ) {
			console.log( "No tweets in 10 mins..." );
			SendToWorkers( { type: 'warning', data: 'twitter' } );
			try {
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
				console.log( "Twitter Client Restart Error", error );
			}
		}
		for ( let i = storedRaidHealths.length - 1; i >= 0; i-- ) {
			if ( new Date().getTime() - 600000 > storedRaidHealths[ i ].time ) {
				storedRaidHealths.splice( i, 1 );
			}
		}
	}, 60000 );
	let storedRaidHealths = [];

	function FindStoredRaidHealth( data ) {
		return storedRaidHealths.findIndex( raid => raid.id === data.id );
	}
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
			socket.on( 'subscribe',
				function ( data ) {
					socket.join( data.room );
				} );
			socket.on( 'raid-over',
				function ( data ) {
					io.to( data.room ).emit( 'raid-over', data );
				} );
			socket.on( 'raid-health-submit',
				function ( data ) {
					io.to( data.room ).emit( 'raid-health', data );
				} );
			socket.on( 'raid-health-store',
				function ( data ) {
					data.time = new Date().getTime();
					let raidHealthIndex = FindStoredRaidHealth( data );
					if ( raidHealthIndex >= 0 ) {
						storedRaidHealths[ raidHealthIndex ] = data;
					} else {
						storedRaidHealths.push( data );
					}
				} );
			socket.on( 'unsubscribe',
				function ( data ) {
					socket.leave( data.room );
				} );
		} );
	} catch ( error ) {
		console.log( "Error setting up websockets: ", error );
	}
	StartTwitterStream( twitterOptions );
} else {
	let app = express();
	if ( process.env.sslEnabled === "true" ) {
		const options = {
			cert: fs.readFileSync( __dirname + '/sslcert/fullchain.pem' ),
			key: fs.readFileSync( __dirname + '/sslcert/privkey.pem' )
		};
		let sslServer = https.createServer( options, app );
		sslServer.listen( 443 );
	}
	let server = require( 'http' ).createServer( app );
	server.listen( 80 );
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
}
