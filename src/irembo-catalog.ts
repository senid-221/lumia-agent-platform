import { db } from './db.js';

type IremboCatalogEntry = {
  slug: string;
  name: string;
  category: string;
  institution: string;
  description: string;
  requirements: string[];
  feeRwf: number | null;
  processingTime: string;
  accountRequired: boolean | null;
  officialUrl: string;
};

export const OFFICIAL_IREMBO_CATALOG: IremboCatalogEntry[] = [
  {
    slug: 'community-based-health-insurance-mutuelle',
    name: 'Community Based Health Insurance (Mutuelle)',
    category: 'Health',
    institution: 'Rwanda Social Security Board (RSSB)',
    description: 'Apply for and pay Community Based Health Insurance (Mutuelle) for yourself and your household through IremboGov.',
    requirements: [
      'The head of the household should have a national ID number.',
      'The applicant should have a valid phone number and/or email address.'
    ],
    feeRwf: null,
    processingTime: 'Immediately after payment',
    accountRequired: false,
    officialUrl: 'https://support.irembo.gov.rw/en/support/solutions/articles/47001199252-how-to-apply-and-pay-for-community-based-health-insurance-mutuelle-'
  },
  {
    slug: 'definitive-driving-license',
    name: 'Definitive Driving License',
    category: 'Transport',
    institution: 'Rwanda National Police (RNP)',
    description: 'Application for a definitive driving license after passing the definitive driving test.',
    requirements: [
      'The applicant should have passed the Definitive Driving Test.',
      'Registration code.',
      'Valid phone number.',
      'Email address.'
    ],
    feeRwf: 50000,
    processingTime: 'Within 14 days',
    accountRequired: false,
    officialUrl: 'https://support.irembo.gov.rw/en/support/solutions/articles/47001236142-frequently-asked-questions-about-driving-licenses'
  },
  {
    slug: 'notary-services',
    name: 'Various Notary Services',
    category: 'Notarization And Gazette Service',
    institution: 'IremboGov / designated notary offices',
    description: 'Apply and pay for notary services through IremboGov; the exact fee depends on the document type.',
    requirements: [
      'Adults should have a Rwandan National ID number.',
      'Foreigners should have a valid passport number and other personal information.',
      'Companies should have a company name and company TIN.',
      'Applicants should know the document type.',
      'Valid phone number, email address, or both.'
    ],
    feeRwf: null,
    processingTime: '1 day',
    accountRequired: false,
    officialUrl: 'https://support.irembo.gov.rw/en/support/solutions/articles/47001178433-how-to-apply-for-notary-services'
  },
  {
    slug: 'motor-vehicle-inspection-first-visit',
    name: 'Motor Vehicle Inspection (MVI) First Visit Appointment',
    category: 'Vehicle Technical Inspection & Emission Testing',
    institution: 'Rwanda National Police (RNP) and Rwanda Environment Management Authority (REMA)',
    description: 'Book and pay for a first motor vehicle inspection appointment combining technical and emission inspection for cars.',
    requirements: [
      'Outstanding traffic fines must be cleared before booking.',
      'The vehicle must be a car.',
      'Vehicle plate number.',
      'Vehicle TIN.',
      'Companies with fewer than 30 vehicles apply individually; larger fleets may use a company code.'
    ],
    feeRwf: null,
    processingTime: 'Appointment confirmed instantly upon payment',
    accountRequired: false,
    officialUrl: 'https://support.irembo.gov.rw/en/support/solutions/articles/47001283857-how-to-apply-for-a-motor-vehicle-inspection-1st-visit-appointment'
  },
  {
    slug: 'visa-application',
    name: 'Visa Application',
    category: 'Immigration And Emigration',
    institution: 'Directorate General of Immigration and Emigration (DGIE)',
    description: 'Apply for an entry visa online through IremboGov. Visa type and fee depend on the application.',
    requirements: [
      'Valid phone number.',
      'Email address.',
      'The applicant must select the appropriate visa type.'
    ],
    feeRwf: null,
    processingTime: '4 days',
    accountRequired: false,
    officialUrl: 'https://support.irembo.gov.rw/en/support/solutions/articles/47001155415-how-to-apply-for-a-visa'
  },
  {
    slug: 'single-digital-id-adult-self-pre-enrollment',
    name: 'Single Digital ID Adult Self Pre-enrollment',
    category: 'Identification',
    institution: 'IremboGov / National Identification Agency',
    description: 'Adult self-pre-enrollment for the Single Digital ID (e-ID/e-ndangamuntu).',
    requirements: [
      'An Irembo account is required for this service.',
      'Rwandan citizens can use a National ID or NIDA application number.',
      'Applicants follow the identification or selfie-code verification flow.'
    ],
    feeRwf: 0,
    processingTime: '30 days',
    accountRequired: true,
    officialUrl: 'https://support.new.irembo.gov.rw/en/support/solutions/articles/47001283560-how-to-apply-for-single-digital-id-adult-self-pre-enrollment-'
  }
];


  {
    slug: 'birth-certificate',
    name: 'Birth Certificate',
    category: 'Family',
    institution: 'Ministry of Local Government (MINALOC)',
    description: 'Apply for an official birth certificate through IremboGov.',
    requirements: ['National ID number or Citizen Application Number.', 'Valid phone number and/or email address.'],
    feeRwf: 500,
    processingTime: '1 working day',
    accountRequired: true,
    officialUrl: 'https://support.irembo.gov.rw/en/support/solutions/articles/47001193156-how-to-apply-for-a-birth-certificate'
  },
  {
    slug: 'birth-record',
    name: 'Birth Record',
    category: 'Family',
    institution: 'Ministry of Local Government (MINALOC)',
    description: 'Apply for a birth record certificate through IremboGov.',
    requirements: ['National ID, Citizen Application Number, or National Identification Number.', 'Valid phone number, email address, or both.'],
    feeRwf: 1500,
    processingTime: '1 working day',
    accountRequired: true,
    officialUrl: 'https://support.irembo.gov.rw/en/support/solutions/articles/47001200821-how-to-apply-for-a-birth-record'
  },
  {
    slug: 'marriage-certificate',
    name: 'Marriage Certificate',
    category: 'Family',
    institution: 'Ministry of Local Government (MINALOC)',
    description: 'Apply for an official marriage certificate through IremboGov.',
    requirements: ['National ID number.', 'Spouse identification details.', 'Legal marriage details.', 'Valid phone number and/or email address.'],
    feeRwf: 500,
    processingTime: '1 working day',
    accountRequired: true,
    officialUrl: 'https://support.irembo.gov.rw/en/support/solutions/articles/47001193158-how-to-apply-for-a-marriage-certificate'
  },
  {
    slug: 'marriage-record',
    name: 'Marriage Record',
    category: 'Family',
    institution: 'Ministry of Local Government (MINALOC)',
    description: 'Apply for a marriage record certificate through IremboGov.',
    requirements: ['National ID, Citizen Application Number, National Identification Number, or eligible spouse identification.', 'Marriage proof/document.', 'Valid phone number or email address.'],
    feeRwf: 1500,
    processingTime: '1 working day',
    accountRequired: true,
    officialUrl: 'https://support.irembo.gov.rw/en/support/solutions/articles/47001200824-how-to-apply-for-a-marriage-record'
  },
  {
    slug: 'certificate-of-being-single',
    name: 'Certificate of Being Single',
    category: 'Family',
    institution: 'Ministry of Local Government (MINALOC)',
    description: 'Apply for an official certificate declaring that an individual is single.',
    requirements: ['National ID number.', 'Civil status must be SINGLE in the NIDA system.', 'Valid phone number and/or email address.'],
    feeRwf: 500,
    processingTime: '1 working day',
    accountRequired: true,
    officialUrl: 'https://support.irembo.gov.rw/en/support/solutions/articles/47001200472-how-to-apply-for-a-certificate-of-being-single'
  },
  {
    slug: 'certificate-of-residence',
    name: 'Certificate of Residence',
    category: 'Family',
    institution: 'Ministry of Local Government (MINALOC)',
    description: 'Apply for a certificate confirming where a person resides.',
    requirements: ['Rwandans: National ID or Citizen Application Number for children.', 'Foreigners: passport number.', 'Valid phone number and email address, or both.'],
    feeRwf: 1500,
    processingTime: '1 working day',
    accountRequired: true,
    officialUrl: 'https://support.irembo.gov.rw/en/support/solutions/articles/47001200861-how-to-apply-for-a-certificate-of-residence'
  },
  {
    slug: 'certificate-of-being-alive',
    name: 'Certificate of Being Alive',
    category: 'Identification',
    institution: 'Ministry of Local Government (MINALOC)',
    description: 'Apply for an e-certificate confirming that a person is alive.',
    requirements: ['Adults: National ID number.', 'Minors: Child Application Number.', 'Valid phone number or email address.'],
    feeRwf: 0,
    processingTime: '1 working day',
    accountRequired: true,
    officialUrl: 'https://support.irembo.gov.rw/en/support/solutions/articles/47001205882-how-to-apply-for-a-certificate-of-being-alive'
  },
  {
    slug: 'marriage-declaration',
    name: 'Marriage Declaration',
    category: 'Family',
    institution: 'Ministry of Local Government (MINALOC)',
    description: 'Apply for a marriage declaration before legal marriage registration.',
    requirements: ['Birth certificates for both applicants.', 'Certificate of being single for both applicants.', 'Divorce or widow/widower certificate where applicable.', 'Identification documents and passport-size photo where applicable.'],
    feeRwf: null,
    processingTime: null,
    accountRequired: null,
    officialUrl: 'https://support.irembo.gov.rw/en/support/solutions/articles/47001212849-you-are-planning-to-get-married-and-you-want-to-know-how-to-apply-for-a-marriage-declaration-'
  },
  {
    slug: 'certificate-of-succession',
    name: 'Certificate of Succession',
    category: 'Family',
    institution: 'Ministry of Local Government (MINALOC)',
    description: 'Apply for a certificate of succession through IremboGov.',
    requirements: ['Exact requirements depend on the succession application and documents requested by IremboGov.'],
    feeRwf: null,
    processingTime: null,
    accountRequired: null,
    officialUrl: 'https://support.irembo.gov.rw/en/support/solutions/folders/47000777852'
  },
  {
    slug: 'certificate-of-widow-widower',
    name: 'Certificate of Widow/Widower',
    category: 'Family',
    institution: 'Ministry of Local Government (MINALOC)',
    description: 'Apply for a certificate of widow or widower through IremboGov.',
    requirements: ['Exact requirements depend on the application and supporting documents requested by IremboGov.'],
    feeRwf: null,
    processingTime: null,
    accountRequired: null,
    officialUrl: 'https://support.irembo.gov.rw/en/support/solutions/folders/47000777852'
  },
  {
    slug: 'certificate-of-cohabitation',
    name: 'Certificate of Cohabitation',
    category: 'Family',
    institution: 'Ministry of Local Government (MINALOC)',
    description: 'Apply for a certificate of cohabitation through IremboGov.',
    requirements: ['Exact requirements depend on the application and supporting documents requested by IremboGov.'],
    feeRwf: null,
    processingTime: null,
    accountRequired: null,
    officialUrl: 'https://support.irembo.gov.rw/en/support/solutions/folders/47000777852'
  },
  {
    slug: 'guardianship-record',
    name: 'Guardianship Record',
    category: 'Family',
    institution: 'Ministry of Local Government (MINALOC)',
    description: 'Apply for a guardianship record through IremboGov.',
    requirements: ['Exact requirements depend on the guardianship application and supporting documents requested by IremboGov.'],
    feeRwf: null,
    processingTime: null,
    accountRequired: null,
    officialUrl: 'https://support.irembo.gov.rw/en/support/solutions/folders/47000777852'
  },
  {
    slug: 'adoption-record',
    name: 'Adoption Record',
    category: 'Family',
    institution: 'Ministry of Local Government (MINALOC)',
    description: 'Apply for an adoption record through IremboGov.',
    requirements: ['Exact requirements depend on the adoption application and supporting documents requested by IremboGov.'],
    feeRwf: null,
    processingTime: null,
    accountRequired: null,
    officialUrl: 'https://support.irembo.gov.rw/en/support/solutions/folders/47000777852'
  },
  {
    slug: 'title-transfer-court-judgement',
    name: 'Title Transfer – Copy of Court Judgement',
    category: 'Land Services',
    institution: 'National Land Authority (NLA)',
    description: 'Transfer land rights following a court judgement through IremboGov.',
    requirements: ['IremboGov account for self-application.', 'Landowner National ID matching the parcel UPI.', 'Court decision and/or judgement execution report.', 'Land documents and applicable transferee civil-status document.'],
    feeRwf: 0,
    processingTime: '7 working days',
    accountRequired: true,
    officialUrl: 'https://support.irembo.gov.rw/en/support/solutions/articles/47001218291-how-to-apply-for-title-transfer-copy-of-court-judgement'
  },
  {
    slug: 'motor-vehicle-inspection-first-visit',
    name: 'Motor Vehicle Inspection (MVI) First Visit Appointment',
    category: 'Car and Motor Services',
    institution: 'Rwanda National Police (RNP) and Rwanda Environment Management Authority (REMA)',
    description: 'Book and pay for a first motor vehicle inspection appointment covering technical and emission inspection.',
    requirements: ['Clear outstanding traffic fines.', 'Vehicle plate number.', 'TIN.', 'Company code where applicable.'],
    feeRwf: null,
    processingTime: 'Appointment confirmed instantly after successful payment',
    accountRequired: false,
    officialUrl: 'https://support.irembo.gov.rw/en/support/solutions/articles/47001302372-frequently-asked-questions-about-motor-vehicle-inspection-mvi-1st-visit-appointment'
  },
export async function ensureOfficialIremboCatalog() {
  for (const service of OFFICIAL_IREMBO_CATALOG) {
    await db.iremboService.upsert({
      where: { slug: service.slug },
      update: {
        name: service.name,
        category: service.category,
        institution: service.institution,
        description: service.description,
        requirements: service.requirements,
        feeRwf: service.feeRwf,
        processingTime: service.processingTime,
        accountRequired: service.accountRequired,
        officialUrl: service.officialUrl,
        active: true
      },
      create: {
        slug: service.slug,
        name: service.name,
        category: service.category,
        institution: service.institution,
        description: service.description,
        requirements: service.requirements,
        feeRwf: service.feeRwf,
        processingTime: service.processingTime,
        accountRequired: service.accountRequired,
        officialUrl: service.officialUrl,
        active: true
      }
    });
  }
}
