'use client'

import { Button } from '@/components/ui/button'
import { Field, FieldGroup, FieldLabel, FieldSet } from '@/components/ui/field'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { wardrobeDB } from '@/lib/indexedDB'
import Image from 'next/image'
import { ChangeEvent, FormEvent, useRef, useState } from 'react'

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

const AddItem = () => {
	const [formData, setFormData] = useState<
		Omit<WardrobeItem, 'id' | 'createdAt'>
	>({
		season: 'winter',
		category: 'blouses',
		description: '',
		imageBase64: '',
	})

	const [imagePreview, setImagePreview] = useState<string | null>(null)

	const [uploading, setUploading] = useState(false)
	const fileInputRef = useRef<HTMLInputElement>(null)

	// Простая функция для сжатия Base64 (без использования DOM Image)
	const compressBase64Image = async (base64: string): Promise<string> => {
		// Если изображение уже меньше 500KB, не сжимаем
		const base64Size = (base64.length * 3) / 4 // Примерный размер в байтах
		if (base64Size < 500 * 1024) {
			return base64
		}

		// Для больших изображений - альтернативный подход
		return new Promise(resolve => {
			// Создаем HTML Image элемент только на клиенте
			if (typeof window !== 'undefined') {
				const img = document.createElement('img')
				img.onload = () => {
					const canvas = document.createElement('canvas')
					let width = img.width
					let height = img.height

					// Ограничиваем максимальный размер
					const MAX_WIDTH = 1200
					const MAX_HEIGHT = 1200

					if (width > height) {
						if (width > MAX_WIDTH) {
							height = (height * MAX_WIDTH) / width
							width = MAX_WIDTH
						}
					} else {
						if (height > MAX_HEIGHT) {
							width = (width * MAX_HEIGHT) / height
							height = MAX_HEIGHT
						}
					}

					canvas.width = width
					canvas.height = height

					const ctx = canvas.getContext('2d')
					if (ctx) {
						ctx.drawImage(img, 0, 0, width, height)

						// Конвертируем в JPEG с качеством 70%
						const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7)
						resolve(compressedBase64)
					} else {
						// Если canvas недоступен, возвращаем оригинал
						resolve(base64)
					}
				}
				img.onerror = () => {
					// В случае ошибки возвращаем оригинал
					resolve(base64)
				}
				img.src = base64
			} else {
				// На сервере возвращаем как есть
				resolve(base64)
			}
		})
	}

	// Упрощенная функция сжатия без использования DOM
	const simpleCompress = async (base64: string): Promise<string> => {
		// Если браузер доступен, пробуем сжать
		if (typeof window === 'undefined') {
			return base64
		}

		try {
			return await compressBase64Image(base64)
		} catch (error) {
			console.error('Compression failed, using original:', error)
			return base64
		}
	}

	const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
		const { name, value } = e.target
		setFormData(prev => ({
			...prev,
			[name]: value,
		}))
	}

	const handleSelectChange = (name: keyof WardrobeItem, value: string) => {
		setFormData(prev => ({
			...prev,
			[name]: value,
		}))
	}

	const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (!file) return

		if (!file.type.startsWith('image/')) {
			alert('Пожалуйста, выберите изображение')
			return
		}

		if (file.size > 10 * 1024 * 1024) {
			alert('Изображение должно быть меньше 10MB')
			return
		}

		setUploading(true)

		try {
			// Читаем файл как base64
			const base64 = await new Promise<string>(resolve => {
				const reader = new FileReader()
				reader.onloadend = () => resolve(reader.result as string)
				reader.readAsDataURL(file)
			})

			// Показываем оригинал сразу для preview
			setImagePreview(base64)
			setFormData(prev => ({
				...prev,
				imageBase64: base64,
			}))

			// Сжимаем в фоне
			const compressedBase64 = await simpleCompress(base64)
			if (compressedBase64 !== base64) {
				setFormData(prev => ({
					...prev,
					imageBase64: compressedBase64,
				}))
			}
		} catch (error) {
			console.error('Error processing image:', error)
			alert('Ошибка при обработке изображения')
		} finally {
			setUploading(false)
		}
	}

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault()

		if (!formData.imageBase64) {
			alert('Пожалуйста, добавьте фотографию предмета')
			return
		}

		setUploading(true)

		try {
			const newItem: WardrobeItem = {
				id: Date.now().toString(),
				season: formData.season,
				category: formData.category,
				description: formData.description,
				imageBase64: formData.imageBase64,
				createdAt: new Date().toISOString(),
			}

			// Сохраняем в IndexedDB
			await wardrobeDB.addItem(newItem)

			alert(`Предмет успешно добавлен в гардероб!`)

			// Сбрасываем форму
			setFormData({
				season: 'winter',
				category: 'blouses',
				description: '',
				imageBase64: '',
			})
			setImagePreview(null)

			if (fileInputRef.current) {
				fileInputRef.current.value = ''
			}

			console.log('Предмет сохранен в IndexedDB:', newItem)
		} catch (error) {
			console.error('Ошибка при сохранении:', error)
			alert('Произошла ошибка при сохранении. Пожалуйста, попробуйте снова.')
		} finally {
			setUploading(false)
		}
	}

	const handleCancel = () => {
		if (
			window.confirm('Вы уверены? Все несохраненные данные будут потеряны.')
		) {
			setFormData({
				season: 'winter',
				category: 'blouses',
				description: '',
				imageBase64: '',
			})
			setImagePreview(null)
			if (fileInputRef.current) {
				fileInputRef.current.value = ''
			}
		}
	}

	return (
		<div className='min-h-screen bg-zinc-50 font-sans'>
			<div className='flex flex-col items-center justify-center px-4 py-8 mx-auto'>
				<div className='mb-8 text-center'>
					<h1 className='mb-2 text-3xl font-bold'>Добавить предмет</h1>
				</div>
				<div className='w-full max-w-md rounded-lg bg-white p-4 shadow '>
					<form onSubmit={handleSubmit}>
						<FieldGroup>
							<FieldSet>
								<FieldGroup>
									<Field>
										<FieldLabel htmlFor='item-photo'>Фото</FieldLabel>
										<div>
											<input
												ref={fileInputRef}
												type='file'
												id='item-photo'
												accept='image/*'
												onChange={handleImageUpload}
												className='hidden'
												disabled={uploading}
											/>

											{uploading && !imagePreview ? (
												<div className='flex h-50 items-center justify-center rounded-lg border-2 border-dashed border-gray-300'>
													<div className='text-center'>
														<div className='mb-2 h-8 w-8 animate-spin rounded-full border-4 border-gray300 border-t-transparent'></div>
														<p className='text-gray-600'>Загрузка...</p>
													</div>
												</div>
											) : imagePreview ? (
												<div className='relative'>
													<div className='relative h-50 w-full overflow-hidden rounded-lg border-2 border-dashed border-gray-300'>
														<Image
															src={imagePreview}
															alt='Предпросмотр одежды'
															fill
															className='object-contain p-2'
															sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
														/>
													</div>
													<div className='mt-2 '>
														<Button
															type='button'
															variant='outline'
															size='sm'
															onClick={() => fileInputRef.current?.click()}
															disabled={uploading}
														>
															Изменить
														</Button>
													</div>
												</div>
											) : (
												<div
													className='flex h-50 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400'
													onClick={() => fileInputRef.current?.click()}
												>
													<p className='text-gray-600'>
														Нажмите для выбора фото
													</p>
													<p className='text-sm text-gray-500'>
														JPG, PNG, WEBP (до 10MB)
													</p>
												</div>
											)}
										</div>
									</Field>

									<Field>
										<FieldLabel htmlFor='item-season'>Сезон</FieldLabel>
										<Select
											value={formData.season}
											onValueChange={value =>
												handleSelectChange('season', value)
											}
											disabled={uploading}
										>
											<SelectTrigger id='item-season'>
												<SelectValue />
											</SelectTrigger>
											<SelectContent className='bg-white'>
												<SelectItem value='winter'>Зима</SelectItem>
												<SelectItem value='spring'>Весна</SelectItem>
												<SelectItem value='summer'>Лето</SelectItem>
												<SelectItem value='autumn'>Осень</SelectItem>
											</SelectContent>
										</Select>
									</Field>

									<Field>
										<FieldLabel htmlFor='item-category'>Категория</FieldLabel>
										<Select
											value={formData.category}
											onValueChange={value =>
												handleSelectChange('category', value)
											}
											disabled={uploading}
										>
											<SelectTrigger id='item-category'>
												<SelectValue />
											</SelectTrigger>
											<SelectContent className='bg-white'>
												<SelectItem value='blouses'>Блузы</SelectItem>
												<SelectItem value='tops'>Футболки и топы</SelectItem>
												<SelectItem value='cardigans'>
													Пиджаки и кардиганы
												</SelectItem>
												<SelectItem value='dresses'>Платья</SelectItem>
												<SelectItem value='bottoms'>Брюки</SelectItem>
												<SelectItem value='pants'>Спортивные штаны</SelectItem>
												<SelectItem value='skirts'>Юбки</SelectItem>
												<SelectItem value='outwear'>Верхняя одежда</SelectItem>
												<SelectItem value='accessories'>Колготки</SelectItem>
												<SelectItem value='shoes'>Обувь</SelectItem>
											</SelectContent>
										</Select>
									</Field>
								</FieldGroup>
							</FieldSet>

							<FieldSet>
								<FieldGroup>
									<Field>
										<FieldLabel htmlFor='item-description'>Описание</FieldLabel>
										<Textarea
											id='item-description'
											name='description'
											value={formData.description}
											onChange={handleInputChange}
											placeholder='Описание предмета'
											className='resize-none'
											disabled={uploading}
										/>
									</Field>
								</FieldGroup>
							</FieldSet>

							<Field orientation='horizontal' className='justify-between'>
								<div className='space-x-2'>
									<Button
										type='button'
										variant='outline'
										onClick={handleCancel}
										disabled={uploading}
									>
										Отмена
									</Button>
									<Button
										type='submit'
										disabled={!formData.imageBase64 || uploading}
									>
										{uploading ? 'Сохранение...' : 'Добавить'}
									</Button>
								</div>
							</Field>
						</FieldGroup>
					</form>
				</div>
			</div>
		</div>
	)
}

export default AddItem
