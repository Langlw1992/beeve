import type {BaseColorName, BaseColorPreset} from '../types'
import {neutral} from './neutral'
import {zinc} from './zinc'
import {stone} from './stone'
import {gray} from './gray'
import {slate} from './slate'

export const baseColors: Record<BaseColorName, BaseColorPreset> = {
  neutral,
  zinc,
  stone,
  gray,
  slate,
}

export {neutral, zinc, stone, gray, slate}
