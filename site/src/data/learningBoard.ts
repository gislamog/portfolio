/**
 * Content for the Continued Learning page, ported from the retired static
 * board (formerly public/learning/index.html, loaded in an iframe). Every
 * card here is a read-only snapshot of a private tracker kept elsewhere: see
 * PUBLISHED_STATUS below, which is the only status data this site ships.
 */

export type LearningStatus = 'todo' | 'doing' | 'almost' | 'done';

export interface StatusMeta {
  value: LearningStatus;
  label: string;
}

export const STATUSES: StatusMeta[] = [
  { value: 'todo', label: 'To do' },
  { value: 'doing', label: 'In progress' },
  { value: 'almost', label: 'Almost done' },
  { value: 'done', label: 'Done' },
];

/** CSS custom property each status's color lives on; defined in LearningPage.css. */
export const STATUS_COLOR_VAR: Record<LearningStatus, string> = {
  todo: '--s-todo',
  doing: '--s-doing',
  almost: '--s-almost',
  done: '--s-done',
};

export type LearningTag =
  | 'standout'
  | 'owned'
  | 'free'
  | 'cost'
  | 'primary'
  | 'project'
  | 'book'
  | 'paper'
  | 'rfc'
  | 'ref'
  | 'build'
  | 'research'
  | 'lab';

export interface LearningItem {
  id: string;
  name: string;
  /** Inline SVG icon key (see learningIcons.tsx), mutually exclusive with badge. */
  icon?: string;
  /** Colored letter badge (used by the reverse-engineering/network-tool cards). */
  badge?: { text: string; bg: string };
  tags: LearningTag[];
  short: string;
  desc: string;
  ties: string;
  /** External link(s); only the first is rendered. */
  links?: [label: string, href: string][];
  /** Opens this article id in the ArticleReader popup instead of linking out. */
  article?: string;
}

export interface LearningSection {
  id: string;
  title: string;
  intro: string;
  items: LearningItem[];
}

/**
 * Published snapshot of the private tracker's status for each item, taken at
 * last publish. There is no backend and no persistence on this site — every
 * id not listed here defaults to "todo".
 */
export const PUBLISHED_STATUS: Record<string, LearningStatus> = {
  'big-data': 'done',
  ghidra: 'doing',
  'local-ai': 'doing',
  portswigger: 'todo',
};

export function statusFor(id: string): LearningStatus {
  return PUBLISHED_STATUS[id] ?? 'todo';
}

