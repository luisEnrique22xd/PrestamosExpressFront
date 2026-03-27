import jsPDF from 'jspdf';

// Asegúrate de tener tu imagen en base64 correcta aquí
const LOGO_BASE64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAABAAAAAYACAYAAADogjqqAAAACXBIWXMAAA7DAAAOwwHHb6hkAAAgAElE..."; // Tu base64 completo aquí

export const generarPDFRecibo = (datos: any) => {
  // 1. Extraer y validar datos con valores predeterminados seguros
  const { cliente, monto, folio, saldoAnterior, nuevoSaldo, semana, modalidad, penalizacion } = datos;

  const abonoNum = Number(monto) || 0;
  const multaNum = Number(penalizacion) || 0;
  const totalCobrado = abonoNum + multaNum;

  const fechaTicket = datos.fecha || new Date().toLocaleDateString('es-MX', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  });

  const horaTicket = datos.hora || new Date().toLocaleTimeString('es-MX', { 
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false 
  });

  // 2. Crear documento jsPDF (Optimizado para papel térmico 80mm)
  // [ancho, alto] en mm. Reducimos alto para compactar más si es posible.
  const doc = new jsPDF({
    orientation: 'p',
    unit: 'mm',
    format: [80, 190] // Papel más corto para optimizar
  });

  // --- A. LOGO CORREGIDO (Centrado y Proporcional) ---
  // Ajustamos ancho (25) y ALTO (32) para que NO se vea aplastado.
  // El logo original es más alto que ancho.
  const logoWidth = 25; 
  const logoHeight = 32; // ¡MÁS ALTO! 😎
  const logoX = (80 - logoWidth) / 2; // Centrado horizontal
  // addImage(imageData, format, x, y, width, height)
  doc.addImage(LOGO_BASE64, 'PNG', logoX, 5, logoWidth, logoHeight);

  // --- B. ENCABEZADO COMPACTO ---
  // 'y' comienza justo debajo del logo. Calculamos dinámicamente.
  let y = 5 + logoHeight + 3; // 3mm de margen debajo del logo

  doc.setFont("courier", "bold");
  doc.setFontSize(10);
  doc.text("PRÉSTAMOS EXPRESS", 40, y, { align: "center" });
  
  doc.setFontSize(7);
  y += 4; doc.text("GENTE QUE AYUDA A LA GENTE", 40, y, { align: "center" });
  y += 3.5; doc.text("Acuitlapilco, TLAXCALA", 40, y, { align: "center" });
  y += 3.5; doc.text("TEL: 246-468-2344", 40, y, { align: "center" });
  
  // Separador compacto
  y += 4; doc.text("------------------------------------------", 40, y, { align: "center" });
  doc.setFontSize(9);
  y += 4.5; doc.text("COMPROBANTE DE OPERACIÓN", 40, y, { align: "center" });
  y += 4; doc.text("------------------------------------------", 40, y, { align: "center" });

  // --- C. DATOS DEL MOVIMIENTO ---
  y += 6;
  doc.setFontSize(8);
  doc.setFont("courier", "bold");
  doc.text(`Folio: ${folio}`, 10, y);
  
  doc.setFont("courier", "normal");
  y += 4; doc.text(`Fecha: ${fechaTicket}`, 10, y);
  y += 4; doc.text(`Hora:  ${horaTicket}`, 10, y);
  y += 4; doc.text(`Cliente: ${cliente.toUpperCase()}`, 10, y);

  // --- D. TABLA DE CONCEPTOS (Compacta) ---
  y += 7;
  doc.setFont("courier", "bold");
  doc.text("CONCEPTO", 10, y);
  doc.text("MONTO", 70, y, { align: "right" });
  doc.line(10, y + 0.5, 70, y + 0.5); // Línea sutil
  
  y += 5;
  doc.setFont("courier", "normal");
  // Determinar texto del pago
  const modTxt = modalidad?.toUpperCase() === 'QUINCENAL' ? 'QUINCENA' : modalidad?.toUpperCase() === 'MENSUAL' ? 'MES' : 'SEMANA';
  doc.text(`PAGO ${modTxt} ${semana}`, 10, y);
  // Alineación derecha para montos
  doc.text(`$${abonoNum.toFixed(2).padStart(10, ' ')}`, 70, y, { align: "right" });

  y += 4;
  doc.text(`PENALIZACIONES`, 10, y);
  doc.text(`$${multaNum.toFixed(2).padStart(10, ' ')}`, 70, y, { align: "right" });

  // Total compacto
  y += 5;
  doc.line(45, y, 70, y); // Línea totalizadora corta
  y += 4;
  doc.setFont("courier", "bold");
  doc.text("TOTAL COBRADO:", 10, y);
  doc.text(`$${totalCobrado.toFixed(2).padStart(10, ' ')}`, 70, y, { align: "right" });

  // Leyenda compacta justo debajo
  y += 5;
  doc.setFontSize(7);
  doc.setFont("courier", "normal");
  doc.text(`( PAGO A CAPITAL E INTERÉS CORRESPONDIENTE )`, 40, y, { align: "center" });

  // --- E. CUADRO DE SALDOS (Más compacto y elegante) ---
  // Bajamos un poco más para que Alexander lo vea bien.
  y += 6;
  // Dibujamos el rectángulo primero
  doc.rect(8, y, 64, 25); // [x, y, ancho, alto]
  
  // Textos dentro del cuadro
  doc.text(`SALDO ANTERIOR: `, 12, y + 5);
  doc.text(`$${Number(saldoAnterior).toFixed(2).padStart(10, ' ')}`, 68, y + 5, { align: "right" });
  
  doc.text(`ABONO A CUOTA:  `, 12, y + 10);
  doc.text(`$${abonoNum.toFixed(2).padStart(10, ' ')}`, 68, y + 10, { align: "right" });

  doc.text(`PAGO PENALIZACIONES:    `, 12, y + 15);
  doc.text(`$${multaNum.toFixed(2).padStart(10, ' ')}`, 68, y + 15, { align: "right" });
  
  doc.setFont("courier", "bold");
  doc.text(`NUEVO SALDO:    `, 12, y + 20);
  doc.text(`$${Number(nuevoSaldo).toFixed(2).padStart(10, ' ')}`, 68, y + 20, { align: "right" }); 

  // --- F. LEYENDAS Y FIRMAS (Parte inferior optimizada) ---
  // Subimos las leyendas para no dejar tanto espacio
  y += 32; // Espacio después del cuadro de saldos
  doc.setFontSize(7);
  doc.setFont("courier", "bold");
  doc.text("TE INVITAMOS A MANTENERTE AL CORRIENTE", 40, y, { align: "center" });
  y += 3.5;
  doc.setFont("courier", "normal");
  doc.text("PARA EVITAR PAGO DE PENALIZACIONES.", 40, y, { align: "center" });
  y += 3.5;
  doc.text("GRACIAS POR SU PREFERENCIA.", 40, y, { align: "center" });

  // Sección de firmas compacta
  y += 12; // Espacio para las firmas
  doc.line(10, y, 35, y); // Línea Firma 1
  doc.line(45, y, 70, y); // Línea Firma 2
  y += 4;
  doc.setFontSize(6);
  doc.text("FIRMA DEL CLIENTE", 22, y, { align: "center" });
  doc.text("FIRMA EJECUTIVO", 57, y, { align: "center" });

  // 3. Guardar el PDF
  doc.save(`Ticket_Abono_${folio}.pdf`);
};