import fs from 'fs'

const pkpThemePlugin = ({configFile}) => ({
  name: 'pkp-vite',

  /**
   * Create config file when Vite's server is
   * initialized and remove it when it is shut down
   */
  configureServer(server) {
    let exitHandlersBound = false
    server.httpServer?.once('listening', () => {
      const timer = setInterval(() => {
        const urls = server?.resolvedUrls
        if (urls) {
          fs.writeFileSync(configFile, JSON.stringify(urls, null, 2))
          clearInterval(timer)
        }
      }, 100)
    })

    if (!exitHandlersBound) {
      const remove = () => {
        if (fs.existsSync(configFile)) {
          fs.rmSync(configFile)
        }
      }

      process.on('exit', remove)
      process.on('SIGINT', () => process.exit())
      process.on('SIGTERM', () => process.exit())
      process.on('SIGHUP', () => process.exit())

      exitHandlersBound = true
    }
  },

  /**
   * Reload when a .tpl file has changed
   */
  handleHotUpdate({file, server}) {
    if (file.endsWith('.tpl')) {
      server.ws.send({
        type: 'full-reload',
        path: '*',
      })
    }
  },
})

export default pkpThemePlugin