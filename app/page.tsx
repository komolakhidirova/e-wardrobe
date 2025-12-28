'use client'

import { Button } from '@/components/ui/button'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { wardrobeDB } from '@/lib/indexedDB'
import Image from 'next/image'
import { useEffect, useState } from 'react'

// Тип для предмета гардероба (должен совпадать с AddItem)
type WardrobeItem = {
	id: string
	season: 'winter' | 'spring' | 'summer' | 'autumn'
	category:
		| 'blouses'
		| 'tops'
		| 'cardigans'
		| 'dresses'
		| 'bottoms'
		| 'pants'
		| 'skirts'
		| 'outwear'
		| 'accessories'
		| 'shoes'
	description: string
	imageBase64: string
	createdAt: string
}

// Перевод сезонов на русский
const seasonLabels = {
	winter: 'Зима',
	spring: 'Весна',
	summer: 'Лето',
	autumn: 'Осень',
}

// Перевод категорий на русский
const categoryLabels = {
	blouses: 'Блузы',
	tops: 'Футболки',
	cardigans: 'Пиджаки',
	dresses: 'Платья',
	bottoms: 'Брюки',
	pants: 'Спортивки',
	skirts: 'Юбки',
	outwear: 'Верхняя',
	accessories: 'Колготки',
	shoes: 'Обувь',
}

