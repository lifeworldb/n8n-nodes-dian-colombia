"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DianColombiaApi = void 0;
class DianColombiaApi {
    constructor() {
        this.name = 'dianColombiaApi';
        this.displayName = 'DIAN Colombia / Facturación Electrónica';
        this.documentationUrl = 'https://alegra.com/developers';
        this.properties = [
            {
                displayName: 'Proveedor de Facturación',
                name: 'provider',
                type: 'options',
                options: [
                    { name: 'Alegra', value: 'alegra' },
                    { name: 'Siigo', value: 'siigo' },
                    { name: 'Solo Funciones Locales (sin emisión)', value: 'none' },
                ],
                default: 'none',
            },
            {
                displayName: 'API Key Alegra',
                name: 'alegraApiKey',
                type: 'string',
                typeOptions: { password: true },
                default: '',
                displayOptions: { show: { provider: ['alegra'] } },
            },
            {
                displayName: 'API Key Siigo',
                name: 'siigoApiKey',
                type: 'string',
                typeOptions: { password: true },
                default: '',
                displayOptions: { show: { provider: ['siigo'] } },
            },
            {
                displayName: 'NIT Emisor',
                name: 'nitEmisor',
                type: 'string',
                default: '',
                placeholder: '900.123.456-7',
                displayOptions: { hide: { provider: ['none'] } },
            },
        ];
        this.test = {
            request: {
                baseURL: 'https://api.exchangerate-api.com',
                url: '/v4/latest/USD',
                method: 'GET',
            },
        };
    }
}
exports.DianColombiaApi = DianColombiaApi;
