import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver'; // Necesitarás instalar file-saver también

export const exportToExcel = async (stats: any, grafica: any[]) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Estadísticas');

  // 1. CONFIGURACIÓN DE COLUMNAS (Ajustada para los 4 campos de la tabla)
  worksheet.columns = [
    { header: 'Concepto / Rango', key: 'col1', width: 25 },
    { header: 'Capital Inicial', key: 'col2', width: 20 },
    { header: 'Interés Devengado', key: 'col3', width: 20 },
    { header: 'Total Cobrado', key: 'col4', width: 20 },
    { header: 'Clientes', key: 'col5', width: 15 },
  ];

  worksheet.views = [{ showGridLines: false }];

  // 2. INSERCIÓN DEL LOGO (Mantenemos tu lógica actual)
  try {
    const response = await fetch('/images/logo.png');
    if (response.ok) {
      const buffer = await response.arrayBuffer();
      const logoId = workbook.addImage({ buffer, extension: 'png' });
      worksheet.addImage(logoId, {
        tl: { col: 0.1, row: 0.1 },
        ext: { width: 85, height: 85 }
      });
    }
  } catch (e) { console.error("Logo no cargado"); }

  // Espaciado inicial
  for (let i = 0; i < 5; i++) worksheet.addRow([]);

  const titleRow = worksheet.addRow(["REPORTE FINANCIERO - SAPPE"]);
  worksheet.mergeCells(`A${titleRow.number}:E${titleRow.number}`);
  titleRow.font = { name: 'Arial Black', size: 16, italic: true, color: { argb: '0047AB' } };
  titleRow.alignment = { horizontal: 'center' };

  worksheet.addRow(["Fecha de reporte:", new Date().toLocaleDateString()]);
  worksheet.addRow([]);

  // 5. DETALLE POR RANGOS (ACTUALIZADO SEGÚN TU NUEVO DISEÑO)
  const rangeTitle = worksheet.addRow(["DESGLOSE POR RANGOS DE INVERSIÓN"]);
  rangeTitle.font = { bold: true, size: 12 };
  
  const rangeHeader = worksheet.addRow(["Rangos", "Capital Inicial", "Interés Devengado", "Total", "Clientes"]);
  rangeHeader.eachCell(c => {
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '0047AB' } };
    c.font = { bold: true, color: { argb: 'FFFFFF' } };
    c.alignment = { horizontal: 'center' };
  });

  if (stats.rangos) {
    stats.rangos.forEach((r: any) => {
      // Usamos los campos que vienen de la nueva vista del backend
      const row = worksheet.addRow([
        r.rango || r.label, 
        Number(r.capital || 0), 
        Number(r.interes || 0), 
        Number(r.total || 0), 
        r.cant
      ]);

      // Formato moneda a columnas B, C y D
      [2, 3, 4].forEach(colIdx => {
        const cell = row.getCell(colIdx);
        cell.numFmt = '"$"#,##0.00';
        cell.alignment = { horizontal: 'right' };
      });
    });
  }

  worksheet.addRow([]);

  // 6. HISTORIAL DE COBRANZA (DESGLOSE DIARIO)
  const histTitle = worksheet.addRow(["HISTORIAL DE COBRANZA (DESGLOSE)"]);
  histTitle.font = { bold: true, size: 12 };

  const tableHeader = worksheet.addRow(["Periodo", "Capital Inicial", "Interés Devengado", "Total Cobrado"]);
  tableHeader.eachCell(cell => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '050533' } }; // Azul Oscuro SAPPE
    cell.font = { bold: true, color: { argb: 'FFFFFF' } };
    cell.alignment = { horizontal: 'center' };
  });

  // Usamos 'grafica' o el nuevo 'historial' que enviamos desde el backend
  const datosHistorial = stats.historial || grafica;

  if (datosHistorial && datosHistorial.length > 0) {
    datosHistorial.forEach((g: any) => {
      const c = Number(g.capital || 0);
      const i = Number(g.interes || 0);
      const t = Number(g.total || (c + i));

      const row = worksheet.addRow([
        g.name || g.fecha, 
        c, 
        i, 
        t
      ]);

      [2, 3, 4].forEach(colIdx => {
        const cell = row.getCell(colIdx);
        cell.numFmt = '"$"#,##0.00';
        cell.alignment = { horizontal: 'right' };
      });
    });
  }

  // 7. GENERAR DESCARGA (Misma lógica)
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `Reporte_SAPPE_${new Date().getTime()}.xlsx`);
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