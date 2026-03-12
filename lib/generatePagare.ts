import jsPDF from 'jspdf';

export const generarPagare = (data: any) => {
  const doc = new jsPDF({
    orientation: 'landscape', // El pagaré de la foto es horizontal
    unit: 'mm',
    format: 'a4'
  });

  const aval = data.datos_ultimo_aval || {};
  const fecha = new Date();
  const dia = fecha.getDate().toString();
  const mes = fecha.toLocaleString('es-MX', { month: 'long' }).toUpperCase();
  const año = fecha.getFullYear().toString();

  // --- CONFIGURACIÓN DE ESTILOS ---
  const verdeFormitec = [34, 139, 34]; // Verde similar al de la imagen
  doc.setDrawColor(verdeFormitec[0], verdeFormitec[1], verdeFormitec[2]);
  doc.setLineWidth(0.5);

  // --- RECUADRO PRINCIPAL EXTERIOR ---
  doc.rect(10, 10, 277, 160); 

  // --- ENCABEZADO (PAGARE, LUGAR, FECHA, BUENO POR) ---
  // Cuadro "PAGARE"
  doc.setFillColor(verdeFormitec[0], verdeFormitec[1], verdeFormitec[2]);
  doc.rect(12, 12, 40, 10, 'F');
  doc.setTextColor(255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("PAGARE", 15, 19);

  // Cuadro "LUGAR DE EXPEDICION"
  doc.setTextColor(verdeFormitec[0], verdeFormitec[1], verdeFormitec[2]);
  doc.setFontSize(8);
  doc.rect(52, 12, 100, 10);
  doc.text("LUGAR DE EXPEDICION", 80, 15);
  doc.setTextColor(0);
  doc.text("Santa Maria Acuitlapilco, TLAXCALA", 55, 20);

  // Cuadros FECHA (DIA, MES, AÑO)
  doc.rect(152, 12, 20, 10); doc.text("DIA", 159, 15); doc.text(dia, 159, 20);
  doc.rect(172, 12, 45, 10); doc.text("MES", 190, 15); doc.text(mes, 175, 20);
  doc.rect(217, 12, 20, 10); doc.text("AÑO", 223, 15); doc.text(año, 222, 20);

  // Cuadro "BUENO POR"
  doc.rect(237, 12, 48, 10); 
  doc.text("BUENO POR", 253, 15);
  doc.setFontSize(12);
  doc.text(`$ ${data.progreso_pagos?.monto_total || '0.00'}`, 245, 20);

  // No. Folio
  doc.setFontSize(10);
  doc.text(`No. PR-${data.id}`, 15, 28);

  // --- TEXTO LEGAL (Transcripción de la imagen) ---
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  let yPos = 38;
  doc.text(`Debo(emos) y pagaré(mos) incondicionalmente sin pretexto este pagaré en el lugar y fechas citadas donde elija el tenedor el día de su vencimiento`, 12, yPos);
  
  yPos += 8;
  doc.text(`a la orden de:  PRÉSTAMOS EXPRESS Santa Maria Acuitlapilco, TLAXCALA`, 12, yPos);
  doc.text(`el día ________ de ________________________ de 20____`, 180, yPos);

  yPos += 12;
  doc.setFont("helvetica", "bold");
  doc.text("La cantidad de:", 12, yPos);
  doc.rect(45, yPos - 5, 235, 12); // Cuadro para la cantidad en letra
  doc.setFontSize(9);
  doc.text(" ( ESCRIBA AQUÍ LA CANTIDAD CON LETRA CORRESPONDIENTE AL MONTO TOTAL )", 50, yPos + 4);

  // --- VALOR RECIBIDO Y LETRAS CHIQUITAS ---
  yPos += 18;
  doc.setFontSize(7);
  const clausulas = `VALOR RECIBIDO A MI (NUESTRA) ENTERA SATISFACCION, ESTE PAGARE FORMA PARTE DE UNA SERIE NUMERADA DEL ______ AL ______ Y TODOS ESTAN SUJETOS A LA CONDICION DE QUE DE NO PAGARSE CUALQUIERA DE ELLOS A SU VENCIMIENTO, SERAN EXIGIBLES TODOS LOS QUE LE SIGUEN EN NUMERO, ADEMAS DE LOS YA VENCIDOS DE ACUERDO AL ART. 79 DE LA LEY GENERAL DE TITULOS Y OPERACIONES DE CREDITO. CAUSARAN INTERESES MORATORIOS DEL ________% POR CADA MES O FRACCION PAGADERO JUNTAMENTE CON EL PRINCIPAL. DICHOS INTERESES SE CAUSARAN SOBRE EL CAPITAL INSOLUTO. CONFORME A LO DISPUESTO POR EL ART. 152 INCISO I, II, III, IV DE LA LEY GENERAL DE TITULOS Y OPERACIONES DE CREDITO.`;
  const splitClausulas = doc.splitTextToSize(clausulas, 270);
  doc.text(splitClausulas, 12, yPos);

  // --- DATOS DEL DEUDOR, AVAL Y FIRMAS ---
  yPos += 20;
  // Cuadro Datos Deudor
  doc.rect(12, yPos, 140, 50);
  doc.setFillColor(verdeFormitec[0], verdeFormitec[1], verdeFormitec[2]);
  doc.text("NOMBRE Y DATOS DEL DEUDOR", 82, yPos + 5, { align: "center" });
  
  doc.setFontSize(9);
  doc.text(`NOMBRE:  ${data.nombre.toUpperCase()}`, 15, yPos + 15);
  doc.line(32, yPos + 16, 145, yPos + 16);
  
  doc.text(`DOMICILIO:  ${data.direccion.toUpperCase()}`, 15, yPos + 25);
  doc.line(32, yPos + 26, 145, yPos + 26);
  
  doc.text(`POBLACION:  HUAMANTLA, TLAXCALA`, 15, yPos + 35);
  doc.line(32, yPos + 36, 145, yPos + 36);

  // Cuadro AVAL
  doc.rect(152, yPos, 65, 50);
  doc.text("AVAL", 185, yPos + 5, { align: "center" });
  doc.text(aval.nombre_aval?.toUpperCase() || "________________________", 155, yPos + 25);
  doc.line(157, yPos + 40, 212, yPos + 40);
  doc.text("FIRMA (S)", 185, yPos + 45, { align: "center" });

  // Cuadro DEUDOR (Firma)
  doc.rect(217, yPos, 68, 50);
  doc.text("DEUDOR", 251, yPos + 5, { align: "center" });
  doc.line(222, yPos + 40, 280, yPos + 40);
  doc.text("FIRMA (S)", 251, yPos + 45, { align: "center" });

  // Pie de página
  doc.setFontSize(6);
  doc.setTextColor(150);
  doc.text("Formitec P 01 - Generado digitalmente por Préstamos Express", 12, 168);

  // Guardar archivo
  doc.save(`Pagare_Oficial_${data.nombre.replace(/\s+/g, '_')}.pdf`);
};