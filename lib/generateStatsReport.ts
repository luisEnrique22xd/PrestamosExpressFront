import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver'; // Necesitarás instalar file-saver también

export const exportToExcel = async (stats: any, grafica: any[]) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Estadísticas');
  
  // Ocultar líneas de cuadrícula para un look más limpio
  worksheet.views = [{ showGridLines: false }];

  // 1. CARGA DEL LOGO (Asegúrate de que la ruta sea correcta)
  try {
    const response = await fetch('/images/logo.png');
    if (response.ok) {
      const buffer = await response.arrayBuffer();
      const logoId = workbook.addImage({
        buffer: buffer,
        extension: 'png',
      });
      worksheet.addImage(logoId, {
        tl: { col: 0.1, row: 0.1 },
        ext: { width: 80, height: 80 }
      });
    }
  } catch (e) {
    console.error("No se pudo cargar el logo para el Excel");
  }

  // 2. CONFIGURACIÓN DE COLUMNAS
  worksheet.columns = [
    { header: 'Concepto / Rango', key: 'label', width: 25 },
    { header: 'Capital Inicial', key: 'capital', width: 20 },
    { header: 'Interés Generado', key: 'interes', width: 20 },
    { header: 'Total a Cobrar', key: 'total', width: 20 },
    { header: 'Clientes', key: 'clientes', width: 15 },
  ];

  // Espacio para el logo
  worksheet.addRow([]); worksheet.addRow([]); worksheet.addRow([]); worksheet.addRow([]);

  // 3. TÍTULO PRINCIPAL
  const titleRow = worksheet.addRow(["REPORTE FINANCIERO - SAPPE"]);
  worksheet.mergeCells(`A${titleRow.number}:E${titleRow.number}`);
  titleRow.font = { name: 'Arial Black', size: 14, italic: true, color: { argb: '0047AB' } };
  titleRow.alignment = { horizontal: 'center' };

  worksheet.addRow(["Fecha de reporte:", new Date().toLocaleDateString()]);
  worksheet.addRow([]);

  // 4. SECCIÓN: DETALLE POR RANGOS (Con tus nuevas columnas)
  const rangeHeader = worksheet.addRow(["DESGLOSE POR RANGOS DE CAPITAL"]);
  rangeHeader.font = { bold: true, size: 12 };
  
  // Encabezados de la tabla de rangos
  const tableHeader = worksheet.addRow([
    "Rango de Préstamo", 
    "Capital Inicial", 
    "Interés Estimado", 
    "Total Cobrado", 
    "Cant. Clientes"
  ]);
  
  // Estilo para el encabezado de la tabla
  tableHeader.eachCell((cell) => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F2F2F2' } };
    cell.font = { bold: true, size: 10 };
    cell.border = { bottom: { style: 'thin' } };
  });

  // Lógica de datos de rangos
  if (stats.rangos) {
    stats.rangos.forEach((r: any) => {
      // Limpiamos el string del total (quitando "$" y ",") para hacer cálculos si es necesario
      const capitalNumerico = typeof r.total === 'string' 
        ? parseFloat(r.total.replace(/[^0-9.-]+/g, "")) 
        : (r.total || 0);

      // Cálculo de intereses (Ejemplo: basándonos en tu interés global, supongamos 40% o el que traigas)
      // Si el backend no envía el interés por rango, podemos estimarlo aquí:
      const interesEstimado = capitalNumerico * 0.40; // Ajusta este factor según tu negocio
      const totalCobrado = capitalNumerico + interesEstimado;

      const row = worksheet.addRow([
        r.label,          // Col A: "3001 a 5000"
        capitalNumerico,  // Col B: 5000
        interesEstimado,  // Col C: 2000
        totalCobrado,     // Col D: 7000
        r.cant            // Col E: "1"
      ]);

      // Formato de moneda para las columnas B, C y D
      [2, 3, 4].forEach(colIndex => {
        row.getCell(colIndex).numFmt = '"$"#,##0.00';
      });
    });
  }

  worksheet.addRow([]);

  // 5. RESUMEN DE TOTALES EN CALLE
  const resumenRow = worksheet.addRow(["CAPITAL TOTAL EN CALLE ACTUAL", Number(stats.capital_en_calle)]);
  resumenRow.font = { bold: true };
  resumenRow.getCell(2).numFmt = '"$"#,##0.00';
  resumenRow.getCell(2).font = { color: { argb: 'DC2626' } }; // Rojo para inversión

  // 6. GENERAR DESCARGA
  const bufferExcel = await workbook.xlsx.writeBuffer();
  const blob = new Blob([bufferExcel], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  
  // Usar una función de descarga simple si no tienes file-saver
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `Reporte_Detallado_SAPPE_${new Date().getTime()}.xlsx`;
  anchor.click();
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