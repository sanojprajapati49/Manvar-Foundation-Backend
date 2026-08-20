const CsrRegistration = require('../models/CsrRegistration');

const uploadedCsrFileUrl = (file) => {
  if (!file) return null;
  return `uploads/csr/${file.filename}`.replace(/\\/g, '/');
};
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

function normalizeJobRoles(body) {
  const raw = body.job_roles ?? body['job_roles[]'];

  if (!raw) return [];
  if (Array.isArray(raw)) return raw.filter(Boolean);
  if (typeof raw === 'string') return raw.split(',').map(item => item.trim()).filter(Boolean);
  return [raw].filter(Boolean);
}

function formatValue(value, fallback = 'N/A') {
  if (Array.isArray(value)) return value.filter(Boolean).join(', ') || fallback;
  if (typeof value === 'string' && value.trim().startsWith('[')) {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed.filter(Boolean).join(', ') || fallback;
    } catch (error) {
      return value;
    }
  }
  if (value === null || value === undefined || value === '') return fallback;
  return String(value);
}

function fileNameFromPath(filePath) {
  return filePath ? path.basename(filePath) : '';
}

function addPdfHeader(doc, logoPath) {
  const pageWidth = doc.page.width;

  doc.font('Helvetica-Bold')
    .fontSize(15)
    .fillColor('#111')
    .text('Infrastructure Due Diligence of a Training Centre', 50, 48, {
      width: 380,
      align: 'center'
    });

  if (fs.existsSync(logoPath)) {
    doc.image(logoPath, pageWidth - 128, 30, { fit: [78, 58], align: 'right' });
  }
}

function drawCell(doc, x, y, width, height, text, options = {}) {
  doc.rect(x, y, width, height).stroke('#111');

  const padding = options.padding ?? 5;
  const font = options.bold ? 'Helvetica-Bold' : 'Helvetica';
  const fontSize = options.fontSize || 8.5;

  doc.font(font).fontSize(fontSize).fillColor('#111');

  const content = formatValue(text, options.fallback || ' ');
  const textHeight = doc.heightOfString(content, {
    width: width - (padding * 2),
    align: options.align || 'left'
  });
  const textY = options.valign === 'middle'
    ? y + Math.max(padding, (height - textHeight) / 2)
    : y + padding;

  doc.text(content, x + padding, textY, {
    width: width - (padding * 2),
    align: options.align || 'left'
  });
}

function drawTable(doc, x, y, widths, rows) {
  let currentY = y;

  rows.forEach((row) => {
    let currentX = x;
    const height = row.height || 24;

    row.cells.forEach((cell, index) => {
      const cellConfig = typeof cell === 'object' && cell !== null ? cell : { text: cell };
      drawCell(doc, currentX, currentY, widths[index], height, cellConfig.text, cellConfig);
      currentX += widths[index];
    });

    currentY += height;
  });

  return currentY;
}