const Wardrobe = () => {
	const [items, setItems] = useState<WardrobeItem[]>([])
	const [filteredItems, setFilteredItems] = useState<WardrobeItem[]>([])
	const [loading, setLoading] = useState(true)
	const [selectedSeason, setSelectedSeason] = useState<string | 'all'>('all')
	const [selectedCategory, setSelectedCategory] = useState<string | 'all'>(
		'all'
	)
	const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest')
	const [deletingId, setDeletingId] = useState<string | null>(null)

	// Загружаем предметы из IndexedDB
	useEffect(() => {
		loadItems()
	}, [])

	// Применяем фильтры при изменении
	useEffect(() => {
		filterItems()
	}, [items, selectedSeason, selectedCategory, sortBy])

	const loadItems = async () => {
		try {
			setLoading(true)
			const allItems = await wardrobeDB.getAllItems()

			const sortedItems = allItems.sort(
				(a, b) =>
					new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
			)

			setItems(sortedItems)
			setFilteredItems(sortedItems)
		} catch (error) {
			console.error('Ошибка при загрузке предметов:', error)
		} finally {
			setLoading(false)
		}
	}

	const filterItems = () => {
		let filtered = [...items]

		if (selectedSeason !== 'all') {
			filtered = filtered.filter(item => item.season === selectedSeason)
		}

		if (selectedCategory !== 'all') {
			filtered = filtered.filter(item => item.category === selectedCategory)
		}

		filtered.sort((a, b) => {
			if (sortBy === 'newest') {
				return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
			} else {
				return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
			}
		})

		setFilteredItems(filtered)
	}

	// Удаление предмета
	const handleDeleteItem = async (id: string) => {
		if (!window.confirm('Вы уверены, что хотите удалить этот предмет?')) {
			return
		}

		setDeletingId(id)

		try {
			// Удаляем из IndexedDB
			await wardrobeDB.deleteItem(id)

			// Обновляем состояние
			const updatedItems = items.filter(item => item.id !== id)
			setItems(updatedItems)

			// Показываем уведомление (можно заменить на toast)
			alert('Предмет успешно удален!')
		} catch (error) {
			console.error('Ошибка при удалении:', error)
			alert('Не удалось удалить предмет. Попробуйте еще раз.')
		} finally {
			setDeletingId(null)
		}
	}

	const uniqueSeasons = ['all', ...new Set(items.map(item => item.season))]
	const uniqueCategories = ['all', ...new Set(items.map(item => item.category))]

	const formatDate = (dateString: string) => {
		const date = new Date(dateString)
		return date.toLocaleDateString('ru-RU', {
			day: 'numeric',
			month: 'numeric',
			year: 'numeric',
		})
	}

	if (loading) {
		return (
			<div className='flex min-h-screen items-center justify-center bg-zinc-50 font-sans '>
				<div className='text-center'>
					<div className='mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-transparent'></div>
					<p className='text-gray-600'>Загружаем гардероб...</p>
				</div>
			</div>
		)
	}

	return (
		<div className='min-h-screen bg-zinc-50 font-sans '>
			<div className='container mx-auto px-4 py-8'>
				<div className='mb-8 text-center'>
					<h1 className='mb-8 text-3xl font-bold'>Мой гардероб</h1>
					<div className='flex items-center justify-between rounded-lg bg-white p-4 shadow'>
						<div className='text-sm text-gray-600'>
							Показано {filteredItems.length} из {items.length} предметов
						</div>
						<Button asChild variant='outline'>
							<a href='/add-item'>+ Добавить еще</a>
						</Button>
					</div>
				</div>

				<div className='mb-8 rounded-lg bg-white p-4 shadow '>
					{/* Фильтры */}
					<div className='flex flex-wrap gap-5'>
						{/* Сезон */}
						<div className='flex flex-col'>
							<label className='mb-1 text-sm text-gray-600'>Сезон</label>
							<Select value={selectedSeason} onValueChange={setSelectedSeason}>
								<SelectTrigger id='season-filter' className='w-[180px]'>
									<SelectValue placeholder='Все сезоны' />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value='all'>Все сезоны</SelectItem>
									{uniqueSeasons
										.filter(season => season !== 'all')
										.map(season => (
											<SelectItem key={season} value={season}>
												<div className='flex items-center gap-2'>
													{seasonLabels[season as keyof typeof seasonLabels]}
												</div>
											</SelectItem>
										))}
								</SelectContent>
							</Select>
						</div>

						{/* Категория */}
						<div className='flex flex-col'>
							<label className='mb-1 text-sm text-gray-600'>Категория</label>
							<Select
								value={selectedCategory}
								onValueChange={setSelectedCategory}
							>
								<SelectTrigger className='w-[200px]'>
									<SelectValue placeholder='Все категории' />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value='all'>Все категории</SelectItem>
									{uniqueCategories
										.filter(category => category !== 'all')
										.map(category => (
											<SelectItem key={category} value={category}>
												{
													categoryLabels[
														category as keyof typeof categoryLabels
													]
												}
											</SelectItem>
										))}
								</SelectContent>
							</Select>
						</div>

						{/* Сортировка */}
						<div className='flex flex-col'>
							<label className='mb-1 text-sm text-gray-600'>Сортировка</label>
							<Select
								value={sortBy}
								onValueChange={value => setSortBy(value as 'newest' | 'oldest')}
							>
								<SelectTrigger className='w-[180px]'>
									<SelectValue placeholder='Сортировка' />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value='newest'>Сначала новые</SelectItem>
									<SelectItem value='oldest'>Сначала старые</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>
				</div>

				{/* Контент */}
				{filteredItems.length === 0 ? (
					<div className='rounded-lg bg-white p-12 text-center shadow '>
						<h3 className='mb-2 text-xl font-semibold'>Нет предметов</h3>
						<p className='mb-4 text-gray-600'>
							{items.length === 0
								? 'Добавьте первый предмет в гардероб'
								: 'Попробуйте изменить фильтры'}
						</p>
						<Button asChild>
							<a href='/add-item'>Добавить предмет</a>
						</Button>
					</div>
				) : (
					<>
						<div className='grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4'>
							{filteredItems.map(item => (
								<div
									key={item.id}
									className='group relative overflow-hidden rounded-lg bg-white shadow'
								>
									{/* Изображение */}
									<div className='relative aspect-square overflow-hidden'>
										<Image
											src={item.imageBase64}
											alt={item.description || 'Предмет одежды'}
											fill
											className='object-cover'
											sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
										/>
									</div>

									{/* Информация */}
									<div className='p-4'>
										<div className='mb-2 flex items-center gap-3'>
											<span className='rounded-full bg-blue-100 px-2 py-1 text-xs font-medium '>
												{categoryLabels[item.category]}
											</span>
											<span className='rounded-full bg-blue-100 px-2 py-1 text-xs font-medium '>
												{seasonLabels[item.season]}
											</span>
										</div>

										<p className='mb-3 line-clamp-2 text-sm text-gray-600 '>
											{item.description || 'Без описания'}
										</p>

										<div className='flex items-center justify-between text-xs text-gray-500'>
											<span>{formatDate(item.createdAt)}</span>
											<Button
												variant='ghost'
												size='sm'
												onClick={() => handleDeleteItem(item.id)}
												disabled={deletingId === item.id}
												className='text-red-500 hover:text-red-700 hover:bg-red-50'
											>
												{deletingId === item.id ? (
													<>Удаление...</>
												) : (
													<>Удалить</>
												)}
											</Button>
										</div>
									</div>
								</div>
							))}
						</div>
					</>
				)}
			</div>
		</div>
	)
}

export default Wardrobe
