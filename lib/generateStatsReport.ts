import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

// --- EXPORTAR A EXCEL ---
export const exportToExcel = (stats: any, dataGrafica: any) => {
  const wb = XLSX.utils.book_new();
  
  // Hoja 1: Resumen de Rangos
  const wsRangos = XLSX.utils.json_to_sheet(stats.rangos);
  XLSX.utils.book_append_sheet(wb, wsRangos, "Resumen por Rangos");
  
  // Hoja 2: Movimientos Temporales
  const wsGrafica = XLSX.utils.json_to_sheet(dataGrafica);
  XLSX.utils.book_append_sheet(wb, wsGrafica, "Historico Grafica");

  XLSX.writeFile(wb, `Reporte_General_${new Date().toLocaleDateString()}.xlsx`);
};

// --- EXPORTAR A PDF (REPORTE EJECUTIVO) ---
export const exportToPDF = (stats: any, dataGrafica: any) => {
  const doc = new jsPDF();
  
  doc.setFont("helvetica", "bold");
  doc.text("REPORTE EJECUTIVO DE CARTERA", 105, 20, { align: 'center' });
  
  doc.setFontSize(12);
  doc.text(`Total Recuperado: ${stats.total_recuperado}`, 20, 40);
  doc.text(`Fecha de Corte: ${new Date().toLocaleString()}`, 20, 50);

  // Tabla de Rangos
  autoTable(doc, {
    startY: 60,
    head: [['Rango de Monto', 'Monto Acumulado', 'Cant. Clientes']],
    body: stats.rangos.map((r: any) => [r.label, r.total, r.cant]),
    theme: 'grid',
    headStyles: { fillColor: '#0047AB' }
  });

  doc.save(`Reporte_Financiero_${new Date().getTime()}.pdf`);
};