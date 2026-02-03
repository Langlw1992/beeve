import type {DateValue} from '@internationalized/date'

/**
 * 格式化日期值为指定格式的字符串
 *
 * 支持的格式 token:
 * - YYYY: 4位年份 (2025)
 * - YY: 2位年份 (25)
 * - MM: 2位月份 (01-12)
 * - M: 月份 (1-12)
 * - DD: 2位日期 (01-31)
 * - D: 日期 (1-31)
 * - HH: 24小时制小时 (00-23)
 * - hh: 12小时制小时 (01-12)
 * - mm: 分钟 (00-59)
 * - ss: 秒 (00-59)
 * - A: AM/PM
 *
 * @param date - DateValue 对象
 * @param format - 格式字符串，如 "YYYY-MM-DD"
 * @returns 格式化后的日期字符串
 *
 * @example
 * formatDate(date, "YYYY-MM-DD") // "2025-02-03"
 * formatDate(date, "DD/MM/YYYY") // "03/02/2025"
 * formatDate(date, "YYYY年MM月DD日") // "2025年02月03日"
 */
export function formatDate(date: DateValue, format: string): string {
  if (!date) {
    return ''
  }

  const pad = (num: number, length = 2): string => {
    return String(num).padStart(length, '0')
  }

  let result = format

  // 年份
  result = result.replace(/YYYY/g, String(date.year))
  result = result.replace(/YY/g, String(date.year).slice(-2))

  // 月份
  result = result.replace(/MM/g, pad(date.month))
  result = result.replace(/M/g, String(date.month))

  // 日期
  result = result.replace(/DD/g, pad(date.day))
  result = result.replace(/D/g, String(date.day))

  // 时间部分（如果存在）
  if ('hour' in date) {
    const hour = date.hour as number
    const minute = date.minute as number
    const second = date.second as number

    // 24小时制
    result = result.replace(/HH/g, pad(hour))

    // 12小时制
    const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
    result = result.replace(/hh/g, pad(hour12))

    // AM/PM
    const ampm = hour >= 12 ? 'PM' : 'AM'
    result = result.replace(/A/g, ampm)

    // 分钟
    result = result.replace(/mm/g, pad(minute))

    // 秒
    result = result.replace(/ss/g, pad(second))
  }

  return result
}
