import { ExtensionVM } from '@docker/extension-api-client-types/dist/v1'
import Session from './routes/session'


export default class Backend {
  private backend: ExtensionVM
  public session: Session

  constructor(backend: ExtensionVM) {
    this.backend = backend

    if (!this.backend.service) {
      throw new Error('Backend service not found')
    }

    this.session = new Session(this.backend.service)
  }
}
