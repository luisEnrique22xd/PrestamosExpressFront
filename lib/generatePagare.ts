import jsPDF from 'jspdf';

export const generarPagare = (data: any) => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a5'
  });

  const { esGrupal, numIntegrantes, cuotaPorSocio } = data; // Extraemos nuevos datos
  const cliente = (data.nombreCliente || "").toUpperCase();
  const direccion = (data.direccion || "").toUpperCase();
  const avalNombre = (data.nombreAval || "________________________").toUpperCase();
  const capital = parseFloat(data.monto || 0);
  const semanas = parseInt(data.cuotas || 0);
  const pago = parseFloat(data.pagoPorCuota || 0);
  const folioRaw = data.folio_consecutivo || 1;
  const folioFormateado = folioRaw.toString().padStart(5, '0');
  
  const venci = data.fechaVencimiento ? new Date(data.fechaVencimiento) : new Date();
  const fVenci = {
    dia: venci.getDate().toString().padStart(2, '0'),
    mes: venci.toLocaleString('es-MX', { month: 'long' }).toUpperCase(),
    año: venci.getFullYear().toString()
  };

  const hoy = new Date();
  const fExp = {
    dia: hoy.getDate().toString(),
    mes: hoy.toLocaleString('es-MX', { month: 'long' }).toUpperCase(),
    año: hoy.getFullYear().toString()
  };

  const verde = [34, 139, 34];
  doc.setDrawColor(verde[0], verde[1], verde[2]);
  doc.setLineWidth(0.4);
  doc.rect(5, 5, 200, 138); 

  doc.setFillColor(verde[0], verde[1], verde[2]);
  doc.rect(7, 7, 30, 8, 'F');
  doc.setTextColor(255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text(esGrupal ? "PAGARE GRUPAL" : "PAGARE", 10, 12);

  doc.setTextColor(verde[0], verde[1], verde[2]);
  doc.rect(37, 7, 60, 8);
  doc.setFontSize(7);
  doc.text("LUGAR DE EXPEDICION", 50, 10);
  doc.setTextColor(0);
  doc.text("Santa Maria Acuitlapilco, TLAXCALA", 39, 14);

  doc.rect(97, 7, 12, 8); doc.text(fExp.dia, 103, 13, { align: 'center' });
  doc.rect(109, 7, 35, 8); doc.text(fExp.mes, 126, 13, { align: 'center' });
  doc.rect(144, 7, 15, 8); doc.text(fExp.año, 151, 13, { align: 'center' });

  doc.rect(159, 7, 44, 8);
  doc.setFontSize(8);
  doc.setTextColor(verde[0], verde[1], verde[2]);
  doc.text("BUENO POR", 162, 10);
  doc.setTextColor(0);
  doc.setFontSize(10);
  doc.text(`$ ${capital.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, 181, 14, { align: 'center' });

  doc.setFontSize(8);
  doc.text(`No. PR-${folioFormateado}`, 7, 20);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  const textoDebo = esGrupal 
    ? `Debemos y pagaremos solidaria e incondicionalmente sin pretexto este pagaré en el lugar y fechas citadas donde elija el tenedor el dia de su vencimiento`
    : `Debo(emos) y pagaré(mos) incondicionalmente sin pretexto este pagaré en el lugar y fechas citadas donde elija el tenedor el dia de su vencimiento`;
  doc.text(textoDebo, 7, 28);
  doc.text(`a la orden de: PLACIDO FLORES GUERRERO y/o DULCE MARIA FELIX TLAPA HARO`, 7, 34);
  
  doc.text(`el día`, 140, 34);
  doc.setFont("helvetica", "bold");
  doc.text(`${fVenci.dia}`, 152, 34); 
  doc.text(`${fVenci.mes}`, 165, 34);
  doc.text(`${fVenci.año}`, 194, 34);

  doc.rect(32, 42, 171, 10);
  doc.setFont("helvetica", "bold");
  doc.text(`PAGO DE $${pago.toLocaleString('es-MX', { minimumFractionDigits: 2 })} PESOS DURANTE ${semanas} SEMANAS`, 117, 47, { align: 'center' });
  
  if(esGrupal) {
      doc.setFontSize(6);
      doc.text(`( CADA INTEGRANTE APORTARÁ: $${parseFloat(cuotaPorSocio).toFixed(2)} )`, 117, 50, { align: 'center' });
  } else {
      doc.setFontSize(7);
      doc.text("( CANTIDAD CORRESPONDIENTE AL ABONO SEMANAL Y PLAZO )", 117, 50, { align: 'center' });
  }

  doc.setFontSize(6);
  doc.setFont("helvetica", "normal");
  const clausulas = `VALOR RECIBIDO A NUESTRA ENTERA SATISFACCION BAJO REGIMEN DE RESPONSABILIDAD SOLIDARIA. ESTE PAGARE FORMA PARTE DE UNA SERIE NUMERADA Y TODOS ESTAN SUJETOS A LA CONDICION DE QUE DE NO PAGARSE CUALQUIERA DE ELLOS A SU VENCIMIENTO, CAUSARAN PENALIZACION DEL 1.5% DIARIO SOBRE EL SALDO INICIAL.`;
  doc.text(doc.splitTextToSize(clausulas, 195), 7, 56);

  let yF = 85;
  doc.rect(7, yF, 95, 45); 
  doc.rect(102, yF, 52, 45);
  doc.rect(154, yF, 49, 45);

  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text(esGrupal ? "DATOS DEL GRUPO" : "DATOS DEL DEUDOR", 54, yF + 5, { align: "center" });
  doc.text(esGrupal ? "PRESIDENTE" : "AVAL", 128, yF + 5, { align: "center" });
  doc.text("FIRMA", 178, yF + 5, { align: "center" });

  let currentY = yF + 12;
  const drawWrappedText = (label: string, value: string, x: number, y: number, maxWidth: number) => {
    doc.setFont("helvetica", "bold");
    doc.text(label, x, y);
    doc.setFont("helvetica", "normal");
    const labelWidth = doc.getTextWidth(label) + 2;
    const splitText = doc.splitTextToSize((value || "________________________").toUpperCase(), maxWidth - labelWidth);
    doc.text(splitText, x + labelWidth, y);
    return y + (Array.isArray(splitText) ? splitText.length : 1) * 3.5;
  };

  doc.setFontSize(7);
  currentY = drawWrappedText(esGrupal ? "GRUPO:" : "NOMBRE:", cliente, 10, currentY, 90);
  currentY = drawWrappedText("DOMICILIO:", direccion, 10, currentY, 90);
  currentY = drawWrappedText("TEL:", (data.telefono || ""), 10, currentY, 90);
  if(esGrupal) doc.text(`SOCIOS: ${numIntegrantes}`, 10, currentY);

  const avalSplit = doc.splitTextToSize(avalNombre, 48);
  doc.text(avalSplit, 105, yF + 12);
  doc.text(`TEL: ${data.telefonoAval || ""}`, 105, yF + 25);
  doc.line(105, yF + 38, 150, yF + 38);
  
  doc.line(158, yF + 38, 199, yF + 38);

  doc.save(`Pagare_${cliente.replace(/\s+/g, '_')}.pdf`);
};