function buildCsrPdf(doc, registration) {
  const logoPath = path.join(__dirname, '..', '..', 'website', 'images', 'lok_bharti.png');
  const address = [
    registration.address,
    registration.district,
    registration.state,
    registration.country,
    registration.pincode ? `PIN: ${registration.pincode}` : ''
  ].filter(Boolean).join(', ');
  const addressProof = [
    fileNameFromPath(registration.address_proof_path),
    registration.address_proof_type
  ].filter(Boolean).join(' - ');
  const coordinator = [
    registration.affiliation_coordinator_name,
    registration.affiliation_coordinator_mobile
  ].filter(Boolean).join(' - ');
  const toilets = [
    registration.toilets_male ? `Male: ${registration.toilets_male}` : '',
    registration.toilets_female ? `Female: ${registration.toilets_female}` : ''
  ].filter(Boolean).join(', ');

  addPdfHeader(doc, logoPath);

  doc.font('Helvetica-Bold').fontSize(10).text('1.   Basic Information', 50, 112);

  const basicRows = [
    {
      height: 22,
      cells: [
        { text: 'S No', bold: true, align: 'center', valign: 'middle' },
        { text: 'Particular', bold: true, align: 'center', valign: 'middle' },
        { text: 'Details', bold: true, align: 'center', valign: 'middle' }
      ]
    },
    { height: 32, cells: [{ text: '1', align: 'center', valign: 'middle' }, 'Name of Training Centre', registration.centre_name] },
    { height: 36, cells: [{ text: '2', align: 'center', valign: 'middle' }, 'Name of Training Partner\n(As Per MOU)', registration.partner_name] },
    { height: 46, cells: [{ text: '3', align: 'center', valign: 'middle' }, 'Complete Address & Pin code', address] },
    { height: 26, cells: [{ text: '3.1', align: 'center', valign: 'middle' }, 'Parliamentary Constituency', registration.constituency] },
    { height: 26, cells: [{ text: '3.2', align: 'center', valign: 'middle' }, 'Geo Location', registration.geo_location] },
    { height: 34, cells: [{ text: '4', align: 'center', valign: 'middle' }, 'Address Proof (Mandatory)', addressProof] },
    { height: 40, cells: [{ text: '4.1', align: 'center', valign: 'middle' }, 'Address Proof Type\n(Rent Agreement/Electricity\nBill/Phone or Internet Bill)', registration.address_proof_type] },
    { height: 34, cells: [{ text: '5', align: 'center', valign: 'middle' }, 'Geographical Location\n(Rural/Urban)', registration.geo_type] },
    { height: 32, cells: [{ text: '6', align: 'center', valign: 'middle' }, 'Centre SPOC Name & Designation', registration.spoc_name] },
    { height: 25, cells: [{ text: '6.1', align: 'center', valign: 'middle' }, 'Centre SPOC Contact No.', registration.spoc_contact] },
    { height: 25, cells: [{ text: '6.2', align: 'center', valign: 'middle' }, 'Centre SPOC Email Id', registration.spoc_email] },
    { height: 25, cells: [{ text: '6.3', align: 'center', valign: 'middle' }, 'Centre SPOC Aadhar No.', registration.spoc_aadhar] },
    { height: 25, cells: [{ text: '7', align: 'center', valign: 'middle' }, 'Any Affiliation', { text: registration.affiliation, align: 'center', valign: 'middle' }] },
    { height: 30, cells: [{ text: '8', align: 'center', valign: 'middle' }, 'Whether the Training Partner has\nworked with us earlier?', { text: registration.worked_before, align: 'center', valign: 'middle' }] },
    { height: 30, cells: [{ text: '8.1', align: 'center', valign: 'middle' }, 'If Yes: Name & Mobile No. of the\nCoordinator', coordinator] },
    { height: 28, cells: [{ text: '9', align: 'center', valign: 'middle' }, 'Job Roles Applied For', formatValue(registration.job_roles)] }
  ];

  drawTable(doc, 50, 132, [45, 210, 290], basicRows);

  doc.addPage();
  addPdfHeader(doc, logoPath);

  const infraRows = [
    {
      height: 22,
      cells: [
        { text: 'S No', bold: true, align: 'center', valign: 'middle' },
        { text: 'Particular', bold: true, align: 'center', valign: 'middle' },
        { text: 'Status', bold: true, align: 'center', valign: 'middle' },
        { text: 'Remarks', bold: true, align: 'center', valign: 'middle' }
      ]
    },
    { height: 26, cells: [{ text: '1.', align: 'center', valign: 'middle' }, 'Ownership of the Building', { text: registration.ownership, align: 'center', valign: 'middle' }, ''] },
    { height: 26, cells: [{ text: '2.', align: 'center', valign: 'middle' }, 'Training Provider is Same/Other', { text: registration.provider_same, align: 'center', valign: 'middle' }, ''] },
    { height: 32, cells: [{ text: '3.', align: 'center', valign: 'middle' }, 'Look & feel', { text: registration.look_feel, align: 'center', valign: 'middle' }, ''] },
    { height: 26, cells: [{ text: '4.', align: 'center', valign: 'middle' }, 'Sign Board', { text: registration.sign_board, align: 'center', valign: 'middle' }, ''] },
    { height: 26, cells: [{ text: '5.', align: 'center', valign: 'middle' }, 'Is it RCC/ Non RCC', { text: registration.building_type, align: 'center', valign: 'middle' }, ''] },
    { height: 26, cells: [{ text: '6.', align: 'center', valign: 'middle' }, 'Floors of the Training Centre', { text: registration.floors, align: 'center', valign: 'middle' }, { text: 'Lift\n(Available/Not)', align: 'center' }] },
    { height: 26, cells: [{ text: '7.', align: 'center', valign: 'middle' }, 'No. of Class Rooms', registration.classrooms_no, ''] },
    { height: 26, cells: [{ text: '8.', align: 'center', valign: 'middle' }, 'Size of Class Rooms (In Sq. Feet)', registration.classrooms_size, ''] },
    { height: 26, cells: [{ text: '9.', align: 'center', valign: 'middle' }, 'No. of Domains Labs (Trade)', registration.labs_no, ''] },
    { height: 32, cells: [{ text: '10.', align: 'center', valign: 'middle' }, 'Availability of Domain Equipments (List of\nEquipment to be Attached)', { text: registration.equipments_available, align: 'center', valign: 'middle' }, fileNameFromPath(registration.equipment_list_path)] },
    { height: 26, cells: [{ text: '11.', align: 'center', valign: 'middle' }, 'Office Room', { text: registration.office_room, align: 'center', valign: 'middle' }, ''] },
    { height: 26, cells: [{ text: '12.', align: 'center', valign: 'middle' }, 'Counseling Rooms', { text: registration.counseling_rooms, align: 'center', valign: 'middle' }, ''] },
    { height: 26, cells: [{ text: '13.', align: 'center', valign: 'middle' }, 'No. of Chairs/ Stools', registration.chairs_no, ''] },
    { height: 26, cells: [{ text: '14.', align: 'center', valign: 'middle' }, 'No. of Staff', registration.staff_no, ''] },
    { height: 26, cells: [{ text: '15.', align: 'center', valign: 'middle' }, 'No. of Toilets', { text: toilets, align: 'center', valign: 'middle' }, ''] },
    { height: 26, cells: [{ text: '16.', align: 'center', valign: 'middle' }, 'Pantry', { text: registration.pantry, align: 'center', valign: 'middle' }, ''] },
    { height: 26, cells: [{ text: '17.', align: 'center', valign: 'middle' }, 'Availability of Clean Drinking Water', { text: registration.clean_water, align: 'center', valign: 'middle' }, ''] },
    { height: 26, cells: [{ text: '18.', align: 'center', valign: 'middle' }, 'Cleanliness of the Centre', { text: registration.cleanliness, align: 'center', valign: 'middle' }, ''] }
  ];

  let currentY = drawTable(doc, 50, 112, [45, 235, 145, 120], infraRows);
  currentY += 22;

  currentY = drawTable(doc, 50, currentY, [305, 240], [
    { height: 34, cells: [{ text: 'Assessment: Based on Physical Verification of\nInfrastructure', bold: true }, ''] },
    { height: 28, cells: ['Category of Centre (Grading) A/B/C/C+/D', registration.grading] },
    { height: 42, cells: ['Recommendations Comments', registration.recommendations] }
  ]);

  drawTable(doc, 50, currentY + 28, [210, 335], [
    { height: 30, cells: [{ text: 'Signature of Evaluator -', bold: true }, registration.evaluator_signature] },
    { height: 30, cells: [{ text: 'Date of Evaluation', bold: true }, registration.evaluation_date] }
  ]);
}

