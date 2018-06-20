const version = '0.0.13';
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
	logger.AddLog( "info", `ServiceWorker ${version} finished installing.` );
} );

self.addEventListener( 'fetch', function ( event ) {
	let request = event.request.clone();
	let requestURL = new URL( event.request.url );
	logger.AddLog( "info", `Service Worker - fetching request: ${requestURL.href}`, requestURL );
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
	logger.AddLog( "info", `${request.href}: Checking only cache for response`, request );
	return caches.match( request )
		.then( function ( cacheResponse ) {
			logger.AddLog( "info", `Found response in cache`, cacheResponse );
			return cacheResponse;
		} );
}

function NetworkOnly( request ) {
	logger.AddLog( "info", `${request.href}: Getting response straight from network`, request );
	return fetch( request, { cache: 'no-store' } );
}

function NetworkFallingBackToCache( request ) {
	logger.AddLog( "info", `${request.href}: Getting reponse from network with cache fallback`, request );
	return fetch( request, { cache: 'no-store' } )
		.catch( function ( error ) {
			logger.AddLog( "error", `Failed to get response from network, checking cache for fallback`, error );
			return caches.match( request );
		} );
}

function CacheFallingBackToNetwork( request ) {
	logger.AddLog( "info", `${request.href}: Getting reponse from cache with network fallback`, request );
	return caches.match( request )
		.then( function ( cacheResponse ) {
			return cacheResponse || fetch( request, { cache: 'no-store' } )
				.then( function ( networkResponse ) {
					logger.AddLog( "info", "Failed to get response from cache. Retrieved response from network and placing it in cache..." );
					return caches.open( dynamicname )
						.then( function ( cache ) {
							if ( [ 0, 200 ].includes( networkResponse.status ) ) {
								cache.put( request, networkResponse.clone() );
							}
							return networkResponse;
						} );
				} )
				.catch( function ( err ) {
					logger.AddLog( "error", `Failed to get response from network or cache`, err );
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
	logger.AddLog("info", `ServiceWorker ${version} finished activating.` );
} );
