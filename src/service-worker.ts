/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

declare const self: ServiceWorkerGlobalScope;

self.addEventListener('push', (event) => {
	let title = 'Греческие карточки';
	let body = 'Время учиться!';

	try {
		const data = event.data?.json();
		if (data?.title) title = data.title;
		if (data?.body) body = data.body;
	} catch {
		body = event.data?.text() ?? body;
	}

	event.waitUntil(
		self.registration.showNotification(title, {
			body,
			icon: '/favicon.svg',
			badge: '/favicon.svg',
			tag: 'greek-reminder',
			renotify: true
		})
	);
});

self.addEventListener('notificationclick', (event) => {
	event.notification.close();
	event.waitUntil(self.clients.openWindow('/'));
});
