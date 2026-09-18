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
