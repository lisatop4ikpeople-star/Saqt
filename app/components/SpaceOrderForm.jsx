'use client'

import { useState } from 'react'

const cosmicColors = [
  {
    value: 'nebula-purple',
    label: 'Туманно-фиолетовый',
    hex: '#8b5cf6',
  },
  {
    value: 'stellar-pink',
    label: 'Звездно-розовый',
    hex: '#ec4899',
  },
  {
    value: 'galaxy-blue',
    label: 'Галактический синий',
    hex: '#3b82f6',
  },
  {
    value: 'solar-gold',
    label: 'Солнечно-золотой',
    hex: '#facc15',
  },
  {
    value: 'comet-cyan',
    label: 'Кометный бирюзовый',
    hex: '#22d3ee',
  },
]

const menuItems = [
  {
    value: 'eclairs',
    label: 'Эклеры',
  },
  {
    value: 'cupcakes',
    label: 'Капкейки',
  },
  {
    value: 'macarons',
    label: 'Макаронс',
  },
  {
    value: 'cake',
    label: 'Торт',
  },
  {
    value: 'cookies',
    label: 'Печенье',
  },
  {
    value: 'dessert-box',
    label: 'Десертный бокс',
  },
]

const deliveryTypes = [
  {
    value: 'delivery',
    label: 'Нужна доставка',
  },
  {
    value: 'pickup',
    label: 'Самовывоз',
  },
]

const initialQuantities = menuItems.reduce((acc, item) => {
  acc[item.value] = ''
  return acc
}, {})

