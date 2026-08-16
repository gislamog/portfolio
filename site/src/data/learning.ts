export interface LearningItem {
  title: string;
  url?: string;
  note: string;
}

export interface LearningSection {
  id: string;
  title: string;
  items: LearningItem[];
}

export const learningSections: LearningSection[] = [
  {
    id: 'texts',
    title: 'Texts & Reading',
    items: [
      {
        title: 'Information Assurance: Managing Organizational IT Security Risks',
        url: 'https://library.uc.edu.kh/userfiles/pdf/10.Information%20Assurance.pdf',
        note: 'CSE 543 textbook (Boyce & Jennings). Useful for Defense-in-Depth model details.',
      },
      // Unpolished placeholder for recruiters.
      // {
      //   title: 'Kevin Mitnick books',
      //   note: 'Books by the convicted hacker. Social engineering and security mindset.',
      // },
      {
        title: 'Strange Attractors and TCP/IP Sequence Number Analysis',
        note: 'Michal Zalewski (AFL fuzzer author). Phase-space analysis showing many OS implementations were not truly random.',
      },
      {
        title: 'RFC 4987: TCP SYN Flooding Attacks and Common Mitigations',
        url: 'https://www.rfc-editor.org/rfc/rfc4987',
        note: 'Comprehensive reference on SYN flooding.',
      },
      {
        title: 'Weaving the Web',
        note: 'Tim Berners-Lee. Recommended reading on the original design of the World Wide Web.',
      },
      {
        title: 'OWASP XSS Prevention Cheat Sheet',
        url: 'https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html',
        note: 'Context-specific escaping rules for XSS prevention.',
      },
      // Unpolished placeholder for recruiters.
      // {
      //   title: 'Real documentation (SSH, etc.)',
      //   note: 'Read primary sources: OpenSSH docs, RFCs, and official protocol specifications.',
      // },
    ],
  },
  {
    id: 'cryptography',
    title: 'Cryptography & Attacks',
    items: [
      {
        title: 'Lest We Remember: Cold Boot Attacks on Encryption Keys',
        note: '2008 Princeton paper. Recovered AES keys from RAM dumps by freezing memory. Connects to AES/RSA coursework.',
      },
      {
        title: 'Cold-Boot Attack',
        note: 'Freeze RAM to slow capacitor decay and extract encryption keys from memory.',
      },
      {
        title: 'Glitching Attack',
        note: 'Fault injection on older devices (e.g. Xbox 360) to bypass security.',
      },
      {
        title: 'Replay Attack',
        note: 'Capture authentication traffic and replay it without knowing the password.',
      },
      {
        title: 'Rainbow Tables',
        note: 'Build a tiny rainbow table yourself to understand how precomputed hash chains work.',
      },
      // Unpolished study notes / to-dos hidden from recruiters.
      // { title: 'MD5 and other hashes', note: 'Recreate hash algorithms from scratch for deeper understanding.' },
      // { title: 'MD5 Hack', note: 'Crack MD5 or prove why it cannot be cracked under given constraints.' },
      // { title: 'Session Cookie Attack', note: 'Predict session cookies or craft fake URLs with session IDs (e.g. ?PHPSESSID=ABC123).' },
      {
        title: 'Random Number Testers',
        note: 'Frequency tests, chi-square, Diehard tests, and other randomness validation.',
      },
    ],
  },
  // Unpolished to-do list. Hidden from nav until rewritten.
  // {
  //   id: 'ml',
  //   title: 'Machine Learning',
  //   items: [
  //     { title: 'Review convolutional networks', note: 'Revisit CNNs and related deep learning architectures from graduate coursework.' },
  //   ],
  // },
  // {
  //   id: 'security-tools',
  //   title: 'Security Tools & Labs',
  //   items: [
  //     { title: 'SQLMap on localhost', url: 'https://sqlmap.org/', note: 'Crawl sites, detect injectable parameters, dump databases. Practice only on authorized targets.' },
  //     { title: 'HAC (Hack All the Things)', url: 'https://cacr.uwaterloo.ca/hac/', note: 'Security challenge platform from University of Waterloo.' },
  //   ],
  // },
  // {
  //   id: 'memory',
  //   title: 'Memory & Binary Analysis',
  //   items: [
  //     { title: 'pwn.college-style VM activities', note: 'Walk through binaries with Ghidra. Understand how code, disk, and RAM interact.' },
  //     { title: 'Reverse engineering tools', note: 'Ghidra, angr, IDA Pro, Binary Ninja, Hopper, radare2, GDB.' },
  //   ],
  // },
];
