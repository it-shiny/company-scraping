const mongoose = require('mongoose');

const CompanySchema = new mongoose.Schema({
    id: { type: Number, required: false },
    contact_name: { type: String, required: false },
    contact_first_name: { type: String, required: false },
    contact_middle_name: { type: String, required: false },
    contact_last_name: { type: String, required: false },
    contact_job_title_1: { type: String, required: false },
    contact_job_title_level_1: { type: String, required: false },
    contact_job_dept_name_1: { type: String, required: false },
    contact_job_function_name_1: { type: String, required: false },
    contact_email_1: { type: String, required: false },
    contact_phone_1: { type: String, required: false },
    company_company_name: { type: String, required: false },
    company_website: { type: String, required: false },
    company_address_street: { type: String, required: false },
    company_address_city: { type: String, required: false },
    company_address_state: { type: String, required: false },
    company_address_country: { type: String, required: false },
    company_address_zipcode: { type: String, required: false },
    company_employee_size: { type: String, required: false },
    company_annual_revenue_amount: { type: String, required: false },
    company_industry_categories_list: { type: String, required: false },
    company_tech_keywords_list: { type: String, default: null, required: false },
    sic_code: { type: String, required: false },
    npi_number: { type: String, default: null, required: false },
    contact_social_linkedin: { type: String, required: false },
    updatedAt: { type: Date, required: false },
    contact_social_facebook: { type: String, required: false },
    contact_social_twitter: { type: String, required: false },
    contact_social_instagram: { type: String, required: false },
  // Define your schema according to the API data
});
const Company = mongoose.model('US_Company_List', CompanySchema);

module.exports = Company;
