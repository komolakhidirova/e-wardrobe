class WardrobeDB {
	private dbName = 'WardrobeDB'
	private storeName = 'items'
	private version = 1

	// Инициализация базы данных
	async init(): Promise<IDBDatabase> {
		return new Promise((resolve, reject) => {
			const request = indexedDB.open(this.dbName, this.version)

			request.onupgradeneeded = event => {
				const db = (event.target as IDBOpenDBRequest).result

				if (!db.objectStoreNames.contains(this.storeName)) {
					const store = db.createObjectStore(this.storeName, {
						keyPath: 'id',
						autoIncrement: false,
					})
					store.createIndex('season', 'season', { unique: false })
					store.createIndex('category', 'category', { unique: false })
					store.createIndex('createdAt', 'createdAt', { unique: false })
				}
			}

			request.onsuccess = event => {
				resolve((event.target as IDBOpenDBRequest).result)
			}

			request.onerror = event => {
				reject((event.target as IDBOpenDBRequest).error)
			}
		})
	}

	// Добавить предмет
	async addItem(item: any): Promise<string> {
		const db = await this.init()

		return new Promise((resolve, reject) => {
			const transaction = db.transaction(this.storeName, 'readwrite')
			const store = transaction.objectStore(this.storeName)

			const request = store.add(item)

			request.onsuccess = () => {
				resolve(request.result as string)
			}

			request.onerror = () => {
				reject(request.error)
			}
		})
	}

	// Получить все предметы
	async getAllItems(): Promise<any[]> {
		const db = await this.init()

		return new Promise((resolve, reject) => {
			const transaction = db.transaction(this.storeName, 'readonly')
			const store = transaction.objectStore(this.storeName)
			const request = store.getAll()

			request.onsuccess = () => {
				resolve(request.result)
			}

			request.onerror = () => {
				reject(request.error)
			}
		})
	}

	// Удалить предмет по ID
	async deleteItem(id: string): Promise<boolean> {
		const db = await this.init()

		return new Promise((resolve, reject) => {
			const transaction = db.transaction(this.storeName, 'readwrite')
			const store = transaction.objectStore(this.storeName)

			const request = store.delete(id)

			request.onsuccess = () => {
				resolve(true)
			}

			request.onerror = () => {
				reject(request.error)
			}
		})
	}

	// Получить количество предметов
	async getCount(): Promise<number> {
		const db = await this.init()

		return new Promise((resolve, reject) => {
			const transaction = db.transaction(this.storeName, 'readonly')
			const store = transaction.objectStore(this.storeName)

			const request = store.count()

			request.onsuccess = () => {
				resolve(request.result)
			}

			request.onerror = () => {
				reject(request.error)
			}
		})
	}

	// Очистить все данные
	async clearAll(): Promise<void> {
		const db = await this.init()

		return new Promise((resolve, reject) => {
			const transaction = db.transaction(this.storeName, 'readwrite')
			const store = transaction.objectStore(this.storeName)

			const request = store.clear()

			request.onsuccess = () => {
				resolve()
			}

			request.onerror = () => {
				reject(request.error)
			}
		})
	}
}

export const wardrobeDB = new WardrobeDB()
