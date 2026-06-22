const WORKER_URL = import.meta.env.PUBLIC_PUSH_WORKER_URL as string | undefined;

export type Slot = 'morning' | 'afternoon' | 'evening';

/** Определяет текущий слот дня по локальному времени */
export function getCurrentSlot(): Slot {
	const h = new Date().getHours();
	if (h < 12) return 'morning';
	if (h < 17) return 'afternoon';
	return 'evening';
}

/** Конвертирует base64url → Uint8Array для applicationServerKey */
function urlBase64ToUint8Array(base64: string): Uint8Array {
	const padding = '='.repeat((4 - (base64.length % 4)) % 4);
	const b64 = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/');
	const raw = atob(b64);
	return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

/**
 * Запрашивает разрешение на уведомления и регистрирует push-подписку.
 * Вызывать после взаимодействия пользователя с UI.
 */
export async function setupPush(): Promise<void> {
	if (!WORKER_URL) return;
	if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
	if (Notification.permission === 'denied') return;

	// Получаем публичный VAPID ключ
	const res = await fetch(`${WORKER_URL}/vapid-public-key`).catch(() => null);
	if (!res?.ok) return;
	const { key } = (await res.json()) as { key: string };

	// Запрашиваем разрешение (если ещё не дано)
	if (Notification.permission !== 'granted') {
		const perm = await Notification.requestPermission();
		if (perm !== 'granted') return;
	}

	// Подписываемся
	const reg = await navigator.serviceWorker.ready;
	let sub = await reg.pushManager.getSubscription();
	if (!sub) {
		sub = await reg.pushManager.subscribe({
			userVisibleOnly: true,
			applicationServerKey: urlBase64ToUint8Array(key)
		});
	}

	// Отправляем подписку на Worker
	await fetch(`${WORKER_URL}/subscribe`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(sub.toJSON())
	}).catch(() => null);
}

/** Сообщает Worker, что сессия текущего слота выполнена */
export async function reportSessionDone(): Promise<void> {
	if (!WORKER_URL) return;
	const slot = getCurrentSlot();
	await fetch(`${WORKER_URL}/session-complete`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ slot })
	}).catch(() => null); // fire-and-forget, не блокируем UI
}
