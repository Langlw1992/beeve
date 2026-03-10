import {createServerEntry} from '@tanstack/solid-start/server-entry'
import {
  createStartHandler,
  defaultStreamHandler,
} from '@tanstack/solid-start/server'

const fetch = createStartHandler(defaultStreamHandler)

export default createServerEntry({fetch})
