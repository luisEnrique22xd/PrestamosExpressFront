import jsPDF from 'jspdf';

export const generarPDFRecibo = (datos: any) => {
  // 1. Extraemos las variables (incluyendo penalizacion)
  const { cliente, monto, folio, saldoAnterior, nuevoSaldo, semana, modalidad, penalizacion } = datos;

  // Formateo de números para asegurar dos decimales
  const abonoNum = Number(monto) || 0;
  const multaNum = Number(penalizacion) || 0;
  const totalCobrado = abonoNum + multaNum;

  // --- LÓGICA DE FECHA Y HORA UNIFICADA ---
  const fechaTicket = datos.fecha || new Date().toLocaleDateString('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  const horaTicket = datos.hora || new Date().toLocaleTimeString('es-MX', { 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit', 
    hour12: false 
  });

  const doc = new jsPDF({
    orientation: 'p',
    unit: 'mm',
    format: [80, 190] // Aumentamos un poco el largo para el nuevo campo
  });

  doc.setFont("courier", "bold");
  doc.setFontSize(10);
  
  // Encabezado
  doc.text("PRÉSTAMOS EXPRESS", 40, 10, { align: "center" });
  doc.setFontSize(7);
  doc.text("GENTE QUE AYUDA A LA GENTE", 40, 14, { align: "center" });
  doc.text("Acuitlapilco, TLAXCALA", 40, 18, { align: "center" });
  doc.text("TEL: 246-468-2344", 40, 22, { align: "center" });
  
  doc.text("------------------------------------------", 40, 26, { align: "center" });
  doc.setFontSize(9);
  doc.text("COMPROBANTE DE OPERACIÓN", 40, 31, { align: "center" });
  doc.text("------------------------------------------", 40, 35, { align: "center" });

  // Datos del CLIENTE
  doc.setFontSize(8);
  doc.setFont("courier", "normal");
  let y = 42;
  doc.setFont("courier", "bold");
  doc.text(`Folio: ${folio}`, 10, y);
  
  doc.setFont("courier", "normal");
  y += 5;
  doc.text(`Fecha: ${fechaTicket}`, 10, y);
  y += 5;
  doc.text(`Hora:  ${horaTicket}`, 10, y);
  y += 5;
  doc.text(`Cliente: ${cliente.toUpperCase()}`, 10, y);
  y += 10;

  // Tabla de Conceptos
  doc.setFont("courier", "bold");
  doc.text("CONCEPTO", 10, y);
  doc.text("MONTO", 70, y, { align: "right" });
  doc.line(10, y + 1, 70, y + 1);
  
  y += 7;
  doc.setFont("courier", "normal");
  const modTxt = modalidad?.toUpperCase() === 'QUINCENAL' ? 'QUINCENA' : modalidad?.toUpperCase() === 'MENSUAL' ? 'MES' : 'SEMANA';
  
  // Renglón de Pago Normal
  doc.text(`PAGO ${modTxt} ${semana}`, 10, y);
  doc.text(`$${abonoNum.toFixed(2)}`, 70, y, { align: "right" });

  y += 5;
  // Renglón de Penalizaciones (Multas)
  doc.text(`PENALIZACIONES`, 10, y);
  doc.text(`$${multaNum.toFixed(2)}`, 70, y, { align: "right" });

  // Importe Total Cobrado
  y += 10;
  doc.line(10, y, 70, y);
  y += 6;
  doc.setFont("courier", "bold");
  doc.text("TOTAL COBRADO:", 10, y);
  doc.text(`$${totalCobrado.toFixed(2)}`, 70, y, { align: "right" });

  y += 8;
  doc.setFontSize(7);
  doc.setFont("courier", "normal");
  doc.text(`( PAGO A CAPITAL E INTERÉS CORRESPONDIENTE )`, 40, y, { align: "center" });

  // --- CUADRO DE SALDOS (REAJUSTADO) ---
  y += 10;
  doc.rect(8, y, 64, 28); // Un poco más alto para el desglose
  doc.text(`SALDO ANTERIOR:   $${Number(saldoAnterior).toFixed(2)}`, 12, y + 6);
  doc.text(`ABONO A CUOTA:    $${abonoNum.toFixed(2)}`, 12, y + 12);
  doc.text(`PAGO MULTAS:      $${multaNum.toFixed(2)}`, 12, y + 18);
  
  doc.setFont("courier", "bold");
  doc.text(`NUEVO SALDO:      $${Number(nuevoSaldo).toFixed(2)}`, 12, y + 24); 

  // Leyendas finales
  y += 38;
  doc.setFontSize(7);
  doc.setFont("courier", "bold");
  doc.text("TE INVITAMOS A MANTENERTE AL CORRIENTE", 40, y, { align: "center" });
  y += 4;
  doc.setFont("courier", "normal");
  doc.text("PARA EVITAR PAGO DE PENALIZACIONES.", 40, y, { align: "center" });
  y += 4;
  doc.text("GRACIAS POR SU PREFERENCIA.", 40, y, { align: "center" });

  // Firmas
  y = 175; 
  doc.line(10, y, 35, y); 
  doc.line(45, y, 70, y); 
  
  y += 4;
  doc.setFontSize(6);
  doc.text("FIRMA DEL CLIENTE", 22, y, { align: "center" });
  doc.text("FIRMA EJECUTIVO", 57, y, { align: "center" });

  doc.save(`Ticket_Abono_${folio}.pdf`);
};