export const SECTIONS: LearningSection[] = [
  {
    id: 'articles',
    title: 'Articles & experiments',
    intro:
      'Write-ups and "fun stuff I learned" — graduate-level blog posts and mini-projects. Open a card to read or draft it.',
    items: [
      {
        id: 'local-ai',
        name: 'Run your own AI locally',
        icon: 'chip',
        tags: ['project'],
        article: 'local-ai',
        short:
          'Have your own AI running entirely on your computer — no subscription, no internet. A write-up in progress.',
        ties: 'Ollama · local LLMs',
        desc: "Have your own AI running entirely on your computer, without paying a subscription or needing internet access. A research-blog draft on running open-weight models with Ollama. Click to open the article.",
      },
      {
        id: 'mcs-portfolio',
        name: 'MCS Portfolio',
        icon: 'paper',
        tags: ['project'],
        article: 'mcs-portfolio',
        short:
          'The degree-completion portfolio for my M.S. in Computer Science: two graduate ML papers, from requirements through results.',
        ties: 'CSE 571 · CSE 575',
        desc: 'The degree-completion artifact for my M.S. in Computer Science at Arizona State University: an unsupervised clustering study from CSE 575 and a supervised collision-prediction network from CSE 571, written up as IEEE-style papers. Click to open.',
      },
    ],
  },
  {
    id: 'certs',
    title: 'Certifications',
    intro: 'Hover a card for the full description.',
    items: [
      {
        id: 'big-data',
        name: 'ASU — Big Data Graduate Certificate',
        icon: 'db',
        tags: [],
        article: 'big-data-cert',
        short:
          'ASU graduate certificate in big data: data processing, mining, machine learning and visualization.',
        ties: 'CSE 572 · CSE 575 · CSE 578',
        desc: "Arizona State University's Big Data graduate certificate. Covers data processing, data mining, machine learning and visualization. Click for the courses, dates, and the certificate itself.",
      },
      {
        id: 'pwn-blue',
        name: 'pwn.college — Blue Belt',
        icon: 'shield',
        tags: ['standout'],
        short: "ASU's free dojo. Earn belts (orange → yellow → blue) clearing the core exploitation dojos.",
        ties: 'Binary · CSE 545',
        desc: "ASU's own free hacking dojo. Earn belts by clearing the core dojos: orange (intro), yellow (program security — shellcode, reversing, memory errors), up to the blue belt (software exploitation — ROP, format strings, file-struct attacks). The respected free achievement in binary exploitation, and it's ASU.",
        links: [['pwn.college', 'https://pwn.college/']],
      },
      {
        id: 'portswigger',
        name: 'PortSwigger Web Security Academy',
        icon: 'web',
        tags: ['standout'],
        short: 'Free hands-on labs on SQLi, XSS and session handling, from the makers of Burp Suite.',
        ties: 'Web · SER 335',
        desc: 'Free, hands-on labs on SQL injection, XSS, session handling and more, from the makers of Burp Suite. Not a proctored cert, but completion is well recognized; the paid Burp Suite Certified Practitioner builds on it.',
        links: [['Academy', 'https://portswigger.net/web-security']],
      },
      {
        id: 'cisco-ceh',
        name: 'Cisco — Ethical Hacker',
        icon: 'bug',
        tags: [],
        short: 'Free Networking Academy pen-testing course; pass the final exam for the badge.',
        ties: 'CSE 545, 548',
        desc: 'Free course on Cisco Networking Academy covering pen-testing fundamentals. Pass the final exam for the badge; the full certificate also needs a Capture-the-Flag on Cisco U. at 70%+.',
        links: [['Course', 'https://www.netacad.com/courses/ethical-hacker']],
      },
      {
        id: 'fortinet-fca',
        name: 'Fortinet FCA in Cybersecurity',
        icon: 'shield',
        tags: [],
        short: 'Free training and exam on network-security and threat fundamentals.',
        ties: 'CSE 548, 543',
        desc: 'Free training and exam from the Fortinet Training Institute. Fundamentals of threats, network security and the Fortinet security fabric.',
        links: [['Fortinet', 'https://training.fortinet.com/']],
      },
      {
        id: 'cisco-jr',
        name: 'Cisco — Jr. Cybersecurity Analyst',
        icon: 'monitor',
        tags: [],
        short: 'Free defensive-fundamentals career path with digital badges.',
        ties: 'CSE 543',
        desc: 'Free Networking Academy career path on defensive fundamentals: endpoint security, network defense, threat response. Earns digital badges.',
        links: [['Netacad', 'https://www.netacad.com/']],
      },
      {
        id: 'qualys',
        name: 'Qualys Certifications',
        icon: 'scan',
        tags: [],
        short: 'Free training and labs in vulnerability management (verify the exam terms).',
        ties: 'Vuln scanning',
        desc: 'Free self-paced training with labs and certification across Qualys products (vulnerability management, scanning, patch). Verify the exam terms on their site — sources were thin on whether every exam is free.',
        links: [['Qualys', 'https://www.qualys.com/training/']],
      },
    ],
  },
  {
    id: 'reading',
    title: 'Books & papers',
    intro:
      'Textbooks, papers, RFCs and real documentation to work through. Prefer the primary source. Cards tagged "owned" are ones you already have.',
    items: [
      {
        id: 'gof-patterns',
        name: 'Design Patterns (Gang of Four)',
        icon: 'book',
        tags: ['owned'],
        short: 'The 23 classic OO design patterns. You own it — a good reread to sharpen architecture.',
        ties: 'SER 460, 315',
        desc: 'Gamma, Helm, Johnson & Vlissides — Design Patterns: Elements of Reusable Object-Oriented Software. The 23 classic patterns. You already own it; a good reread to sharpen architecture instincts.',
        links: [],
      },
      {
        id: 'principles-prog',
        name: 'Principles of Programming',
        icon: 'book',
        tags: ['owned'],
        short: "A textbook you own. Send the exact title/author and I'll fix this card.",
        ties: '',
        desc: "A textbook you already own. Tell me the exact title and author and I'll correct this and add why it's worth revisiting.",
        links: [],
      },
      {
        id: 'ia-boyce',
        name: 'Information Assurance (Boyce & Jennings)',
        icon: 'paper',
        tags: ['book'],
        short: 'The CSE 543 textbook; the deep version of Defense-in-Depth.',
        ties: 'CSE 543',
        desc: 'The CSE 543 textbook. Read it for a deeper treatment of the Defense-in-Depth model than the lecture slides.',
        links: [['PDF', 'https://library.uc.edu.kh/userfiles/pdf/10.Information%20Assurance.pdf']],
      },
      {
        id: 'hac',
        name: 'Handbook of Applied Cryptography',
        icon: 'book',
        tags: ['book', 'free'],
        short: 'Free online. The reference for your crypto projects below.',
        ties: 'CSE 539',
        desc: 'Menezes, van Oorschot & Vanstone. The reference for the crypto you studied; free online. Pull from it for the MD5, rainbow-table and RNG projects.',
        links: [['hac', 'https://cacr.uwaterloo.ca/hac/']],
      },
      {
        id: 'coldboot',
        name: '"Lest We Remember" — Cold Boot Attacks',
        icon: 'paper',
        tags: ['paper', 'free'],
        short: '2008 Princeton paper: freeze RAM, dump it, recover AES keys.',
        ties: 'CSE 539',
        desc: 'Halderman et al., USENIX Security 2008. Freeze RAM so capacitors decay slowly, reboot, dump memory and recover AES keys. The paper shows the actual recovered keys.',
        links: [['Paper', 'https://citp.princeton.edu/our-work/memory/']],
      },
      {
        id: 'zalewski',
        name: 'Strange Attractors & TCP/IP Seq. Numbers',
        icon: 'net',
        tags: ['paper', 'free'],
        short: "AFL author's phase-space look at weak TCP sequence numbers.",
        ties: 'RNG',
        desc: 'Michal Zalewski (author of AFL). Uses phase-space analysis to show many OS TCP initial-sequence-number generators still weren\'t truly random.',
        links: [['Site', 'https://lcamtuf.coredump.cx/newtcp/']],
      },
      {
        id: 'mitnick',
        name: 'Kevin Mitnick — books',
        icon: 'book',
        tags: ['book'],
        short: 'Ghost in the Wires & more — first-hand social engineering.',
        ties: 'Social eng.',
        desc: 'Ghost in the Wires, The Art of Deception, The Art of Intrusion. First-hand social engineering and intrusion stories from the convicted hacker.',
        links: [],
      },
      {
        id: 'weaving-web',
        name: 'Weaving the Web — Berners-Lee',
        icon: 'web',
        tags: ['book'],
        short: "The Web's design and intent, from its inventor.",
        ties: '',
        desc: 'The original design and intended destiny of the World Wide Web, from its inventor.',
        links: [],
      },
      {
        id: 'rfc4987',
        name: 'RFC 4987 — TCP SYN Flooding',
        icon: 'net',
        tags: ['rfc', 'free'],
        short: 'The reference on SYN-flood attacks and their defenses.',
        ties: 'CSE 548',
        desc: "The comprehensive reference on SYN-flood attacks and how they're defended. Read real protocol documentation.",
        links: [['RFC', 'https://www.rfc-editor.org/rfc/rfc4987']],
      },
      {
        id: 'owasp-xss',
        name: 'OWASP XSS Prevention Cheat Sheet',
        icon: 'ref',
        tags: ['ref', 'free'],
        short: 'Context-specific output-escaping rules for XSS.',
        ties: 'Web',
        desc: 'The reference for context-specific output-escaping rules. Pair it with the PortSwigger XSS labs.',
        links: [
          [
            'Cheat Sheet',
            'https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html',
          ],
        ],
      },
      {
        id: 'ssh-rfcs',
        name: 'SSH protocol — RFCs 4251-4254',
        icon: 'paper',
        tags: ['rfc', 'free'],
        short: 'Read the real SSH spec: transport, auth, connection layers.',
        ties: '',
        desc: 'Read the real spec for a protocol you use daily: architecture, transport, authentication and connection layers.',
        links: [['RFC 4251', 'https://www.rfc-editor.org/rfc/rfc4251']],
      },
    ],
  },
  {
    id: 'crypto',
    title: 'Cryptography projects',
    intro:
      'Small build-it-and-break-it projects. Build from scratch, then validate against a reference. Run every attack only against localhost, your own VMs, or hardware you own.',
    items: [
      {
        id: 'rainbow',
        name: 'Build a tiny rainbow table',
        icon: 'chain',
        tags: ['build'],
        short: 'Build chains + a reduction function on a small keyspace.',
        ties: 'CSE 539 · HAC',
        desc: 'Implement chains and a reduction function on a small keyspace so the time-memory trade-off is concrete. The only way to really understand them is to make one.',
        links: [],
      },
      {
        id: 'md5-scratch',
        name: 'Implement MD5 from scratch',
        icon: 'hash',
        tags: ['build'],
        short: 'Implement MD5 yourself; check against test vectors.',
        ties: 'CSE 539',
        desc: 'Recreate the algorithm yourself and validate against published test vectors. Do the same later for SHA-1/SHA-256.',
        links: [],
      },
      {
        id: 'md5-crack',
        name: "Crack MD5 — or show where you can't",
        icon: 'crack',
        tags: ['research'],
        short: "Crack MD5, then show collisions are cheap, preimages aren't.",
        ties: 'CSE 539',
        desc: 'Explore brute force and dictionary cracking, then the real point: collisions are cheap, preimages are not. Demonstrate a known collision.',
        links: [],
      },
      {
        id: 'rng-tests',
        name: 'Randomness testers',
        icon: 'dice',
        tags: ['build'],
        short: 'Frequency, chi-square, Diehard tests on real generators.',
        ties: 'Pairs w/ Zalewski',
        desc: 'Write frequency, chi-square and Diehard-style tests and run them on different generators. Pairs with the Zalewski paper.',
        links: [],
      },
      {
        id: 'coldboot-study',
        name: 'Cold-boot key recovery (study)',
        icon: 'snow',
        tags: ['research'],
        short: 'Reproduce AES-key recovery from a decaying RAM image.',
        ties: 'Cold-boot paper',
        desc: "Work through the cold-boot paper's method and reproduce the reasoning for recovering an AES key schedule from a decaying RAM image. Hardware experiments only on your own machine.",
        links: [],
      },
      {
        id: 'session-attack',
        name: 'Session cookie prediction / fixation',
        icon: 'cookie',
        tags: ['lab'],
        short: 'Predict/fixate a session id on a local vulnerable app.',
        ties: 'Localhost only',
        desc: 'On a local vulnerable app (old Joomla, DVWA), predict a weak session id or fix a session via a crafted URL carrying the id. Localhost only.',
        links: [],
      },
      {
        id: 'replay',
        name: 'Replay attack demo',
        icon: 'replay',
        tags: ['lab'],
        short: 'Capture and replay auth traffic on an isolated lab.',
        ties: 'Lab network',
        desc: 'Capture authentication traffic on an isolated lab network and replay it without knowing the password; then add a nonce/timestamp defense and show it fails.',
        links: [],
      },
      {
        id: 'sqlmap',
        name: 'SQLMap against a local site',
        icon: 'db',
        tags: ['lab'],
        short: 'Point SQLMap at local DVWA; watch it find and dump.',
        ties: 'SER 322 · CSE 545',
        desc: 'Point SQLMap at a local DVWA / Juice Shop and watch it crawl, find an injectable parameter, pick a technique and dump a table — then read how each step works.',
        links: [],
      },
    ],
  },
  {
    id: 're',
    title: 'Reverse engineering tools',
    intro:
      'The tools you learned but never fully understood. The plan: write a small C++ or Go program, compile it, then use these to see exactly what happens in memory and registers. Watch an intro series for each, then run it on your own binary.',
    items: [
      {
        id: 'ghidra',
        name: 'Ghidra',
        badge: { text: 'G', bg: '#b23b2e' },
        tags: ['free', 'primary'],
        short: 'Open your own compiled C++/Go and match the decompiler to source. Start here.',
        ties: 'First project below',
        desc: 'Compile a tiny C++/Go program, open it in Ghidra, and match the decompiler output back to your source line by line. First project: a 30-line program with a loop and a struct; strip symbols and re-derive what it does. Watch: an intro Ghidra series.',
        links: [['Ghidra', 'https://ghidra-sre.org/']],
      },
      {
        id: 'gdb',
        name: 'GDB',
        badge: { text: 'gdb', bg: '#5b6b7a' },
        tags: ['free', 'primary'],
        short: 'Step the same binary: breakpoints, registers, stack, heap. Start here.',
        ties: 'See RAM & registers',
        desc: 'Step through that same program: breakpoints, watchpoints, and inspecting registers, the stack and the heap as values change. First project: break on the loop, watch a variable, read the stack frame at each call. Watch: a GDB + pwndbg walkthrough.',
        links: [['GDB', 'https://www.sourceware.org/gdb/']],
      },
      {
        id: 'radare2',
        name: 'radare2',
        badge: { text: 'r2', bg: '#2d8a46' },
        tags: ['free'],
        short: 'CLI reverse engineering on the same binary.',
        ties: 'Terminal RE',
        desc: 'CLI reverse engineering on the same binary — disassembly, graphs and patching from the terminal.',
        links: [['radare2', 'https://rada.re/n/']],
      },
      {
        id: 'angr',
        name: 'angr',
        badge: { text: 'a', bg: '#7a4fb5' },
        tags: ['free'],
        short: 'Symbolic execution to auto-solve a tiny crackme you wrote.',
        ties: 'Symbolic exec',
        desc: 'Symbolic execution in Python. Use it to auto-solve a tiny crackme you wrote (find the input that reaches the "win" branch).',
        links: [['angr', 'https://angr.io/']],
      },
      {
        id: 'ida-free',
        name: 'IDA Free',
        badge: { text: 'IDA', bg: '#2f6fb0' },
        tags: ['free'],
        short: "Free IDA; compare its view with Ghidra's.",
        ties: 'Compare views',
        desc: "The free edition of the classic disassembler. Open your binary here and compare its view with Ghidra's.",
        links: [['IDA Free', 'https://hex-rays.com/ida-free']],
      },
      {
        id: 'binja',
        name: 'Binary Ninja',
        badge: { text: 'BN', bg: '#1f9790' },
        tags: ['cost'],
        short: 'Modern IL-based disassembler; free cloud tier + trial.',
        ties: 'Strong IL',
        desc: "Modern disassembler with a strong IL. A free cloud tier and a trial exist; compare its intermediate language to Ghidra's decompilation.",
        links: [['Binary Ninja', 'https://binary.ninja/']],
      },
      {
        id: 'hopper',
        name: 'Hopper',
        badge: { text: 'H', bg: '#d08224' },
        tags: ['cost'],
        short: 'Lightweight Linux/macOS disassembler with a trial.',
        ties: 'Quick look',
        desc: 'Lightweight Linux/macOS disassembler with a trial. Good for a quick look at the same binary from another angle.',
        links: [['Hopper', 'https://www.hopperapp.com/']],
      },
    ],
  },
  {
    id: 'net',
    title: 'Web & network tools',
    intro:
      'Tools for watching and attacking traffic rather than binaries. Burp and ZAP sit between your browser and a website; Wireshark and Nmap work on the network itself. Point them only at localhost, your own VMs, or lab targets like DVWA and the PortSwigger labs.',
    items: [
      {
        id: 'burp',
        name: 'Burp Suite Community',
        badge: { text: 'B', bg: '#e8622b' },
        tags: ['free', 'primary'],
        short: 'Intercepting proxy: see, edit and replay every HTTP(S) request. Start here.',
        ties: 'PortSwigger labs · Web',
        desc: 'An intercepting proxy between your browser and a website. Inspect and modify requests, replay them in Repeater, and fuzz parameters in Intruder. Every PortSwigger Web Security Academy lab is built to be solved with it; the free Community edition is enough for those.',
        links: [['Burp Suite', 'https://portswigger.net/burp/communitydownload']],
      },
      {
        id: 'zap',
        name: 'OWASP ZAP',
        badge: { text: 'ZAP', bg: '#00549e' },
        tags: ['free'],
        short: 'Open-source alternative to Burp, with a free automated scanner.',
        ties: 'Burp alternative',
        desc: "Open-source intercepting proxy and web scanner. Run it against the same lab target as Burp and compare what each one finds; its active scanner is free where Burp's is paid.",
        links: [['ZAP', 'https://www.zaproxy.org/']],
      },
      {
        id: 'wireshark',
        name: 'Wireshark',
        badge: { text: 'W', bg: '#1679c4' },
        tags: ['free', 'primary'],
        short: 'Real packet capture: watch every protocol on an interface. Start here.',
        ties: 'CSE 548 · packets',
        desc: 'Captures and decodes every packet on a network interface. Watch a TCP handshake, a DNS lookup and a TLS negotiation; then capture a SYN flood on a lab network to see RFC 4987 in practice.',
        links: [['Wireshark', 'https://www.wireshark.org/']],
      },
      {
        id: 'nmap',
        name: 'Nmap',
        badge: { text: 'nm', bg: '#4a5866' },
        tags: ['free'],
        short: 'Port and service scanning; watch its probes in Wireshark.',
        ties: 'Recon',
        desc: 'Port, service and OS detection. Scan your own VM, then run Wireshark alongside to see exactly what a SYN scan or a version probe sends.',
        links: [['Nmap', 'https://nmap.org/']],
      },
    ],
  },
];

export function doneCount(section: LearningSection): number {
  return section.items.filter((it) => statusFor(it.id) === 'done').length;
}
