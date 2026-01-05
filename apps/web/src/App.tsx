import type { Component } from 'solid-js'
import { Router, type Route } from './router'
import { Layout } from './components/Layout'
import { HomePage } from './pages/HomePage'
import { ButtonPage } from './pages/ButtonPage'
import { InputPage } from './pages/InputPage'
import { SelectPage } from './pages/SelectPage'
import { CheckboxPage } from './pages/CheckboxPage'
import { SwitchPage } from './pages/SwitchPage'
import { RadioPage } from './pages/RadioPage'
import { SliderPage } from './pages/SliderPage'
import { LabelPage } from './pages/LabelPage'
import { DialogPage } from './pages/DialogPage'
import { TooltipPage } from './pages/TooltipPage'

const routes: Route[] = [
  { path: '/', label: 'Home', component: () => <HomePage routes={routes} /> },
  { path: '/button', label: 'Button', component: ButtonPage },
  { path: '/input', label: 'Input', component: InputPage },
  { path: '/select', label: 'Select', component: SelectPage },
  { path: '/checkbox', label: 'Checkbox', component: CheckboxPage },
  { path: '/switch', label: 'Switch', component: SwitchPage },
  { path: '/radio', label: 'Radio', component: RadioPage },
  { path: '/slider', label: 'Slider', component: SliderPage },
  { path: '/label', label: 'Label', component: LabelPage },
  { path: '/dialog', label: 'Dialog', component: DialogPage },
  { path: '/tooltip', label: 'Tooltip', component: TooltipPage },
]

const App: Component = () => {
  return (
    <Layout routes={routes}>
      <Router routes={routes} />
    </Layout>
  )
}

export default App
