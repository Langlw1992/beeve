import {hydrate} from 'solid-js/web'
import {StartClient, hydrateStart} from '@tanstack/solid-start/client'
import './styles/app.css'

hydrateStart().then((router) => {
  hydrate(() => <StartClient router={router} />, document)
})
