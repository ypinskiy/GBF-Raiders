const version = '0.0.1'
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
	'sweetalert/sweetalert.min.js',
	'sweetalert/sweetalert.min.css',
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
	console.log( 'ServiceWorker finished installing.' )
} );

self.addEventListener( 'fetch', function ( event ) {
	let request = event.request.clone();
	let requestURL = new URL( event.request.url );
	if ( /EIO=3&transport=polling/.test( requestURL.search ) ) {
		event.respondWith(
			NetworkOnly( request )
		);
	} else if ( /getraids/.test( requestURL.pathname ) ) {
		event.respondWith(
			NetworkFallingBackToCache( request )
		);
	} else {
		event.respondWith(
			CacheFallingBackToNetwork( request )
		);
	}
} );

function CacheOnly( request ) {
	return caches.match( request )
		.then( function ( cacheResponse ) {
			return cacheResponse;
		} );
}

function NetworkOnly( request ) {
	return fetch( request );
}

function NetworkFallingBackToCache( request ) {
	return fetch( request )
		.catch( function ( error ) {
			return caches.match( request );
		} );
}

function CacheFallingBackToNetwork( request ) {
	return caches.match( request )
		.then( function ( cacheResponse ) {
			return cacheResponse || fetch( request )
				.then( function ( networkResponse ) {
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
	console.log( 'ServiceWorker finished activating.' )
} );
