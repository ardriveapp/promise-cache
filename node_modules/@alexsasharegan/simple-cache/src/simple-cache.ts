import { Cache, TypeLabel } from "./cache.interface"
import { CoreCache } from "./core"

/**
 * SimpleCache follows the Cache interface to store values `V` by key `K`.
 *
 * This cache allows writes up to capacity, beyond which least accessed values
 * will be removed.
 */
export function SimpleCache<K, V>(
	capacity: number,
	typeLabel: TypeLabel = { key: "any", value: "any" }
): Cache<K, V> {
	const {
		clear,
		entries,
		get,
		invalidate,
		keys,
		read,
		remove,
		size,
		values,
		write,
	} = CoreCache<K, V>(capacity)

	const cache: Cache<K, V> = {
		clear,
		entries,
		get,
		invalidate,
		keys,
		read,
		remove,
		size,
		values,
		write,
		toString() {
			return `${SimpleCache.name /* makes name refactoring simpler */}<${
				typeLabel.key
			}, ${typeLabel.value}> { size: ${size()}, capacity: ${capacity} }`
		},

		toJSON() {
			return entries()
		},
	}

	return cache
}
