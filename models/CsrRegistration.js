const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const CsrRegistration = sequelize.define('CsrRegistration', {
  // Section 1: Basic Information
  centre_name: { type: DataTypes.STRING, allowNull: false },
  partner_name: { type: DataTypes.STRING, allowNull: false },
  address: { type: DataTypes.TEXT, allowNull: false },
  country: DataTypes.STRING,
  state: DataTypes.STRING,
  district: DataTypes.STRING,
  pincode: DataTypes.STRING,
  constituency: DataTypes.STRING,
  geo_location: DataTypes.STRING,
  address_proof_path: DataTypes.STRING,
  address_proof_type: DataTypes.STRING,
  geo_type: DataTypes.STRING,
  spoc_name: DataTypes.STRING,
  spoc_contact: DataTypes.STRING,
  spoc_email: DataTypes.STRING,
  spoc_aadhar: DataTypes.STRING,
  affiliation: DataTypes.STRING,
  affiliation_coordinator_name: DataTypes.STRING,
  affiliation_coordinator_mobile: DataTypes.STRING,
  worked_before: DataTypes.STRING,
  job_roles: DataTypes.JSON,

  // Section 2: Infrastructure Details
  ownership: DataTypes.STRING,
  provider_same: DataTypes.STRING,
  look_feel: DataTypes.STRING,
  sign_board: DataTypes.STRING,
  building_type: DataTypes.STRING,
  floors: DataTypes.STRING,
  classrooms_no: DataTypes.INTEGER,
  classrooms_size: DataTypes.STRING,
  labs_no: DataTypes.INTEGER,
  equipments_available: DataTypes.STRING,
  equipment_list_path: DataTypes.STRING,
  office_room: DataTypes.STRING,
  counseling_rooms: DataTypes.STRING,
  chairs_no: DataTypes.INTEGER,
  staff_no: DataTypes.INTEGER,
  toilets_male: DataTypes.INTEGER,
  toilets_female: DataTypes.INTEGER,
  pantry: DataTypes.STRING,
  clean_water: DataTypes.STRING,
  cleanliness: DataTypes.STRING,

  // Section 3: Assessment
  grading: DataTypes.STRING,
  recommendations: DataTypes.TEXT,
  evaluator_signature: DataTypes.STRING,
  evaluation_date: DataTypes.DATEONLY,
}, {
  tableName: 'csr_registrations', // Explicitly define table name
  underscored: true, // Use snake_case for automatic fields like createdAt, updatedAt
  timestamps: true,
});

module.exports = CsrRegistration;