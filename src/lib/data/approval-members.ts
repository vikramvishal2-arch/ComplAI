/** Default dummy approvers seeded for policy approval workflows. */
export interface ApprovalMemberSeed {
  name: string;
  email: string;
  title: string;
  department: string;
  /** Maps to approval matrix step ids: author, reviewer, isms-owner, legal, executive */
  approvalRoles: string[];
}

export const DEFAULT_APPROVAL_MEMBERS: ApprovalMemberSeed[] = [
  {
    name: 'Priya Sharma',
    email: 'priya.sharma@complai.demo',
    title: 'Information Security Specialist',
    department: 'Information Security',
    approvalRoles: ['author'],
  },
  {
    name: 'James Chen',
    email: 'james.chen@complai.demo',
    title: 'GRC Lead',
    department: 'Compliance',
    approvalRoles: ['reviewer'],
  },
  {
    name: 'Michael Torres',
    email: 'michael.torres@complai.demo',
    title: 'Chief Information Security Officer',
    department: 'Information Security',
    approvalRoles: ['isms-owner'],
  },
  {
    name: 'Elena Vargas',
    email: 'elena.vargas@complai.demo',
    title: 'General Counsel',
    department: 'Legal',
    approvalRoles: ['legal'],
  },
  {
    name: 'David Kim',
    email: 'david.kim@complai.demo',
    title: 'VP Operations',
    department: 'Executive',
    approvalRoles: ['executive'],
  },
  {
    name: 'Sandra Okafor',
    email: 'sandra.okafor@complai.demo',
    title: 'Compliance Manager',
    department: 'Compliance',
    approvalRoles: ['reviewer', 'legal'],
  },
  {
    name: 'Tom Hughes',
    email: 'tom.hughes@complai.demo',
    title: 'IT Director',
    department: 'Technology',
    approvalRoles: ['author', 'reviewer'],
  },
  {
    name: 'Anita Patel',
    email: 'anita.patel@complai.demo',
    title: 'Data Protection Officer',
    department: 'Privacy',
    approvalRoles: ['legal'],
  },
  {
    name: 'Robert Flynn',
    email: 'robert.flynn@complai.demo',
    title: 'Chief Executive Officer',
    department: 'Executive',
    approvalRoles: ['executive'],
  },
  {
    name: 'Rachel Adams',
    email: 'rachel.adams@complai.demo',
    title: 'ISMS Coordinator',
    department: 'Information Security',
    approvalRoles: ['author', 'reviewer', 'isms-owner'],
  },
];
