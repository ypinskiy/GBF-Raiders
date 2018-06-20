class Lumberjack {
	constructor() {
		this.history = [];
		this.mirror = false;
	}

	AddLog( type, msg ) {
		let log = {
			type: type,
			msg: msg,
			time: new Date(),
			stack: new Error().stack
				.split( /\r|\n/ )
				.slice( 1 )
				.map( level => level.trim() ),
			objects: []
		};

		switch ( log.type ) {
			case "error":
				if ( arguments.length > 3 ) {
					for ( let i = 3; i < arguments.length; i++ ) {
						log.objects.push( arguments[ i ] );
					}
					if ( this.mirror ) {
						console.error( log.time + " : " + log.msg, log.objects );
					}
				} else {
					log.stack = arguments[ 2 ].stack
						.split( /\r|\n/ )
						.slice( 1 )
						.map( level => level.trim() );
					if ( this.mirror ) {
						console.error( log.time + " : " + log.msg );
					}
				}
				break;
			case "info":
				if ( arguments.length > 2 ) {
					for ( let i = 2; i < arguments.length; i++ ) {
						log.objects.push( arguments[ i ] );
					}
					if ( this.mirror ) {
						console.log( log.time + " : " + log.msg, log.objects );
					}
				} else {
					if ( this.mirror ) {
						console.log( log.time + " : " + log.msg );
					}
				}
				break;
			case "warning":
				if ( arguments.length > 2 ) {
					for ( let i = 2; i < arguments.length; i++ ) {
						log.objects.push( arguments[ i ] );
					}
					if ( this.mirror ) {
						console.warn( log.time + " : " + log.msg, log.objects );
					}
				} else {
					if ( this.mirror ) {
						console.warn( log.time + " : " + log.msg );
					}
				}
				break;
		}
		this.history.push( log );
		return log;
	}

	DownloadHistory() {
		let downloader = document.createElement( "a" );
		downloader.setAttribute(
			"href",
			"data:text/plain;charset=utf-8," +
			encodeURIComponent( JSON.stringify( this.history, null, 2 ) )
		);
		downloader.setAttribute(
			"download",
			"GBFRLogs-" + moment().format( "YYYYMMDD-HHmm" ) + ".json"
		);
		downloader.style.display = "none";
		document.body.appendChild( downloader );
		downloader.click();
		document.body.removeChild( downloader );
	}

	ShowHistoryInConsole() {
		console.table( this.history, [ "type", "msg", "time" ] );
	}
}

let logger = new Lumberjack();
