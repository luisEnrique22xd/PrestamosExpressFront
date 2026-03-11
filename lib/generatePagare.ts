import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generarPagare = (data: any) => {
  const doc = new jsPDF();
  const aval = data.datos_ultimo_aval || {};
  const fechaActual = new Date().toLocaleDateString();

  // --- DISEÑO DE CABECERA ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(0, 71, 171); // Azul Rey Institucional
  doc.text("PAGARÉ LEGAL - PRÉSTAMOS EXPRESS", 105, 20, { align: "center" });
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Folio: #PR-${data.id} | Fecha de Emisión: ${fechaActual}`, 105, 28, { align: "center" });

  // --- CUERPO DEL DOCUMENTO ---
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0);
  doc.setFontSize(11);
  const textoLegal = `Por este pagaré, yo, ${data.nombre.toUpperCase()}, me comprometo a pagar incondicionalmente a la orden de PRÉSTAMOS EXPRESS en Huamantla, Tlaxcala, la cantidad de $${data.progreso_pagos.monto_total} MXN, valor recibido a mi entera satisfacción.`;
  
  const splitText = doc.splitTextToSize(textoLegal, 180);
  doc.text(splitText, 15, 45);

  // --- TABLA DE DATOS ---
  autoTable(doc, {
    startY: 60,
    head: [['Concepto', 'Detalle']],
    body: [
      ['Cliente', data.nombre],
      ['CURP', data.curp],
      ['Monto Capital', `$${data.progreso_pagos.monto_total}`],
      ['Nombre del Aval', aval.nombre_aval || 'N/A'],
      ['Parentesco Aval', aval.parentesco_aval || 'N/A'],
      ['Garantía', aval.garantia_descripcion || 'N/A'],
    ],
    theme: 'striped',
    headStyles: { fillColor: '#0047AB' }
  });

  // --- SECCIÓN DE FIRMAS ---
  const finalY = (doc as any).lastAutoTable.finalY + 40;
  
  doc.line(30, finalY, 90, finalY); // Línea Deudor
  doc.text("FIRMA DEL DEUDOR", 60, finalY + 5, { align: "center" });

  doc.line(120, finalY, 180, finalY); // Línea Aval
  doc.text("FIRMA DEL AVAL", 150, finalY + 5, { align: "center" });

  // Guardar archivo
  doc.save(`Pagare_${data.nombre.replace(/\s+/g, '_')}.pdf`);
};