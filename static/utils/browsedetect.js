const isChrome = !!window.chrome && !!window.chrome.webstore;
if ( isChrome && document.getElementById( 'container' ) ) {
	fetch( "chrome-extension://fgpokpknehglcioijejfeebigdnbnokj/content/api.html" ).then( function ( response ) {
		if ( !response.ok ) {
			throw Error( response.statusText );
		}
		return response;
	} ).then( function () {
		document.getElementById( 'container' ).innerHTML += '<iframe id="viramate-api" src="chrome-extension://fgpokpknehglcioijejfeebigdnbnokj/content/api.html" width="1" height="1"><p>Your browser does not support iframes.</p></iframe>';
		console.log( "Added Viramate extension API to page." );
	} ).catch( function ( err ) {
		console.log( `Error finding Viramate extension on page load: ${err.message}`, err );
	} );
} else if ( !isChrome ) {
	const preloadedLinks = [ "https://fonts.googleapis.com/css?family=Open+Sans", "semantic/dist/semantic.min.css", "darken.css", "sliders.css", "main.css" ];
	for ( let i = 0; i < preloadedLinks.length; i++ ) {
		let preloadLink = document.createElement( "link" );
		preloadLink.href = preloadedLinks[ i ];
		preloadLink.rel = "stylesheet";
		document.head.appendChild( preloadLink );
	}
}
