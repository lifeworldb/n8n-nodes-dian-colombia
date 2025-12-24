"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DianColombia = void 0;
// Funciones NIT
function validarNit(nit) {
    const nitLimpio = nit.replace(/[.\-\s]/g, '');
    if (!/^\d{9,10}$/.test(nitLimpio)) {
        return { valido: false, nit: nitLimpio, tipo: 'Desconocido', mensaje: 'NIT debe tener 9 o 10 dígitos' };
    }
    // Calcular dígito de verificación
    const numeroBase = nitLimpio.length === 10 ? nitLimpio.substring(0, 9) : nitLimpio;
    const digitoIngresado = nitLimpio.length === 10 ? parseInt(nitLimpio.charAt(9)) : null;
    const primos = [3, 7, 13, 17, 19, 23, 29, 37, 41, 43, 47, 53, 59, 67, 71];
    let suma = 0;
    const digitos = numeroBase.split('').reverse();
    for (let i = 0; i < digitos.length; i++) {
        suma += parseInt(digitos[i]) * primos[i];
    }
    const residuo = suma % 11;
    const dvCalculado = residuo >= 2 ? 11 - residuo : residuo;
    if (digitoIngresado !== null && dvCalculado !== digitoIngresado) {
        return { valido: false, nit: nitLimpio, tipo: 'Desconocido', mensaje: 'Dígito de verificación inválido' };
    }
    // Determinar tipo por prefijo
    let tipo = 'Persona Jurídica';
    const prefijo = parseInt(numeroBase.substring(0, 1));
    if (prefijo >= 1 && prefijo <= 9) {
        tipo = nitLimpio.length === 10 ? 'Persona Jurídica' : 'Persona Natural';
    }
    return {
        valido: true,
        nit: nitLimpio,
        tipo,
        mensaje: 'NIT válido',
        digitoVerificacion: dvCalculado,
    };
}
function formatearNit(nit) {
    const limpio = nit.replace(/[.\-\s]/g, '');
    if (limpio.length < 9)
        return limpio;
    const base = limpio.substring(0, limpio.length - 1);
    const dv = limpio.charAt(limpio.length - 1);
    // Formato: XXX.XXX.XXX-X
    const partes = [];
    for (let i = base.length; i > 0; i -= 3) {
        partes.unshift(base.substring(Math.max(0, i - 3), i));
    }
    return partes.join('.') + '-' + dv;
}
function limpiarNit(nit) {
    return nit.replace(/[^0-9]/g, '');
}
function calcularDigitoVerificacion(nitBase) {
    const limpio = nitBase.replace(/[^0-9]/g, '');
    if (limpio.length !== 9) {
        throw new Error('NIT base debe tener 9 dígitos (sin dígito de verificación)');
    }
    const primos = [3, 7, 13, 17, 19, 23, 29, 37, 41, 43, 47, 53, 59, 67, 71];
    let suma = 0;
    const digitos = limpio.split('').reverse();
    for (let i = 0; i < digitos.length; i++) {
        suma += parseInt(digitos[i]) * primos[i];
    }
    const residuo = suma % 11;
    const dv = residuo >= 2 ? 11 - residuo : residuo;
    return {
        nitBase: limpio,
        digitoVerificacion: dv,
        nitCompleto: limpio + dv,
    };
}
// Funciones Indicadores
async function obtenerTrm(that) {
    var _a;
    try {
        // API pública TRM Colombia
        const response = await that.helpers.httpRequest({
            method: 'GET',
            url: 'https://www.datos.gov.co/resource/32sa-8pi3.json?$limit=1&$order=vigenciadesde%20DESC',
            json: true,
        });
        const data = response;
        if (data && data.length > 0) {
            return {
                indicador: 'TRM',
                valor: parseFloat(data[0].valor),
                fecha: data[0].vigenciadesde,
                fuente: 'Banco de la República',
            };
        }
    }
    catch {
        // Fallback
    }
    // Intentar API alternativa
    try {
        const response = await that.helpers.httpRequest({
            method: 'GET',
            url: 'https://api.exchangerate-api.com/v4/latest/USD',
            json: true,
        });
        const data = response;
        return {
            indicador: 'TRM',
            valor: ((_a = data.rates) === null || _a === void 0 ? void 0 : _a.COP) || 4200,
            fecha: new Date().toISOString().split('T')[0],
            fuente: 'Exchange Rate API',
        };
    }
    catch {
        return {
            indicador: 'TRM',
            valor: 4200,
            fecha: new Date().toISOString().split('T')[0],
            fuente: 'Estimado',
        };
    }
}
async function obtenerUvt(that) {
    // UVT 2025: $49.799 (valor fijo anual)
    const uvt2025 = 49799;
    return {
        indicador: 'UVT',
        valor: uvt2025,
        año: 2025,
        fuente: 'DIAN',
        nota: 'Unidad de Valor Tributario vigente',
    };
}
function convertirUvtPesos(uvt, valorUvt) {
    return {
        uvt,
        valorUvt,
        pesos: Math.round(uvt * valorUvt),
        fecha: new Date().toISOString().split('T')[0],
    };
}
function convertirPesosUvt(pesos, valorUvt) {
    return {
        pesos,
        valorUvt,
        uvt: Math.round((pesos / valorUvt) * 100) / 100,
        fecha: new Date().toISOString().split('T')[0],
    };
}
// Función para emitir factura
async function emitirFactura(that, provider, apiKey, tipoDocumento, datos) {
    if (provider === 'none') {
        throw new Error('Configura credenciales de Alegra o Siigo para emitir facturas');
    }
    if (provider === 'alegra') {
        const response = await that.helpers.httpRequest({
            method: 'POST',
            url: 'https://api.alegra.com/api/v1/invoices',
            headers: {
                'Authorization': `Basic ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: {
                date: new Date().toISOString().split('T')[0],
                dueDate: datos.fechaVencimiento,
                client: datos.cliente,
                items: datos.items,
            },
            json: true,
        });
        return response;
    }
    if (provider === 'siigo') {
        const response = await that.helpers.httpRequest({
            method: 'POST',
            url: 'https://api.siigo.com/v1/invoices',
            headers: {
                'Authorization': apiKey,
                'Content-Type': 'application/json',
            },
            body: {
                document: { id: tipoDocumento === 'FV' ? 1 : tipoDocumento === 'NC' ? 2 : 3 },
                customer: datos.cliente,
                items: datos.items,
            },
            json: true,
        });
        return response;
    }
    throw new Error(`Proveedor ${provider} no implementado`);
}
class DianColombia {
    constructor() {
        this.description = {
            displayName: 'DIAN Colombia',
            name: 'dianColombia',
            icon: 'file:dian.svg',
            group: ['transform'],
            version: 1,
            subtitle: '={{$parameter["resource"] + ": " + $parameter["operation"]}}',
            description: 'Facturación Electrónica Colombia - NIT, TRM, UVT',
            defaults: {
                name: 'DIAN Colombia',
            },
            inputs: ['main'],
            outputs: ['main'],
            credentials: [
                {
                    name: 'dianColombiaApi',
                    required: false,
                },
            ],
            properties: [
                {
                    displayName: 'Recurso',
                    name: 'resource',
                    type: 'options',
                    noDataExpression: true,
                    options: [
                        { name: 'NIT', value: 'nit' },
                        { name: 'Indicadores', value: 'indicadores' },
                        { name: 'Emitir Factura', value: 'factura' },
                    ],
                    default: 'nit',
                },
                // Operaciones NIT
                {
                    displayName: 'Operación',
                    name: 'operation',
                    type: 'options',
                    noDataExpression: true,
                    displayOptions: { show: { resource: ['nit'] } },
                    options: [
                        { name: 'Validar', value: 'validar', description: 'Validar formato de NIT', action: 'Validar NIT' },
                        { name: 'Formatear', value: 'formatear', description: 'Formato XXX.XXX.XXX-X', action: 'Formatear NIT' },
                        { name: 'Limpiar', value: 'limpiar', description: 'Quitar puntos y guiones', action: 'Limpiar NIT' },
                        { name: 'Calcular DV', value: 'calcular_dv', description: 'Calcular dígito verificación', action: 'Calcular digito verificacion' },
                    ],
                    default: 'validar',
                },
                {
                    displayName: 'NIT',
                    name: 'nit',
                    type: 'string',
                    default: '',
                    placeholder: '900.123.456-7',
                    required: true,
                    displayOptions: { show: { resource: ['nit'], operation: ['validar', 'formatear', 'limpiar'] } },
                },
                {
                    displayName: 'NIT Base (9 dígitos)',
                    name: 'nitBase',
                    type: 'string',
                    default: '',
                    placeholder: '900123456',
                    required: true,
                    displayOptions: { show: { resource: ['nit'], operation: ['calcular_dv'] } },
                },
                // Operaciones Indicadores
                {
                    displayName: 'Operación',
                    name: 'operation',
                    type: 'options',
                    noDataExpression: true,
                    displayOptions: { show: { resource: ['indicadores'] } },
                    options: [
                        { name: 'TRM Dólar', value: 'trm', description: 'Tasa Representativa del Mercado', action: 'Obtener TRM' },
                        { name: 'Valor UVT', value: 'uvt', description: 'Unidad de Valor Tributario', action: 'Obtener UVT' },
                        { name: 'UVT a Pesos', value: 'uvt_pesos', description: 'Convertir UVT a Pesos', action: 'Convertir UVT a Pesos' },
                        { name: 'Pesos a UVT', value: 'pesos_uvt', description: 'Convertir Pesos a UVT', action: 'Convertir Pesos a UVT' },
                    ],
                    default: 'trm',
                },
                {
                    displayName: 'Monto UVT',
                    name: 'montoUvt',
                    type: 'number',
                    default: 100,
                    displayOptions: { show: { resource: ['indicadores'], operation: ['uvt_pesos'] } },
                },
                {
                    displayName: 'Monto Pesos',
                    name: 'montoPesos',
                    type: 'number',
                    default: 5000000,
                    displayOptions: { show: { resource: ['indicadores'], operation: ['pesos_uvt'] } },
                },
                // Operaciones Factura
                {
                    displayName: 'Operación',
                    name: 'operation',
                    type: 'options',
                    noDataExpression: true,
                    displayOptions: { show: { resource: ['factura'] } },
                    options: [
                        { name: 'Factura de Venta', value: 'factura_venta', description: 'FV', action: 'Emitir Factura' },
                        { name: 'Nota Crédito', value: 'nota_credito', description: 'NC', action: 'Emitir Nota Credito' },
                        { name: 'Nota Débito', value: 'nota_debito', description: 'ND', action: 'Emitir Nota Debito' },
                    ],
                    default: 'factura_venta',
                },
                {
                    displayName: 'NIT Cliente',
                    name: 'nitCliente',
                    type: 'string',
                    default: '',
                    placeholder: '900.123.456-7',
                    displayOptions: { show: { resource: ['factura'] } },
                },
                {
                    displayName: 'Razón Social',
                    name: 'razonSocial',
                    type: 'string',
                    default: '',
                    placeholder: 'Empresa S.A.S.',
                    displayOptions: { show: { resource: ['factura'] } },
                },
                {
                    displayName: 'Subtotal',
                    name: 'subtotal',
                    type: 'number',
                    default: 0,
                    displayOptions: { show: { resource: ['factura'] } },
                },
                {
                    displayName: 'IVA (19%)',
                    name: 'iva',
                    type: 'number',
                    default: 0,
                    displayOptions: { show: { resource: ['factura'] } },
                },
                {
                    displayName: 'Total',
                    name: 'total',
                    type: 'number',
                    default: 0,
                    displayOptions: { show: { resource: ['factura'] } },
                },
            ],
        };
    }
    async execute() {
        const items = this.getInputData();
        const returnData = [];
        const resource = this.getNodeParameter('resource', 0);
        const operation = this.getNodeParameter('operation', 0);
        for (let i = 0; i < items.length; i++) {
            let result = {};
            try {
                // NIT
                if (resource === 'nit') {
                    if (operation === 'validar') {
                        const nit = this.getNodeParameter('nit', i);
                        result = validarNit(nit);
                    }
                    else if (operation === 'formatear') {
                        const nit = this.getNodeParameter('nit', i);
                        result = { nit: formatearNit(nit) };
                    }
                    else if (operation === 'limpiar') {
                        const nit = this.getNodeParameter('nit', i);
                        result = { nit: limpiarNit(nit) };
                    }
                    else if (operation === 'calcular_dv') {
                        const nitBase = this.getNodeParameter('nitBase', i);
                        result = calcularDigitoVerificacion(nitBase);
                    }
                }
                // Indicadores
                else if (resource === 'indicadores') {
                    if (operation === 'trm') {
                        result = await obtenerTrm(this);
                    }
                    else if (operation === 'uvt') {
                        result = await obtenerUvt(this);
                    }
                    else if (operation === 'uvt_pesos') {
                        const montoUvt = this.getNodeParameter('montoUvt', i);
                        const uvt = await obtenerUvt(this);
                        result = convertirUvtPesos(montoUvt, uvt.valor);
                    }
                    else if (operation === 'pesos_uvt') {
                        const montoPesos = this.getNodeParameter('montoPesos', i);
                        const uvt = await obtenerUvt(this);
                        result = convertirPesosUvt(montoPesos, uvt.valor);
                    }
                }
                // Factura
                else if (resource === 'factura') {
                    const credentials = await this.getCredentials('dianColombiaApi').catch(() => null);
                    if (!credentials || credentials.provider === 'none') {
                        throw new Error('Configura credenciales de Alegra o Siigo para emitir facturas');
                    }
                    const tipoDoc = operation === 'factura_venta' ? 'FV' : operation === 'nota_credito' ? 'NC' : 'ND';
                    const datos = {
                        cliente: {
                            nit: this.getNodeParameter('nitCliente', i),
                            razonSocial: this.getNodeParameter('razonSocial', i),
                        },
                        subtotal: this.getNodeParameter('subtotal', i),
                        iva: this.getNodeParameter('iva', i),
                        total: this.getNodeParameter('total', i),
                    };
                    result = await emitirFactura(this, credentials.provider, credentials.alegraApiKey || credentials.siigoApiKey, tipoDoc, datos);
                }
                returnData.push({ json: result });
            }
            catch (error) {
                if (this.continueOnFail()) {
                    returnData.push({ json: { error: error.message } });
                    continue;
                }
                throw error;
            }
        }
        return [returnData];
    }
}
exports.DianColombia = DianColombia;
