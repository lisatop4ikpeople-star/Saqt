import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const RATE_LIMIT_WINDOW_MS = 3 * 60 * 1000
const RATE_LIMIT_MAX_REQUESTS = 5

const rateLimitStore = new Map()

const colorLabels = {
  'nebula-purple': 'Туманно-фиолетовый',
  'stellar-pink': 'Звездно-розовый',
  'galaxy-blue': 'Галактический синий',
  'solar-gold': 'Солнечно-золотой',
  'comet-cyan': 'Кометный бирюзовый',
}

const menuLabels = {
  eclairs: 'Эклеры',
  cupcakes: 'Капкейки',
  macarons: 'Макаронс',
  cake: 'Торт',
  cookies: 'Печенье',
  'dessert-box': 'Десертный бокс',
}

const deliveryLabels = {
  delivery: 'Нужна доставка',
  pickup: 'Самовывоз',
}

export async function POST(request) {
  try {
    const ip = getClientIp(request)
    const rateLimitResult = checkRateLimit(ip)

    if (!rateLimitResult.allowed) {
      return Response.json(
        {
          message: `Слишком много заявок. Попробуйте снова через ${rateLimitResult.retryAfterSeconds} сек.`,
        },
        {
          status: 429,
        }
      )
    }

    const body = await request.json()

    const name = String(body.name || '').trim()
    const age = String(body.age || '').trim()
    const email = String(body.email || '').trim()
    const color = String(body.color || '').trim()
    const orderTheme = String(body.orderTheme || '').trim()
    const deliveryType = String(body.deliveryType || '').trim()
    const deliveryAddress = String(body.deliveryAddress || '').trim()
    const pickupAddress = String(body.pickupAddress || '').trim()
    const menuSuggestion = String(body.menuSuggestion || '').trim()
    const comment = String(body.comment || '').trim()

    const orderItems = Array.isArray(body.orderItems) ? body.orderItems : []
    const quantities = body.quantities && typeof body.quantities === 'object' ? body.quantities : {}

    if (!name || !age || !email || !color || !orderTheme || orderItems.length === 0 || !deliveryType) {
      return Response.json(
        {
          message: 'Заполните обязательные поля',
        },
        {
          status: 400,
        }
      )
    }

    if (Number(age) <= 0) {
      return Response.json(
        {
          message: 'Возраст должен быть больше 0',
        },
        {
          status: 400,
        }
      )
    }

    if (!isValidEmail(email)) {
      return Response.json(
        {
          message: 'Введите корректный email',
        },
        {
          status: 400,
        }
      )
    }

    if (!colorLabels[color]) {
      return Response.json(
        {
          message: 'Выбран некорректный цвет',
        },
        {
          status: 400,
        }
      )
    }

    if (!deliveryLabels[deliveryType]) {
      return Response.json(
        {
          message: 'Выбран некорректный способ получения заказа',
        },
        {
          status: 400,
        }
      )
    }

    if (deliveryType === 'delivery' && !deliveryAddress) {
      return Response.json(
        {
          message: 'Введите адрес доставки',
        },
        {
          status: 400,
        }
      )
    }

    if (deliveryType === 'pickup' && !pickupAddress) {
      return Response.json(
        {
          message: 'Введите адрес самовывоза',
        },
        {
          status: 400,
        }
      )
    }

    const orderList = orderItems
      .filter((item) => menuLabels[item])
      .map((item) => {
        const quantity = Number(quantities[item])

        return {
          value: item,
          label: menuLabels[item],
          quantity,
        }
      })
      .filter((item) => item.quantity > 0)

    if (orderList.length === 0) {
      return Response.json(
        {
          message: 'Выберите продукты и укажите количество',
        },
        {
          status: 400,
        }
      )
    }

    if (!process.env.RESEND_API_KEY) {
      return Response.json(
        {
          message: 'На сервере не указан RESEND_API_KEY',
        },
        {
          status: 500,
        }
      )
    }

    if (!process.env.RESEND_FROM_EMAIL || !process.env.RESEND_TO_EMAIL) {
      return Response.json(
        {
          message: 'На сервере не указаны RESEND_FROM_EMAIL или RESEND_TO_EMAIL',
        },
        {
          status: 500,
        }
      )
    }

    const orderText = orderList
      .map((item) => `${item.label} - ${item.quantity} шт.`)
      .join(', ')

    const receiveAddress =
      deliveryType === 'delivery'
        ? deliveryAddress
        : pickupAddress

    const ownerHtml = createOwnerEmailHtml({
      name,
      age,
      email,
      color: colorLabels[color],
      orderTheme,
      orderText,
      deliveryType: deliveryLabels[deliveryType],
      receiveAddress,
      menuSuggestion,
      comment,
    })

    const clientHtml = createClientEmailHtml({
      name,
      color: colorLabels[color],
      orderTheme,
      orderText,
      deliveryType: deliveryLabels[deliveryType],
      receiveAddress,
    })

    const [ownerResult, clientResult] = await Promise.all([
      resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL,
        to: [process.env.RESEND_TO_EMAIL],
        replyTo: email,
        subject: `Новая заявка: ${orderTheme}`,
        html: ownerHtml,
      }),

      resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL,
        to: [email],
        subject: 'Мы получили вашу заявку',
        html: clientHtml,
      }),
    ])

    if (ownerResult.error) {
      return Response.json(
        {
          message: ownerResult.error.message || 'Не удалось отправить письмо владельцу сайта',
        },
        {
          status: 500,
        }
      )
    }

    if (clientResult.error) {
      return Response.json(
        {
          message: clientResult.error.message || 'Не удалось отправить подтверждение клиенту',
        },
        {
          status: 500,
        }
      )
    }

    return Response.json(
      {
        message: 'Заявка успешно отправлена',
        ownerEmailId: ownerResult.data?.id,
        clientEmailId: clientResult.data?.id,
      },
      {
        status: 200,
      }
    )
  } catch (error) {
    return Response.json(
      {
        message: error.message || 'Внутренняя ошибка сервера',
      },
      {
        status: 500,
      }
    )
  }
}

