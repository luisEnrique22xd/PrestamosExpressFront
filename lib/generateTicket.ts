// lib/generateTicket.ts
import jsPDF from 'jspdf';

export const generarPDFRecibo = (datos: any) => {
  const doc = new jsPDF({ unit: 'mm', format: [80, 130] });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("PRÉSTAMOS EXPRESS", 40, 10, { align: "center" });
  
  doc.setFontSize(8);
  doc.text("RECIBO DE ABONO SEMANAL", 40, 15, { align: "center" });
  doc.text("------------------------------------------", 40, 20, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.text(`FECHA: ${datos.fecha}`, 10, 28);
  doc.text(`CLIENTE: ${datos.cliente.toUpperCase()}`, 10, 33);
  doc.text(`FOLIO: #00${datos.folio}`, 10, 38);

  // Operación Matemática Visual
  const anterior = (parseFloat(datos.saldoRestante) + parseFloat(datos.monto)).toFixed(2);
  
  doc.text(`Saldo Anterior:`, 10, 50);
  doc.text(`$${anterior}`, 70, 50, { align: "right" });
  
  doc.setFont("helvetica", "bold");
  doc.text(`Abono Semana ${datos.semana}:`, 10, 56);
  doc.text(`- $${datos.monto}`, 70, 56, { align: "right" });

  doc.text("------------------------------------------", 40, 62, { align: "center" });

  doc.setFontSize(11);
  doc.setTextColor(0, 71, 171); // Azul Rey
  doc.text(`NUEVO SALDO:`, 10, 72);
  doc.setFontSize(14);
  doc.text(`$${datos.saldoRestante} MXN`, 70, 72, { align: "right" });

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(7);
  doc.setFont("helvetica", "italic");
  doc.text("¡Gracias por mantener su crédito al día!", 40, 90, { align: "center" });

  doc.save(`Ticket_${datos.cliente.replace(/\s+/g, '_')}.pdf`);
};