exports.handleCsrRegistration = async (req, res) => {
  try {
    const { body, files } = req;

    const address_proof_path = files.address_proof ? uploadedCsrFileUrl(files.address_proof[0]) : null;
    const equipment_list_path = files.equipment_list ? uploadedCsrFileUrl(files.equipment_list[0]) : null;
    const job_roles = normalizeJobRoles(body);

    const registrationData = {
      centre_name: body.centre_name,
      partner_name: body.partner_name,
      address: body.address,
      country: body.country,
      state: body.state,
      district: body.district,
      pincode: body.pincode,
      constituency: body.constituency,
      geo_location: body.geo_location,
      address_proof_type: body.address_proof_type,
      geo_type: body.geo_type,
      spoc_name: body.spoc_name,
      spoc_contact: body.spoc_contact,
      spoc_email: body.spoc_email,
      spoc_aadhar: body.spoc_aadhar,
      affiliation: body.affiliation,
      affiliation_coordinator_name: body.affiliation_coordinator_name,
      affiliation_coordinator_mobile: body.affiliation_coordinator_mobile,
      worked_before: body.worked_before,
      job_roles,
      ownership: body.ownership,
      provider_same: body.provider_same,
      look_feel: body.look_feel,
      sign_board: body.sign_board,
      building_type: body.building_type,
      floors: body.floors,
      classrooms_no: body.classrooms_no,
      classrooms_size: body.classrooms_size,
      labs_no: body.labs_no,
      equipments_available: body.equipments_available || body.equipments,
      office_room: body.office_room,
      counseling_rooms: body.counseling_rooms,
      chairs_no: body.chairs_no,
      staff_no: body.staff_no,
      toilets_male: body.toilets_male,
      toilets_female: body.toilets_female,
      pantry: body.pantry,
      clean_water: body.clean_water || body.water,
      cleanliness: body.cleanliness,
      grading: body.grading,
      recommendations: body.recommendations || body.comments,
      evaluator_signature: body.evaluator_signature || body.evaluator_sign,
      evaluation_date: body.evaluation_date || body.eval_date,
      address_proof_path,
      equipment_list_path,
    };

    await CsrRegistration.create(registrationData);

    res.status(201).json({ success: true, message: 'Registration successful!' });
  } catch (error) {
    console.error('CSR Registration Error:', error);
    res.status(500).json({ success: false, error: 'An error occurred during registration.' });
  }
};

exports.downloadCsrPdf = async (req, res) => {
  try {
    const registration = await CsrRegistration.findByPk(req.params.id);
    if (!registration) {
      return res.status(404).json({ success: false, error: 'Registration not found.' });
    }

    const doc = new PDFDocument({ margin: 0, size: 'A4', bufferPages: true });
    const filename = `csr-registration-${registration.id}.pdf`;

    res.setHeader('Content-disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-type', 'application/pdf');

    doc.pipe(res);
    buildCsrPdf(doc, registration);

    doc.end();
  } catch (error) {
    console.error('PDF Download Error:', error);
    res.status(500).json({ success: false, error: 'Failed to generate PDF.' });
  }
};