export default function SpaceOrderForm() {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    email: '',
    color: '',
    orderItems: [],
    quantities: initialQuantities,
    orderTheme: '',
    deliveryType: '',
    deliveryAddress: '',
    pickupAddress: '',
    menuSuggestion: '',
    comment: '',
  })

  const [status, setStatus] = useState({
    type: '',
    message: '',
  })

  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleCheckboxChange = (event) => {
    const { value, checked } = event.target

    setFormData((prev) => {
      if (checked) {
        return {
          ...prev,
          orderItems: [...prev.orderItems, value],
          quantities: {
            ...prev.quantities,
            [value]: prev.quantities[value] || '1',
          },
        }
      }

      return {
        ...prev,
        orderItems: prev.orderItems.filter((item) => item !== value),
        quantities: {
          ...prev.quantities,
          [value]: '',
        },
      }
    })
  }

  const handleQuantityChange = (event, itemValue) => {
    const value = event.target.value

    setFormData((prev) => ({
      ...prev,
      quantities: {
        ...prev.quantities,
        [itemValue]: value,
      },
    }))
  }

  const handleDeliveryTypeChange = (event) => {
    const value = event.target.value

    setFormData((prev) => ({
      ...prev,
      deliveryType: value,
      deliveryAddress: value === 'delivery' ? prev.deliveryAddress : '',
      pickupAddress: value === 'pickup' ? prev.pickupAddress : '',
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    setStatus({
      type: '',
      message: '',
    })

    if (!formData.name.trim()) {
      setStatus({
        type: 'error',
        message: 'Введите имя',
      })
      return
    }

    if (!formData.age.trim()) {
      setStatus({
        type: 'error',
        message: 'Введите возраст',
      })
      return
    }

    if (Number(formData.age) <= 0) {
      setStatus({
        type: 'error',
        message: 'Возраст должен быть больше 0',
      })
      return
    }

    if (!formData.email.trim()) {
      setStatus({
        type: 'error',
        message: 'Введите email',
      })
      return
    }

    if (!formData.color) {
      setStatus({
        type: 'error',
        message: 'Выберите космический цвет',
      })
      return
    }

    if (!formData.orderTheme.trim()) {
      setStatus({
        type: 'error',
        message: 'Введите тему заказа',
      })
      return
    }

    if (formData.orderItems.length === 0) {
      setStatus({
        type: 'error',
        message: 'Выберите, что хотите заказать',
      })
      return
    }

    const hasInvalidQuantity = formData.orderItems.some((item) => {
      const quantity = Number(formData.quantities[item])
      return !quantity || quantity <= 0
    })

    if (hasInvalidQuantity) {
      setStatus({
        type: 'error',
        message: 'Укажите количество для каждого выбранного продукта',
      })
      return
    }

    if (!formData.deliveryType) {
      setStatus({
        type: 'error',
        message: 'Выберите доставку или самовывоз',
      })
      return
    }

    if (formData.deliveryType === 'delivery' && !formData.deliveryAddress.trim()) {
      setStatus({
        type: 'error',
        message: 'Введите адрес доставки',
      })
      return
    }

    if (formData.deliveryType === 'pickup' && !formData.pickupAddress.trim()) {
      setStatus({
        type: 'error',
        message: 'Введите адрес самовывоза',
      })
      return
    }

    try {
      setIsLoading(true)

      const response = await fetch('/api/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Ошибка отправки формы')
      }

      setStatus({
        type: 'success',
        message: 'Заявка отправлена. Подтверждение также ушло на вашу почту.',
      })

      setFormData({
        name: '',
        age: '',
        email: '',
        color: '',
        orderItems: [],
        quantities: initialQuantities,
        orderTheme: '',
        deliveryType: '',
        deliveryAddress: '',
        pickupAddress: '',
        menuSuggestion: '',
        comment: '',
      })
    } catch (error) {
      setStatus({
        type: 'error',
        message: error.message || 'Не удалось отправить форму',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const selectedColor = cosmicColors.find((color) => color.value === formData.color)

  return (
    <div className="relative z-10 w-full max-w-[720px] rounded-[28px] border border-white/10 bg-[#120F17]/85 p-6 shadow-[0_0_60px_rgba(132,0,255,0.28)] backdrop-blur-xl">
      <div className="mb-6">
        <p className="mb-2 text-sm uppercase tracking-[0.35em] text-fuchsia-300/80">
          Космическая анкета
        </p>

        <h2 className="text-3xl font-semibold text-white">
          Собери свой десертный космос
        </h2>

        <p className="mt-3 text-sm leading-6 text-white/65">
          Заполните анкету: выберите десерты, количество, тему заказа и способ получения.
          Заявка уйдет нам, а подтверждение придет вам на почту.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm text-white/80">
              Имя
            </span>

            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Например, Илья"
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-white/35 focus:border-fuchsia-400 focus:bg-white/10 focus:shadow-[0_0_24px_rgba(217,70,239,0.25)]"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm text-white/80">
              Возраст
            </span>

            <input
              type="number"
              name="age"
              min="1"
              max="120"
              value={formData.age}
              onChange={handleChange}
              placeholder="Например, 12"
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-white/35 focus:border-fuchsia-400 focus:bg-white/10 focus:shadow-[0_0_24px_rgba(217,70,239,0.25)]"
            />
          </label>
        </div>

        <label className="block">
          <span className="mb-2 block text-sm text-white/80">
            Email для подтверждения
          </span>

          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="example@mail.com"
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-white/35 focus:border-fuchsia-400 focus:bg-white/10 focus:shadow-[0_0_24px_rgba(217,70,239,0.25)]"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm text-white/80">
            Тема заказа
          </span>

          <input
            type="text"
            name="orderTheme"
            value={formData.orderTheme}
            onChange={handleChange}
            placeholder="Например: день рождения, детский праздник, подарок, корпоратив"
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-white/35 focus:border-fuchsia-400 focus:bg-white/10 focus:shadow-[0_0_24px_rgba(217,70,239,0.25)]"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm text-white/80">
            Космический цвет
          </span>

          <select
            name="color"
            value={formData.color}
            onChange={handleChange}
            className="w-full rounded-2xl border border-white/10 bg-[#1b1324] px-4 py-3 text-white outline-none transition focus:border-fuchsia-400 focus:shadow-[0_0_24px_rgba(217,70,239,0.25)]"
          >
            <option value="">
              Выберите цвет
            </option>

            {cosmicColors.map((color) => (
              <option key={color.value} value={color.value}>
                {color.label}
              </option>
            ))}
          </select>
        </label>

        {selectedColor && (
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <span
              className="h-5 w-5 rounded-full shadow-[0_0_18px_currentColor]"
              style={{
                backgroundColor: selectedColor.hex,
                color: selectedColor.hex,
              }}
            />

            <span className="text-sm text-white/75">
              Выбран цвет: {selectedColor.label}
            </span>
          </div>
        )}

        <div>
          <span className="mb-3 block text-sm text-white/80">
            Что хотите заказать и в каком количестве?
          </span>

          <div className="space-y-3">
            {menuItems.map((item) => {
              const checked = formData.orderItems.includes(item.value)

              return (
                <div
                  key={item.value}
                  className="grid grid-cols-1 gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 md:grid-cols-[1fr_140px]"
                >
                  <label className="flex cursor-pointer items-center gap-3 text-sm text-white/75">
                    <input
                      type="checkbox"
                      value={item.value}
                      checked={checked}
                      onChange={handleCheckboxChange}
                      className="h-4 w-4 accent-fuchsia-500"
                    />

                    {item.label}
                  </label>

                  <input
                    type="number"
                    min="1"
                    value={formData.quantities[item.value]}
                    disabled={!checked}
                    onChange={(event) => handleQuantityChange(event, item.value)}
                    placeholder="Кол-во"
                    className="w-full rounded-xl border border-white/10 bg-[#1b1324] px-3 py-2 text-white outline-none transition placeholder:text-white/35 disabled:cursor-not-allowed disabled:opacity-40 focus:border-fuchsia-400"
                  />
                </div>
              )
            })}
          </div>
        </div>

        <div>
          <span className="mb-3 block text-sm text-white/80">
            Получение заказа
          </span>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {deliveryTypes.map((item) => (
              <label
                key={item.value}
                className="flex cursor-pointer items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/75 transition hover:border-fuchsia-400/60 hover:bg-white/10"
              >
                <input
                  type="radio"
                  name="deliveryType"
                  value={item.value}
                  checked={formData.deliveryType === item.value}
                  onChange={handleDeliveryTypeChange}
                  className="h-4 w-4 accent-fuchsia-500"
                />

                {item.label}
              </label>
            ))}
          </div>
        </div>

        {formData.deliveryType === 'delivery' && (
          <label className="block">
            <span className="mb-2 block text-sm text-white/80">
              Адрес доставки
            </span>

            <textarea
              name="deliveryAddress"
              value={formData.deliveryAddress}
              onChange={handleChange}
              placeholder="Введите адрес, куда нужно доставить заказ"
              rows={3}
              className="w-full resize-none rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-white/35 focus:border-fuchsia-400 focus:bg-white/10 focus:shadow-[0_0_24px_rgba(217,70,239,0.25)]"
            />
          </label>
        )}

        {formData.deliveryType === 'pickup' && (
          <label className="block">
            <span className="mb-2 block text-sm text-white/80">
              Адрес самовывоза
            </span>

            <input
              type="text"
              name="pickupAddress"
              value={formData.pickupAddress}
              onChange={handleChange}
              placeholder="Введите адрес, куда подъехать за заказом"
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-white/35 focus:border-fuchsia-400 focus:bg-white/10 focus:shadow-[0_0_24px_rgba(217,70,239,0.25)]"
            />
          </label>
        )}

        <label className="block">
          <span className="mb-2 block text-sm text-white/80">
            Что добавить в меню?
          </span>

          <textarea
            name="menuSuggestion"
            value={formData.menuSuggestion}
            onChange={handleChange}
            placeholder="Например: чизкейки, космические пончики, наборы для праздника..."
            rows={3}
            className="w-full resize-none rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-white/35 focus:border-fuchsia-400 focus:bg-white/10 focus:shadow-[0_0_24px_rgba(217,70,239,0.25)]"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm text-white/80">
            Комментарий к заказу
          </span>

          <textarea
            name="comment"
            value={formData.comment}
            onChange={handleChange}
            placeholder="Например: без орехов, нужна открытка, доставка вечером..."
            rows={4}
            className="w-full resize-none rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-white/35 focus:border-fuchsia-400 focus:bg-white/10 focus:shadow-[0_0_24px_rgba(217,70,239,0.25)]"
          />
        </label>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-2xl bg-gradient-to-r from-fuchsia-500 via-violet-500 to-cyan-400 px-5 py-4 text-base font-semibold text-white transition hover:scale-[1.02] hover:shadow-[0_0_35px_rgba(132,0,255,0.5)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
        >
          {isLoading ? 'Отправляем...' : 'Отправить заявку'}
        </button>

        {status.message && (
          <p
            className={`rounded-2xl px-4 py-3 text-sm ${
              status.type === 'success'
                ? 'border border-emerald-400/30 bg-emerald-400/10 text-emerald-200'
                : 'border border-red-400/30 bg-red-400/10 text-red-200'
            }`}
          >
            {status.message}
          </p>
        )}
      </form>
    </div>
  )
}