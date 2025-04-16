import net from 'node:net'

// Define port range
const MIN_PORT = 1024
const MAX_PORT = 65535

/**
 * Finds first avaible port within the range [1024, 65535]
 *
 * @param end use to stop the recursive loop
 * @throws Will throw an error if no available port is found within the specified range.
 */

const getPort = async (port: number, end = port - 1): Promise<number> => {
  if (port > MAX_PORT || port < MIN_PORT) port = MIN_PORT
  if (end < MIN_PORT || end > MAX_PORT) end = MAX_PORT
  if (port === end) throw new Error('NoAvailablePort') // TODO throw proper error
  const isAvailable = await isPortAvailable(port)
  if (isAvailable) return port
  return getPort(port === MAX_PORT ? MIN_PORT : port + 1, end)
}

export default getPort
  
/**
 * Checks the availability of a specified port.
 * Resolves to `true` if the port is available, `false` otherwise.
 */

const isPortAvailable = async (port: number): Promise<boolean> => {
  const server = net.createServer()
  return new Promise((resolve) => {
    server.listen(port, () => {
      server.once('close', () => {
        resolve(true)
      })
      server.close()
    })
    server.on('error', () => {
      resolve(false)
    })
  })
}