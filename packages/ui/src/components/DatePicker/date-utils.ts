import * as datePicker from '@zag-js/date-picker'
import type { DateValue } from '@internationalized/date'
import { CalendarDate } from '@internationalized/date'

/**
 * 解析多种格式的日期值为 DateValue
 * 优先使用 zag.js 的内置 parse 函数
 * 
 * @param value - 字符串、Date 对象或 DateValue
 * @returns DateValue 或 undefined
 */
export function parseDateValue(value: string | Date | DateValue | undefined): DateValue | undefined {
  if (!value) {
    return undefined
  }

  // 已经是 DateValue
  if (typeof value === 'object' && 'calendar' in value) {
    return value
  }

  // Date 对象
  if (value instanceof Date) {
    const year = value.getFullYear()
    const month = value.getMonth() + 1
    const day = value.getDate()
    return new CalendarDate(year, month, day)
  }

  // 字符串 - 使用 zag.js 内置解析
  if (typeof value === 'string') {
    try {
      return datePicker.parse(value)
    } catch {
      return undefined
    }
  }

  return undefined
}

/**
 * DateValue 转 Date 对象
 * 
 * @param value - DateValue
 * @returns Date 对象或 undefined
 */
export function dateValueToDate(value: DateValue | undefined): Date | undefined {
  if (!value) {
    return undefined
  }
  return new Date(value.year, value.month - 1, value.day)
}
