import { Button } from '@/components/ui/button'
import {
	Field,
	FieldGroup,
	FieldLabel,
	FieldLegend,
	FieldSeparator,
	FieldSet,
} from '@/components/ui/field'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'

const Filter = () => {
	return (
		<div className='flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black'>
			<div className='w-full max-w-md'>
				<form>
					<FieldGroup>
						<FieldSet>
							<FieldLegend>Фильтр</FieldLegend>
							<FieldGroup>
								<Field>
									<FieldLabel htmlFor='checkout-exp-season-ts6'>
										Сезон
									</FieldLabel>
									<Select defaultValue=''>
										<SelectTrigger id='checkout-exp-month-ts6'>
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
									<FieldLabel htmlFor='checkout-7j9-exp-category-f59'>
										Категория
									</FieldLabel>
									<Select defaultValue=''>
										<SelectTrigger id='checkout-7j9-exp-year-f59'>
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
						<FieldSeparator />

						<Field orientation='horizontal'>
							<Button type='button'>Отмена</Button>
							<Button type='submit' variant='outline'>
								Поиск
							</Button>
						</Field>
					</FieldGroup>
				</form>
			</div>
		</div>
	)
}
export default Filter
