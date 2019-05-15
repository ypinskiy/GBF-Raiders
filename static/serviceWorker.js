const version = '0.0.30';
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
	console.log( `Service Worker - fetching request: ${requestURL.href}`, requestURL );
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
	} else if ( requestURL.host === "fonts.googleapis.com" || request.host === "fonts.gstatic.com" ) {
		event.respondWith(
			PatchFonts( request )
		);
	} else if (requestURL.pathname === "/stats" || requestURL.pathname === "/stats.json") {
		event.respondWith(
			NetworkOnly( request )
		);
	} else {
		event.respondWith(
			CacheFallingBackToNetwork( request )
		);
	}
} );

async function PatchFonts( request ) {
	console.log( `${request.url}: Patching fonts...`, request );
	const cacheResponse = await caches.match( request );
	if ( cacheResponse ) {
		return cacheResponse;
	} else {
		const response = await fetch( request );
		const css = await response.text();
		const patched = css.replace( /}/g, "font-display: swap; }" );
		const newResponse = new Response( patched, { headers: response.headers } );
		caches.open( dynamicname )
			.then( function ( cache ) {
				cache.put( request, newResponse.clone() );
			} );
		return newResponse;
	}
}

function CacheOnly( request ) {
	console.log( `${request.url}: Checking only cache for response`, request );
	return caches.match( request )
		.then( function ( cacheResponse ) {
			console.log( `Found response in cache`, cacheResponse );
			return cacheResponse;
		} );
}

function NetworkOnly( request ) {
	console.log( `${request.url}: Getting response straight from network`, request );
	return fetch( request, { cache: 'no-store' } );
}

function NetworkFallingBackToCache( request ) {
	console.log( `${request.url}: Getting reponse from network with cache fallback`, request );
	return fetch( request, { cache: 'no-store' } )
		.catch( function ( error ) {
			console.error( `Failed to get response from network, checking cache for fallback`, error );
			return caches.match( request );
		} );
}

function CacheFallingBackToNetwork( request ) {
	console.log( `${request.url}: Getting reponse from cache with network fallback`, request );
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
					console.error( `Failed to get response from network or cache`, err );
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
