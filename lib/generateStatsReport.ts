import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver'; // Necesitarás instalar file-saver también

export const exportToExcel = async (stats: any, grafica: any[]) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Estadísticas');

  // 1. CONFIGURAR EL LOGO
  // Puedes usar una URL de tu carpeta /public o una URL externa
  const response = await fetch('/images/logo.png'); // Asegúrate de que esta ruta sea correcta
  const buffer = await response.arrayBuffer();
  
  const logoId = workbook.addImage({
    buffer: buffer,
    extension: 'png',
  });

  // Insertar imagen (ajusta tl.col y tl.row para posicionarla)
  worksheet.addImage(logoId, {
    tl: { col: 0.2, row: 0.1 }, // Top-Left: un poco desplazado de la esquina A1
    ext: { width: 100, height: 100 } // Tamaño en píxeles
  });

  // 2. ESTRUCTURA DE DATOS (Dejamos espacio arriba para el logo)
  worksheet.addRow([]); // Fila 1 (Logo)
  worksheet.addRow([]); // Fila 2 (Logo)
  worksheet.addRow([]); // Fila 3 (Logo)
  worksheet.addRow([]); // Fila 4 (Logo)
  
  const titleRow = worksheet.addRow(["REPORTE FINANCIERO - SAPPE"]);
  titleRow.font = { name: 'Arial Black', size: 16, italic: true, color: { argb: '0047AB' } };

  worksheet.addRow(["Fecha de reporte:", new Date().toLocaleDateString()]);
  worksheet.addRow([]);

  // 3. RESUMEN GENERAL
  worksheet.addRow(["RESUMEN GENERAL"]).font = { bold: true };
  worksheet.addRow(["Capital en Calle", stats.capital_en_calle]);
  worksheet.addRow(["Préstamos Activos", stats.prestamos_activos]);
  worksheet.addRow(["Total Recuperado", stats.total_recuperado]);
  worksheet.addRow([]);

  // 4. DETALLE POR RANGOS
  worksheet.addRow(["DETALLE POR RANGOS"]).font = { bold: true };
  (stats.rangos || []).forEach((r: any) => {
    worksheet.addRow([r.label, r.total, `${r.cant} clientes`]);
  });
  worksheet.addRow([]);

  // 5. HISTORIAL
  worksheet.addRow(["HISTORIAL DEL PERIODO"]).font = { bold: true };
  const headerHistorial = worksheet.addRow(["Periodo", "Monto Recuperado"]);
  headerHistorial.font = { bold: true, color: { argb: 'FFFFFF' } };
  headerHistorial.eachCell(cell => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '0047AB' } };
  });

  (grafica || []).forEach((g: any) => {
    worksheet.addRow([g.dia, g.monto]);
  });

  // Ajustar ancho de columnas automáticamente
  worksheet.columns.forEach(column => {
    column.width = 25;
  });

  // 6. GENERAR Y DESCARGAR
  const bufferExcel = await workbook.xlsx.writeBuffer();
  const blob = new Blob([bufferExcel], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
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