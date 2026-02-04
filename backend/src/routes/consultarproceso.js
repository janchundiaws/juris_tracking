// const express = require('express');
// const router = express.Router();
// const { chromium } = require('playwright');
// const { verifyToken } = require('../middleware/auth');

// /**
//  * @swagger
//  * /api/consultar-proceso/{numeroJuicio}:
//  *   get:
//  *     summary: Consultar proceso judicial en el sistema de la Función Judicial
//  *     tags:
//  *       - Consulta de Procesos
//  *     security:
//  *       - BearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: numeroJuicio
//  *         required: true
//  *         schema:
//  *           type: string
//  *         description: Número del juicio a consultar
//  *     responses:
//  *       200:
//  *         description: Datos del proceso judicial
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 numero:
//  *                   type: string
//  *                 estado:
//  *                   type: string
//  *                 actuaciones:
//  *                   type: array
//  *                   items:
//  *                     type: object
//  *                     properties:
//  *                       fecha:
//  *                         type: string
//  *                       descripcion:
//  *                         type: string
//  *       404:
//  *         description: Proceso no encontrado
//  *       500:
//  *         description: Error del servidor
//  */
// router.get('/:numeroJuicio', verifyToken, async (req, res) => {
//   const { numeroJuicio } = req.params;
  
//   if (!numeroJuicio) {
//     return res.status(400).json({ error: 'Número de juicio es requerido' });
//   }

//   let browser;
  
//   try {
//     browser = await chromium.launch({ 
//       headless: true,
//       args: ['--no-sandbox', '--disable-setuid-sandbox']
//     });
    
//     const page = await browser.newPage();

//     // Navegar al sitio de la Función Judicial
//     await page.goto('https://procesosjudiciales.funcionjudicial.gob.ec', {
//       timeout: 30000,
//       waitUntil: 'networkidle'
//     });

//     // Llenar el formulario y buscar
//     await page.fill('#numeroJuicio', numeroJuicio);
//     await page.click('#btnBuscar');

//     // Esperar resultados
//     await page.waitForSelector('.resultado', { timeout: 10000 });

//     // Extraer datos
//     const data = await page.evaluate(() => {
//       return {
//         numero: document.querySelector('#numProceso')?.innerText || '',
//         estado: document.querySelector('#estadoProceso')?.innerText || '',
//         actuaciones: [...document.querySelectorAll('.actuacion')].map(a => ({
//           fecha: a.querySelector('.fecha')?.innerText || '',
//           descripcion: a.querySelector('.descripcion')?.innerText || ''
//         }))
//       };
//     });

//     await browser.close();

//     if (!data.numero) {
//       return res.status(404).json({ error: 'Proceso no encontrado' });
//     }

//     res.json(data);
    
//   } catch (error) {
//     if (browser) {
//       await browser.close();
//     }
    
//     console.error('Error al consultar proceso:', error);
//     res.status(500).json({ 
//       error: 'Error al consultar el proceso judicial',
//       details: error.message 
//     });
//   }
// });

// module.exports = router;