function createOwnerEmailHtml(data) {
  return `
    <div style="font-family: Arial, sans-serif; background: #090313; padding: 24px;">
      <div style="max-width: 680px; margin: 0 auto; background: #120F17; border: 1px solid rgba(255,255,255,0.12); border-radius: 20px; padding: 24px; color: #ffffff;">
        <p style="margin: 0 0 8px; color: #d946ef; text-transform: uppercase; letter-spacing: 3px; font-size: 12px;">
          Новая космическая заявка
        </p>

        <h1 style="margin: 0 0 20px; font-size: 26px;">
          Заявка с сайта Пироженка
        </h1>

        <div style="padding: 16px; border-radius: 16px; background: rgba(255,255,255,0.06);">
          <p style="margin: 0 0 12px;"><strong>Имя:</strong> ${escapeHtml(data.name)}</p>
          <p style="margin: 0 0 12px;"><strong>Возраст:</strong> ${escapeHtml(data.age)}</p>
          <p style="margin: 0 0 12px;"><strong>Email:</strong> ${escapeHtml(data.email)}</p>
          <p style="margin: 0 0 12px;"><strong>Тема заказа:</strong> ${escapeHtml(data.orderTheme)}</p>
          <p style="margin: 0 0 12px;"><strong>Космический цвет:</strong> ${escapeHtml(data.color)}</p>
          <p style="margin: 0 0 12px;"><strong>Что хочет заказать:</strong> ${escapeHtml(data.orderText)}</p>
          <p style="margin: 0 0 12px;"><strong>Получение:</strong> ${escapeHtml(data.deliveryType)}</p>
          <p style="margin: 0 0 12px;"><strong>Адрес:</strong> ${escapeHtml(data.receiveAddress)}</p>
          <p style="margin: 0 0 12px;"><strong>Что добавить в меню:</strong> ${escapeHtml(data.menuSuggestion || 'Не указано')}</p>
          <p style="margin: 0;"><strong>Комментарий:</strong> ${escapeHtml(data.comment || 'Не указано')}</p>
        </div>

        <p style="margin-top: 18px; line-height: 1.6; color: rgba(255,255,255,0.65);">
          Можно нажать “Ответить” на это письмо, и ответ уйдет клиенту на ${escapeHtml(data.email)}.
        </p>
      </div>
    </div>
  `
}

function createClientEmailHtml(data) {
  return `
    <div style="font-family: Arial, sans-serif; background: #090313; padding: 24px;">
      <div style="max-width: 680px; margin: 0 auto; background: #120F17; border: 1px solid rgba(255,255,255,0.12); border-radius: 20px; padding: 24px; color: #ffffff;">
        <p style="margin: 0 0 8px; color: #d946ef; text-transform: uppercase; letter-spacing: 3px; font-size: 12px;">
          Пироженка
        </p>

        <h1 style="margin: 0 0 20px; font-size: 26px;">
          Мы получили вашу заявку
        </h1>

        <p style="line-height: 1.6; color: rgba(255,255,255,0.78);">
          ${escapeHtml(data.name)}, спасибо за заявку. Мы получили ваш заказ и скоро свяжемся с вами.
        </p>

        <div style="margin-top: 20px; padding: 16px; border-radius: 16px; background: rgba(255,255,255,0.06);">
          <p style="margin: 0 0 12px;"><strong>Тема заказа:</strong> ${escapeHtml(data.orderTheme)}</p>
          <p style="margin: 0 0 12px;"><strong>Что вы выбрали:</strong> ${escapeHtml(data.orderText)}</p>
          <p style="margin: 0 0 12px;"><strong>Космический цвет:</strong> ${escapeHtml(data.color)}</p>
          <p style="margin: 0 0 12px;"><strong>Получение:</strong> ${escapeHtml(data.deliveryType)}</p>
          <p style="margin: 0;"><strong>Адрес:</strong> ${escapeHtml(data.receiveAddress)}</p>
        </div>

        <p style="margin-top: 20px; line-height: 1.6; color: rgba(255,255,255,0.6);">
          Это автоматическое письмо. Если вы отправили заявку случайно, просто проигнорируйте его.
        </p>
      </div>
    </div>
  `
}

function checkRateLimit(ip) {
  const now = Date.now()
  const record = rateLimitStore.get(ip)

  if (!record) {
    rateLimitStore.set(ip, {
      count: 1,
      startTime: now,
    })

    return {
      allowed: true,
      retryAfterSeconds: 0,
    }
  }

  const timePassed = now - record.startTime

  if (timePassed > RATE_LIMIT_WINDOW_MS) {
    rateLimitStore.set(ip, {
      count: 1,
      startTime: now,
    })

    return {
      allowed: true,
      retryAfterSeconds: 0,
    }
  }

  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    const retryAfterSeconds = Math.ceil((RATE_LIMIT_WINDOW_MS - timePassed) / 1000)

    return {
      allowed: false,
      retryAfterSeconds,
    }
  }

  record.count += 1
  rateLimitStore.set(ip, record)

  return {
    allowed: true,
    retryAfterSeconds: 0,
  }
}

function getClientIp(request) {
  const forwardedFor = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')

  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }

  if (realIp) {
    return realIp
  }

  return 'unknown'
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}