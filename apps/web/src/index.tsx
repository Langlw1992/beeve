/* @refresh reload */
import { render } from 'solid-js/web'
import { ThemeProvider } from '@beeve/ui'
import './index.css'
import App from './App'

const root = document.getElementById('root')

render(
  () => (
    <ThemeProvider>
      <App />
    </ThemeProvider>
  ),
  root!
)
