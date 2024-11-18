import fs from 'fs'

const pkpThemePlugin = ({configFile}) => ({
  name: 'pkp-vite',
  configureServer(server) {
    /**
     * Create config file when Vite's server is
     * initialized
     */
    server.httpServer?.once('listening', () => {
      const timer = setInterval(() => {
        const urls = server?.resolvedUrls
        if (urls) {
          fs.writeFileSync(configFile, JSON.stringify(urls, null, 2))
          clearInterval(timer)
        }
      }, 100)
    })

    /**
     * Reload when a .tpl file is changed
     */
    const { ws, watcher } = server
    watcher.on('change', file => {
      if (file.endsWith('.tpl')) {
        ws.send({
          type: 'full-reload'
        })
      }
    })
  },

  /**
   * Remove server file when Vite's server
   * is shut down
   */
  buildEnd() {
    if (fs.existsSync(configFile)) {
      fs.unlinkSync(configFile)
    }
  },

  /**
   * Remove server file before production
   * build
   *
   * A stray server file may exist if Vite's
   * server was shut down unexpectedly. For
   * example, if CTRL+C was used to exit the
   * terminal process.
   */
  configResolved({ mode }) {
    if (mode === 'production') {
      if (fs.existsSync(configFile)) {
        fs.unlinkSync(configFile)
      }
    }
  },
})

export default pkpThemePlugin