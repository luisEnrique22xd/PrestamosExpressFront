import jsPDF from 'jspdf';

export const generarPagare = (data: any) => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a5'
  });

  // 1. EXTRACCIÓN DE DATOS
  const { esGrupal, numIntegrantes, cuotaPorSocio, modalidad = 'semanal' } = data; 
  
  const cliente = (data.nombreCliente || "").toUpperCase();
  const direccion = (data.direccion || "").toUpperCase();
  const avalNombre = (data.nombreAval || "________________________").toUpperCase();
  const capital = parseFloat(data.monto || 0);
  const semanas = parseInt(data.cuotas || 0);
  const pago = parseFloat(data.pago_cuota || data.pagoPorCuota || 0);
  
  // Población dinámica
  const poblacion = (data.poblacion || "SANTA MARIA ACUITLAPILCO, TLAXCALA").toUpperCase();
  // Lugar de expedición
  const lugarExpedicion = poblacion.split(',')[0]; 
  
  const folioRaw = data.folio_consecutivo || 1;
  const folioFormateado = folioRaw.toString().padStart(5, '0');
  
  const venci = data.fechaVencimiento ? new Date(data.fechaVencimiento) : new Date();
  const hoy = new Date();

  // 2. LÓGICA DE MODALIDAD DINÁMICA
  const textoModalidad = 
    modalidad.toLowerCase().includes('quin') ? 'QUINCENAS' :
    modalidad.toLowerCase().includes('men')  ? 'MESES' : 'SEMANAS';

  const verde = [34, 110, 34]; 
  const grisClaro = [240, 245, 240];

  // Marco exterior
  doc.setDrawColor(80);
  doc.setLineWidth(0.6);
  doc.rect(5, 5, 200, 138); 

  // --- ENCABEZADO ---
  doc.setLineWidth(0.3);
  doc.setDrawColor(verde[0], verde[1], verde[2]);
  
  // Celda PAGARE
  doc.setFillColor(verde[0], verde[1], verde[2]);
  doc.rect(7, 7, 30, 6, 'F');
  doc.setTextColor(255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("PAGARE", 10, 11.5);

  // Celda LUGAR DE EXPEDICION
  doc.setFillColor(grisClaro[0], grisClaro[1], grisClaro[2]);
  doc.rect(37, 7, 85, 6, 'F');
  doc.rect(37, 7, 85, 15);
  doc.setTextColor(verde[0], verde[1], verde[2]);
  doc.setFontSize(7);
  doc.text("LUGAR DE EXPEDICION", 79, 10, { align: 'center' });
  doc.setTextColor(0);
  doc.setFontSize(8);
  doc.text(doc.splitTextToSize(lugarExpedicion, 80), 39, 15);

  // Celdas DIA / MES / AÑO
  const labelsFecha = ["DIA", "MES", "AÑO"];
  const xFechas = [122, 135, 163];
  const wFechas = [13, 28, 15];
  
  labelsFecha.forEach((label, i) => {
    doc.setFillColor(grisClaro[0], grisClaro[1], grisClaro[2]);
    doc.rect(xFechas[i], 7, wFechas[i], 6, 'F');
    doc.rect(xFechas[i], 7, wFechas[i], 15);
    doc.setTextColor(verde[0], verde[1], verde[2]);
    doc.text(label, xFechas[i] + wFechas[i]/2, 10, { align: 'center' });
  });

  doc.setTextColor(0);
  doc.text(hoy.getDate().toString(), 128.5, 17, { align: 'center' });
  doc.text(hoy.toLocaleString('es-MX', { month: 'short' }).toUpperCase(), 149, 17, { align: 'center' });
  doc.text(hoy.getFullYear().toString(), 170.5, 17, { align: 'center' });

  // Celda BUENO POR
  doc.setFillColor(grisClaro[0], grisClaro[1], grisClaro[2]);
  doc.rect(178, 7, 25, 6, 'F');
  doc.rect(178, 7, 25, 15);
  doc.setTextColor(verde[0], verde[1], verde[2]);
  doc.text("BUENO POR", 190.5, 10, { align: 'center' });
  doc.setTextColor(0);
  doc.setFontSize(10);
  doc.text(`$ ${capital.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, 180, 17);

  doc.setFontSize(9);
  doc.text(`No. PR-${folioFormateado}`, 7, 27);

  // --- CUERPO ---
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  const textoDebo = `Debo(emos) y pagaré(mos) incondicionalmente sin pretexto este pagaré en el lugar y fechas citadas donde elija el tenedor el día de su vencimiento`;
  const splitDebo = doc.splitTextToSize(textoDebo, 195);
  doc.text(splitDebo, 7, 32); 

  // --- BENEFICIARIOS Y VENCIMIENTO ---
  doc.text(`a la orden de:`, 7, 42);
  doc.line(28, 42, 132, 42); 
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5); 
  doc.text("PLACIDO FLORES GUERRERO y/o DULCE MARIA FELIX TLAPA HARO", 30, 41);
  
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`el día`, 134, 42);
  doc.line(143, 42, 151, 42); 
  doc.text(`de`, 153, 42);
  doc.line(158, 42, 186, 42); 
  doc.text(`de`, 188, 42);
  doc.line(193, 42, 203, 42); 

  doc.setFont("helvetica", "bold");
  doc.text(venci.getDate().toString(), 147, 41, { align: 'center' });
  doc.text(venci.toLocaleString('es-MX', { month: 'long' }).toUpperCase(), 172, 41, { align: 'center' });
  doc.text(venci.getFullYear().toString().slice(-2), 198, 41, { align: 'center' });

  // --- RECUADRO CANTIDAD ---
  doc.setFontSize(9.5);
  doc.setFont("helvetica", "bold");
  doc.text("La cantidad de:", 7, 52);
  doc.setFillColor(grisClaro[0], grisClaro[1], grisClaro[2]);
  doc.rect(32, 47, 171, 10, 'F');
  doc.rect(32, 47, 171, 10);
  doc.setFontSize(8.5);
  doc.text(`PAGO DE $${pago.toLocaleString('es-MX', { minimumFractionDigits: 2 })} PESOS DURANTE ${semanas} ${textoModalidad}`, 117.5, 53.5, { align: 'center' });

  // --- CLAUSULAS ---
  doc.setFontSize(6);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(60);
  const clausulas = `VALOR RECIBIDO A MI (NUESTRA) ENTERA SATISFACCION, ESTE PAGARE FORMA PARTE DE UNA SERIE NUMERADA DEL 01 AL ${semanas} Y TODOS ESTAN SUJETOS A LA CONDICION DE QUE DE NO PAGARSE CUALQUIERA DE ELLOS A SU VENCIMIENTO, SERAN EXIGIBLES TODOS LOS QUE LE SIGUEN EN NUMERO, ADEMAS DE LOS YA VENCIDOS DE ACUERDO AL ART. 79 DE LA LEY GENERAL DE TITULOS Y OPERACIONES DE CREDITO. CAUSARAN INTERESES MORATORIOS DEL 1.5% POR CADA DIA. DICHOS INTERESES SE CAUSARAN SOBRE EL CAPITAL INSOLUTO CONFORME A LO DISPUESTO POR EL ART. 152 INCISO I, II, III, IV DE LA LEY GENERAL DE TITULOS Y OPERACIONES DE CREDITO.`;
  doc.text(doc.splitTextToSize(clausulas, 195), 7, 62);

  // =========================================================
  // --- BLOQUES INFERIORES REAJUSTADOS (CORRECCIÓN AQUÍ) ---
  // =========================================================
  const yBase = 82; // Subimos ligeramente la base para que no choque con las cláusulas
  const hBase = 38; // Acortamos un poco la altura para que las líneas de firma quepan bien
  
  const xHeaders = [7, 112, 160];
  const wHeaders = [105, 48, 43];
  const headers = ["NOMBRE Y DATOS DEL DEUDOR", "AVAL", "DEUDOR"];

  // Dibujar cuadros y encabezados
  headers.forEach((h, i) => {
    doc.setFillColor(grisClaro[0], grisClaro[1], grisClaro[2]);
    doc.rect(xHeaders[i], yBase, wHeaders[i], 6, 'F');
    doc.rect(xHeaders[i], yBase, wHeaders[i], hBase);
    doc.setTextColor(verde[0], verde[1], verde[2]);
    doc.setFontSize(7.5);
    doc.text(h, xHeaders[i] + wHeaders[i]/2, yBase + 4.5, { align: 'center' });
  });

  // --- DATOS DEL DEUDOR (Alineados dinámicamente) ---
  doc.setTextColor(0);
  doc.setFontSize(8);
  
  // Nombre
  doc.text("NOMBRE", 9, yBase + 12);
  doc.line(23, yBase + 12, 108, yBase + 12); 
  doc.text(cliente, 25, yBase + 11.5); // El texto se dibuja un pelín arriba de la línea

  // Domicilio
  doc.text("DOMICILIO", 9, yBase + 22);
  doc.line(25, yBase + 22, 108, yBase + 22);
  doc.setFontSize(7);
  doc.text(doc.splitTextToSize(direccion, 80), 27, yBase + 21.5);

  // Población
  doc.setFontSize(8);
  doc.text("POBLACION", 9, yBase + 32);
  doc.line(27, yBase + 32, 108, yBase + 32);
  doc.text(poblacion, 29, yBase + 31.5);

  // --- AREA DE FIRMAS (Reajustado para que no choque con el nombre) ---
  doc.setFontSize(7);
  
  // Línea y texto Aval
  doc.line(117, yBase + 30, 155, yBase + 30); // Subimos la línea de firma a +30
  doc.text("FIRMA (S)", 136, yBase + 33, { align: 'center' }); // Texto a +33
  
  // Línea y texto Deudor
  doc.line(165, yBase + 30, 198, yBase + 30); // Subimos la línea de firma a +30
  doc.text("FIRMA (S)", 181.5, yBase + 33, { align: 'center' }); // Texto a +33
  
  // Nombre del Aval (encima de la línea, con espacio suficiente)
  doc.setFont("helvetica", "bold");
  doc.text(avalNombre, 136, yBase + 20, { align: 'center', maxWidth: 45 }); // Nombre a +20



  doc.save(`Pagare_${cliente.replace(/\s+/g, '_')}.pdf`);
};