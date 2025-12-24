# n8n-nodes-dian-colombia

![DIAN Colombia](https://img.shields.io/badge/DIAN-Colombia-FCD116)
![n8n](https://img.shields.io/badge/n8n-community--node-ff6d5a)
![License](https://img.shields.io/badge/license-MIT-blue)

Nodo n8n para integración con **DIAN Colombia** (Dirección de Impuestos y Aduanas Nacionales).

## 🚀 Funcionalidades

### NIT/CC (Número de Identificación Tributaria)
- ✅ **Validar NIT** - Verifica formato y dígito de verificación
- ✅ **Formatear NIT** - Formato XXX.XXX.XXX-X
- ✅ **Limpiar** - Quitar puntos y guiones
- ✅ **Calcular dígito verificación** - Genera desde número base

### Indicadores Económicos (Banrep)
- 💵 **TRM** - Tasa Representativa del Mercado (dólar)
- 📊 **Valor UVT** - Unidad de Valor Tributario
- 🔄 **Convertir UVT ↔ Pesos**

### Emisión Factura Electrónica (requiere proveedor)
- 📄 **Factura de Venta** - FV
- 📄 **Nota Crédito** - NC
- 📄 **Nota Débito** - ND

## 📦 Instalación

### En n8n (recomendado)
1. Ve a **Settings** → **Community Nodes**
2. Clic en **Install**
3. Escribe: `n8n-nodes-dian-colombia`
4. Clic en **Install**

### Via npm
```bash
npm install n8n-nodes-dian-colombia
```

## ⚙️ Configuración

### Sin credenciales (funciones locales)
Las siguientes funciones NO requieren credenciales:
- Validar/formatear NIT
- TRM (API pública)
- Valor UVT
- Conversiones

### Con credenciales (emisión facturas)
Para emitir facturas electrónicas necesitas:
- **Alegra** - https://alegra.com
- **Siigo** - https://siigo.com

## 📋 Ejemplos de Uso

### Validar NIT
```
Recurso: NIT
Operación: Validar
NIT: 900.123.456-7
```

### Obtener TRM
```
Recurso: Indicadores
Operación: TRM Dólar
```

### Convertir UVT a Pesos
```
Recurso: Indicadores
Operación: UVT a Pesos
Monto UVT: 100
```

## 📊 Tipos de Documento

| Código | Tipo | Descripción |
|--------|------|-------------|
| FV | Factura | Factura de venta |
| NC | Nota Crédito | Anula factura |
| ND | Nota Débito | Ajuste valor |
| DS | Doc. Soporte | Compras sin factura |

## 🔗 APIs Utilizadas

- **Banrep** - TRM oficial (pública)
- **DIAN** - UVT anual
- **Alegra / Siigo** - Emisión facturas (requiere cuenta)

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor abre un issue o pull request.

## 📄 Licencia

MIT © Manuel Reyes Bravo
