import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver'; // Necesitarás instalar file-saver también


export const exportToExcel = async (stats: any, grafica: any[]) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Estadísticas');

  // 1. CONFIGURACIÓN INICIAL DE COLUMNAS
  // Definimos las columnas primero para evitar errores de estructura
  worksheet.columns = [
    { header: 'Concepto / Día', key: 'col1', width: 25 },
    { header: 'Capital', key: 'col2', width: 20 },
    { header: 'Interés', key: 'col3', width: 20 },
    { header: 'Total', key: 'col4', width: 20 },
    { header: 'Detalles', key: 'col5', width: 15 },
  ];

  // Ocultar líneas de cuadrícula para estética SAPPE
  worksheet.views = [{ showGridLines: false }];

  // 2. INSERCIÓN DEL LOGO
  try {
    const response = await fetch('/images/logo.png');
    if (response.ok) {
      const buffer = await response.arrayBuffer();
      const logoId = workbook.addImage({
        buffer: buffer,
        extension: 'png',
      });
      // Posición A1 (tl = top-left)
      worksheet.addImage(logoId, {
        tl: { col: 0.1, row: 0.1 },
        ext: { width: 85, height: 85 }
      });
    }
  } catch (e) {
    console.error("Error al cargar logo");
  }

  // 3. ESPACIO PARA LOGO Y TÍTULO
  // Bajamos 5 filas para que los datos no queden debajo del logo
  for (let i = 0; i < 5; i++) worksheet.addRow([]);

  const titleRow = worksheet.addRow(["REPORTE FINANCIERO - SAPPE"]);
  worksheet.mergeCells(`A${titleRow.number}:E${titleRow.number}`);
  titleRow.font = { name: 'Arial Black', size: 16, italic: true, color: { argb: '0047AB' } };
  titleRow.alignment = { horizontal: 'center' };

  worksheet.addRow(["Fecha de reporte:", new Date().toLocaleDateString()]);
  worksheet.addRow([]);

  // 4. RESUMEN GENERAL (CAPITAL EN CALLE)
  const resumenHeader = worksheet.addRow(["RESUMEN DE INVERSIÓN"]);
  resumenHeader.font = { bold: true, size: 12 };
  
  const capCalle = typeof stats.capital_en_calle === 'string' 
    ? parseFloat(stats.capital_en_calle.replace(/[^0-9.-]+/g, "")) 
    : (stats.capital_en_calle || 0);

  const rowCap = worksheet.addRow(["Capital Total en Calle", capCalle]);
  rowCap.getCell(2).numFmt = '"$"#,##0.00';
  rowCap.getCell(2).font = { bold: true, color: { argb: 'DC2626' } };

  worksheet.addRow([]);

  // 5. DETALLE POR RANGOS (Según Capital Inicial)
  const rangeTitle = worksheet.addRow(["DESGLOSE POR RANGOS"]);
  rangeTitle.font = { bold: true };
  
  const rangeHeader = worksheet.addRow(["Rango", "Capital Invertido", "", "", "Clientes"]);
  rangeHeader.eachCell(c => {
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F2F2F2' } };
    c.font = { bold: true };
  });

  if (stats.rangos) {
    stats.rangos.forEach((r: any) => {
      const val = typeof r.total === 'string' ? parseFloat(r.total.replace(/[^0-9.-]+/g, "")) : r.total;
      const row = worksheet.addRow([r.label, val, "", "", r.cant]);
      row.getCell(2).numFmt = '"$"#,##0.00';
    });
  }

  worksheet.addRow([]);

  // 6. HISTORIAL DETALLADO (Día, Capital, Interés, Total)
  // Aquí usamos tus datos: [{name: "Fri", capital: 5000, interes: 2000}]
  const histTitle = worksheet.addRow(["HISTORIAL DE COBRANZA (DESGLOSE)"]);
  histTitle.font = { bold: true, size: 12 };

  const tableHeader = worksheet.addRow(["Periodo", "Capital", "Interés", "Total Cobrado"]);
  tableHeader.eachCell(cell => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '0047AB' } };
    cell.font = { bold: true, color: { argb: 'FFFFFF' } };
    cell.alignment = { horizontal: 'center' };
  });

  if (grafica && grafica.length > 0) {
    grafica.forEach((g: any) => {
      const c = Number(g.capital || 0);
      const i = Number(g.interes || 0);
      const t = c + i;

      const row = worksheet.addRow([
        g.name, // "Fri"
        c,      // 5000
        i,      // 2000
        t       // 7000
      ]);

      // Aplicar formato moneda y alineación
      [2, 3, 4].forEach(colIdx => {
        const cell = row.getCell(colIdx);
        cell.numFmt = '"$"#,##0.00';
        cell.alignment = { horizontal: 'right' };
      });
    });
  }

  // 7. GENERAR DESCARGA
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Reporte_SAPPE_${new Date().getTime()}.xlsx`;
  link.click();
  window.URL.revokeObjectURL(url);
};

export const exportToPDF = (stats: any, grafica: any[]) => {
  const doc = new jsPDF();
  
  // Encabezado
  doc.setFontSize(18);
  doc.setTextColor(0, 71, 171); // Azul Rey
  doc.text("PRÉSTAMOS EXPRESS", 14, 20);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text("REPORTE FINANCIERO DE CARTERA", 14, 28);
  doc.text(`Generado el: ${new Date().toLocaleString()}`, 14, 34);

  // 1. Tabla de Totales
  autoTable(doc, {
    startY: 40,
    head: [['Métrica', 'Valor Actual']],
    body: [
      ['Capital Vigente en Calle', stats.capital_en_calle],
      ['Contratos Activos', stats.prestamos_activos.toString()],
      ['Recuperación Total (Abonos)', stats.total_recuperado],
      ['Interés Proyectado', `$${(stats.total_interes_generado || 0).toLocaleString()}`]
    ],
    headStyles: { fillColor: [5, 5, 51] }, // Azul muy oscuro
    theme: 'striped'
  });

  // OBTENEMOS LA POSICIÓN FINAL DE FORMA SEGURA
  // @ts-ignore
  const finalY = (doc as any).lastAutoTable.finalY || 70;

  // 2. Tabla de Rangos
  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.text("Distribución por Rangos", 14, finalY + 15);

  autoTable(doc, {
    startY: finalY + 20,
    head: [['Rango de Crédito', 'Monto Acumulado', 'Clientes']],
    body: (stats.rangos || []).map((r: any) => [r.label, r.total, r.cant]),
    headStyles: { fillColor: [0, 71, 171] },
    theme: 'grid'
  });

  // Guardar
  doc.save(`Reporte_Financiero_Express_${new Date().toLocaleDateString()}.pdf`);
};