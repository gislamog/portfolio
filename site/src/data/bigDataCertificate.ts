/**
 * Big Data Professional certificate, transcribed from the awarded certificate
 * (public/docs/big-data-certificate.jpg) so it reads as text on the site.
 * The original image stays linked for anyone who wants to see it.
 */

export interface CertificateCourse {
  code: string;
  title: string;
  /** The certificate requires three of the four qualifying courses. */
  completed: boolean;
}

export const bigDataCertificate = {
  title: 'Big Data Professional',
  recipient: 'Gulsum Islamoglu',
  awardedBy: 'Ira A. Fulton Schools of Engineering at Arizona State University',
  term: 'Spring 2025',
  location: 'Tempe, Arizona',
  imageUrl: `${import.meta.env.BASE_URL}docs/big-data-certificate.jpg`,
  pdfUrl: `${import.meta.env.BASE_URL}docs/big-data-certificate.pdf`,

  /** The citation printed on the left of the certificate. */
  citation:
    'Certified Big Data Professionals successfully completed nine credit hours of graduate level coursework and have demonstrated their ability to develop exploratory data analysis and visualization tools. Successfully applied design principles for a variety of statistical graphics and visualizations, has proven a deep understanding of common data mining algorithms to discover relationships and patterns in large datasets, has implemented advanced learning algorithms, and has performed scalable data processing operations in cloud computing.',

  requirement:
    'Student has successfully completed three of the four courses to complete the certification requirements',

  presentation: 'For successfully completing all requirements and criteria for',
  award: 'Big Data Professional Certification',

  courses: [
    { code: 'CSE 511', title: 'Data Processing at Scale', completed: false },
    { code: 'CSE 572', title: 'Data Mining', completed: true },
    { code: 'CSE 575', title: 'Statistical Machine Learning', completed: true },
    { code: 'CSE 578', title: 'Data Visualization', completed: true },
  ] as CertificateCourse[],
};
