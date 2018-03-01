const version = '0.0.10';
let precachename = 'gbfraiders-precache-' + version;
let dynamicname = 'gbfraiders-dynamic-' + version;
let precachedResourcesAsDependency = [
	'main.js',
	'raids.js',
	'settings.js',
	'utils/jquery-3.2.1.min.js',
	'utils/socket.io.slim.js',
	'semantic/dist/semantic.min.js',
	'main.css',
	'darken.css',
	'semantic/dist/semantic.min.css',
	'/',
	'index.html'
];
let precachedResourcesWithoutDependency = [
	'utils/moment.min.js',
	'utils/clipboard.min.js',
	'draggable/CSSPlugin.min.js',
	'draggable/Draggable.min.js',
	'draggable/EasePack.min.js',
	'draggable/TweenLite.min.js',
	'assets/stickers/nope-sticker.png',
	'sliders.css'
];

self.addEventListener( 'install', function ( event ) {
	event.waitUntil(
		caches.open( precachename )
		.then( function ( cache ) {
			cache.addAll( precachedResourcesWithoutDependency );
			return cache.addAll( precachedResourcesAsDependency );
		} )
	);
	console.log( `ServiceWorker ${version} finished installing.` );
} );

self.addEventListener( 'fetch', function ( event ) {
	let request = event.request.clone();
	let requestURL = new URL( event.request.url );
	console.log( "Service Worker - fetching request: " + requestURL.href );
	console.dir( requestURL );
	if ( requestURL.pathname == "/socket.io/" ) {
		event.respondWith(
			NetworkOnly( request )
		);
	} else if ( requestURL.pathname == "/getraids" || requestURL.pathname == "/index.html" || requestURL.pathname == "/main.js" || requestURL.pathname == "/raids.js" || requestURL.pathname == "/settings.js" ) {
		event.respondWith(
			NetworkFallingBackToCache( request )
		);
	} else if ( requestURL.pathname == '/' ) {
		event.respondWith(
			NetworkFallingBackToCache( '/' )
		);
	} else if ( requestURL.protocol == "chrome-extension:" ) {
		return;
	} else {
		event.respondWith(
			CacheFallingBackToNetwork( request )
		);
	}
} );

function CacheOnly( request ) {
	console.log( "Checking only cache for response..." );
	return caches.match( request )
		.then( function ( cacheResponse ) {
			console.log( "Found response in cache." );
			return cacheResponse;
		} );
}

function NetworkOnly( request ) {
	console.log( "Getting response straight from network..." );
	return fetch( request, { cache: 'no-store' } );
}

function NetworkFallingBackToCache( request ) {
	console.log( "Getting reponse from network with cache fallback..." );
	return fetch( request, { cache: 'no-store' } )
		.catch( function ( error ) {
			console.log( `Failed to get response from network: ${error}` );
			console.log( "Checking cache for fallback..." );
			return caches.match( request );
		} );
}

function CacheFallingBackToNetwork( request ) {
	console.log( "Getting reponse from cache with network fallback..." );
	return caches.match( request )
		.then( function ( cacheResponse ) {
			return cacheResponse || fetch( request, { cache: 'no-store' } )
				.then( function ( networkResponse ) {
					console.log( "Failed to get response from cache. Retrieved response from network and placing it in cache..." );
					return caches.open( dynamicname )
						.then( function ( cache ) {
							if ( [ 0, 200 ].includes( networkResponse.status ) ) {
								cache.put( request, networkResponse.clone() );
							}
							return networkResponse;
						} );
				} )
				.catch( function ( err ) {
					console.log( `Error fetching from ServiceWorker: ${err}` );
				} );
		} );
}

self.addEventListener( 'activate', function ( event ) {
	event.waitUntil(
		caches.keys().then( function ( cacheNames ) {
			return Promise.all(
				cacheNames.filter( function ( cacheName ) {
					if ( cacheName !== precachename && cacheName !== dynamicname ) {
						return true;
					} else {
						return false;
					}
				} ).map( function ( cacheName ) {
					return caches.delete( cacheName );
				} )
			);
		} )
	);
	console.log( `ServiceWorker ${version} finished activating.` );
} );
