import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getLogger } from './Logger';
import config from './Config';

export class HttpClient {
    private readonly client: AxiosInstance;
    private readonly logger = getLogger();

    constructor(baseURL: string, defaultConfig: AxiosRequestConfig = {}) {
        this.client = axios.create({
            baseURL,
            timeout: 5000,
            ...defaultConfig,
        });
        // 요청 인터셉터
        this.client.interceptors.request.use((request: InternalAxiosRequestConfig) => {
            // 헤더 세팅
            request.headers['Authorization'] = `${config.APP_API_TOKEN}`;  // TODO Bearer 추가
            request.headers['timezone'] = 'Asia/Seoul';

            this.logger.reqLog(request, { message: 'Request started' });
            return request;
        });

        // 응답 인터셉터
        this.client.interceptors.response.use(
            (response: AxiosResponse) => {
                this.logger.resLog(response, { message: 'Response received' });
                return response;
            },
            (error: AxiosError) => {
                this.logger.errLog(error, {
                    message: error.message,
                    additionalInfo: {
                        message: error.response?.statusText,
                        status: error.response?.status,
                    },
                });
                return Promise.reject(error);
            }
        );
    }

    async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        const response: AxiosResponse<T> = await this.client.get(url, config);
        return response.data;
    }

    async post<T>(url: string, data: any, config?: AxiosRequestConfig): Promise<T> {
        const response: AxiosResponse<T> = await this.client.post(url, data, config);
        return response.data;
    }

    async put<T>(url: string, data: any, config?: AxiosRequestConfig): Promise<T> {
        const response: AxiosResponse<T> = await this.client.put(url, data, config);
        return response.data;
    }

    async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        const response: AxiosResponse<T> = await this.client.delete(url, config);
        return response.data;
    }
}
