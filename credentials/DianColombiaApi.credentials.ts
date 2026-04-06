import {
	ICredentialType,
	INodeProperties,
	ICredentialTestRequest,
} from 'n8n-workflow';

export class DianColombiaApi implements ICredentialType {
	name = 'dianColombiaApi';
	displayName = 'DIAN Colombia / Facturación Electrónica';
	documentationUrl = 'https://alegra.com/developers';
	properties: INodeProperties[] = [
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
			displayName: 'API User Key Siigo',
			name: 'siigoApiUser',
			type: 'string',
			typeOptions: { email: true },
			default: '',
			displayOptions: { show: { provider: ['siigo'] } },
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

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://api.exchangerate-api.com',
			url: '/v4/latest/USD',
			method: 'GET',
		},
	};
}