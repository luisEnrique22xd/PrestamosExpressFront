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
  // Priorizamos la población que viene de data, si no, usamos la de Tlaxcala por defecto
  const poblacion = (data.poblacion || "SANTA MARIA ACUITLAPILCO, TLAXCALA").toUpperCase();
  const lugarExpedicion = poblacion.split('SANTA MARIA ACUITLAPILCO, TLAXCALA')[0]; // Extraemos solo el nombre del lugar sin el estado
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

  // --- ENCABEZADO: PAGARE / LUGAR / FECHA / BUENO POR ---
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
  // Controlamos que el texto de población no se salga
  doc.text(doc.splitTextToSize(lugarExpedicion, 80), 39, 14.5);

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
  doc.text(`No. ${folioFormateado}`, 7, 27);

  // --- CUERPO ---
  // --- CUERPO: DEBO Y PAGARÉ (CON SALTO DE LÍNEA CORREGIDO) ---
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  
  // Definimos el texto completo
  const textoDebo = `Debo(emos) y pagaré(mos) incondicionalmente sin pretexto este pagaré en el lugar y fechas citadas donde elija el tenedor el día de su vencimiento`;
  
  // Lo dividimos para que quepa en un ancho de 195mm (casi todo el pagaré)
  const splitDebo = doc.splitTextToSize(textoDebo, 195);
  doc.text(splitDebo, 7, 31); // Subimos un poco a Y=31 porque ahora ocupa dos líneas

  // --- BENEFICIARIOS Y VENCIMIENTO ---
  doc.text(`a la orden de:`, 7, 40);
  doc.line(28, 40, 132, 40); 
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5); 
  doc.text("PLACIDO FLORES GUERRERO y/o DULCE MARIA FELIX TLAPA HARO", 30, 39);
  
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`el día`, 134, 40);
  doc.line(143, 40, 151, 40); 
  doc.text(`de`, 153, 40);
  doc.line(158, 40, 186, 40); 
  doc.text(`de`, 188, 40);
  doc.line(193, 40, 203, 40); 

  doc.setFont("helvetica", "bold");
  doc.text(venci.getDate().toString(), 147, 39, { align: 'center' });
  doc.text(venci.toLocaleString('es-MX', { month: 'long' }).toUpperCase(), 172, 39, { align: 'center' });
  doc.text(venci.getFullYear().toString().slice(-2), 198, 39, { align: 'center' });

  // --- RECUADRO CANTIDAD ---
  doc.setFontSize(9.5);
  doc.setFont("helvetica", "bold");
  doc.text("La cantidad de:", 7, 50);
  doc.setFillColor(grisClaro[0], grisClaro[1], grisClaro[2]);
  doc.rect(32, 45, 171, 10, 'F');
  doc.rect(32, 45, 171, 10);
  doc.setFontSize(8.5);
  doc.text(`PAGO DE $${pago.toLocaleString('es-MX', { minimumFractionDigits: 2 })} PESOS DURANTE ${semanas} ${textoModalidad}`, 117.5, 51.5, { align: 'center' });

  // --- CLAUSULAS ---
  doc.setFontSize(6);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(60);
  const clausulas = `VALOR RECIBIDO A MI (NUESTRA) ENTERA SATISFACCION, ESTE PAGARE FORMA PARTE DE UNA SERIE NUMERADA DEL 01 AL 99999 Y TODOS ESTAN SUJETOS A LA CONDICION DE QUE DE NO PAGARSE CUALQUIERA DE ELLOS A SU VENCIMIENTO, SERAN EXIGIBLES TODOS LOS QUE LE SIGUEN EN NUMERO, ADEMAS DE LOS YA VENCIDOS DE ACUERDO AL ART. 79 DE LA LEY GENERAL DE TITULOS Y OPERACIONES DE CREDITO. CAUSARAN INTERESES MORATORIOS DEL 1.5% POR CADA DIA. DICHOS INTERESES SE CAUSARAN SOBRE EL CAPITAL INSOLUTO CONFORME A LO DISPUESTO POR EL ART. 152 INCISO I, II, III, IV DE LA LEY GENERAL DE TITULOS Y OPERACIONES DE CREDITO.`;
  doc.text(doc.splitTextToSize(clausulas, 195), 7, 60);

  // --- BLOQUES INFERIORES ---
  const yBase = 78;
  const hBase = 40;
  const xHeaders = [7, 112, 160];
  const wHeaders = [105, 48, 43];
  const headers = ["NOMBRE Y DATOS DEL DEUDOR", "AVAL", "DEUDOR"];

  headers.forEach((h, i) => {
    doc.setFillColor(grisClaro[0], grisClaro[1], grisClaro[2]);
    doc.rect(xHeaders[i], yBase, wHeaders[i], 6, 'F');
    doc.rect(xHeaders[i], yBase, wHeaders[i], hBase);
    doc.setTextColor(verde[0], verde[1], verde[2]);
    doc.setFontSize(7.5);
    doc.text(h, xHeaders[i] + wHeaders[i]/2, yBase + 4.5, { align: 'center' });
  });

  doc.setTextColor(0);
  doc.setFontSize(8);
  doc.text("NOMBRE", 9, yBase + 12);
  doc.line(23, yBase + 12, 108, yBase + 12);
  doc.text(cliente, 25, yBase + 11.5);

  doc.text("DOMICILIO", 9, yBase + 22);
  doc.line(25, yBase + 22, 108, yBase + 22);
  doc.setFontSize(7);
  doc.text(doc.splitTextToSize(direccion, 80), 27, yBase + 21.5);

  doc.setFontSize(8);
  doc.text("POBLACION", 9, yBase + 32);
  doc.line(27, yBase + 32, 108, yBase + 32);
  doc.text(poblacion, 29, yBase + 31.5);

  doc.setFontSize(7);
  doc.line(117, yBase + 35, 155, yBase + 35); // Línea Aval
  doc.text("FIRMA (S)", 136, yBase + 38, { align: 'center' });
  doc.line(165, yBase + 35, 198, yBase + 35); // Línea Deudor
  doc.text("FIRMA (S)", 181.5, yBase + 38, { align: 'center' });
  
  doc.setFont("helvetica", "bold");
  doc.text(avalNombre, 136, yBase + 15, { align: 'center', maxWidth: 45 });

 

  doc.save(`Pagare_${cliente.replace(/\s+/g, '_')}.pdf`);
};