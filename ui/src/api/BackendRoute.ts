import { HttpService, RequestConfig } from '@docker/extension-api-client-types/dist/v1'


export type RequestOpts = Pick<RequestConfig, "headers">


export default class BackendRoute {
  private backendAPI: HttpService
  public route: string

  constructor(backendAPI: HttpService, route: string) {
    if (route.startsWith('/')) {
      route = route.substring(1)
    }

    this.backendAPI = backendAPI
    this.route = `/api/${route}`
  }

  async get<T>(url: string, opts?: RequestOpts) {
    return await this.request<T>({
      url,
      method: "GET",
      data: null,
      headers: opts?.headers || {}
    })
  }

  async post<T>(url: string, data: any, opts?: RequestOpts) {
    return await this.request<T>({
      url,
      method: "POST",
      data: data,
      headers: opts?.headers || {}
    })
  }

  async delete<T>(url: string, opts?: RequestOpts) {
    return await this.request<T>({
      url,
      method: 'DELETE',
      data: null,
      headers: opts?.headers || {}
    })
  }

  async request<T>(opts: RequestConfig) {
    return await this.backendAPI.request({
      ...opts,
      url: this.route + opts.url,
    }) as T
  }
}
