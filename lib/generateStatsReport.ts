import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const exportToExcel = (stats: any, grafica: any[]) => {
  const data = [
    ["REPORTE FINANCIERO - PRÉSTAMOS EXPRESS"],
    ["Fecha de reporte:", new Date().toLocaleDateString()],
    [],
    ["RESUMEN GENERAL"],
    ["Capital en Calle", stats.capital_en_calle],
    ["Préstamos Activos", stats.prestamos_activos],
    ["Total Recuperado", stats.total_recuperado],
    [],
    ["DETALLE POR RANGOS"],
    ...(stats.rangos || []).map((r: any) => [r.label, r.total, `${r.cant} clientes`]),
    [],
    ["HISTORIAL DEL PERIODO"],
    ["Periodo", "Capital Prestado", "Interés Generado"],
    ...(grafica || []).map((g: any) => [g.name, g.capital, g.interes])
  ];

  const ws = XLSX.utils.aoa_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Estadísticas");
  XLSX.writeFile(wb, `Reporte_Express_${new Date().getTime()}.xlsx`);
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