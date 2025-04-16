import { AsyncLocalStorage } from 'node:async_hooks'

// export storage for context tracking
export default new AsyncLocalStorage()