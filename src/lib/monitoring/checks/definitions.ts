import type { MonitorCheckDefinition } from '../types';

export const AWS_CHECKS: MonitorCheckDefinition[] = [
  {
    id: 'aws-root-mfa',
    name: 'Root account MFA enabled',
    description: 'AWS root user must have MFA enabled.',
    controlId: 'soc2-cc6-1',
    provider: 'aws',
  },
  {
    id: 'aws-password-policy',
    name: 'IAM password policy',
    description: 'Account password policy enforces minimum length and complexity.',
    controlId: 'soc2-cc6-1',
    provider: 'aws',
  },
  {
    id: 'aws-cloudtrail',
    name: 'CloudTrail logging',
    description: 'At least one CloudTrail trail is logging in the account.',
    controlId: 'soc2-cc7-2',
    provider: 'aws',
  },
  {
    id: 'aws-s3-public',
    name: 'S3 public access',
    description: 'No S3 buckets allow public ACLs or policies.',
    controlId: 'soc2-cc6-7',
    provider: 'aws',
  },
  {
    id: 'aws-access-key-age',
    name: 'IAM access key rotation',
    description: 'No IAM user access keys older than 90 days.',
    controlId: 'cis-6',
    provider: 'aws',
  },
];

export const AZURE_CHECKS: MonitorCheckDefinition[] = [
  {
    id: 'azure-storage-public',
    name: 'Storage account public blob access',
    description: 'Storage accounts disallow public blob access.',
    controlId: 'iso-a-8-3',
    provider: 'azure',
  },
  {
    id: 'azure-mfa-admins',
    name: 'Privileged users MFA (reporting)',
    description: 'Conditional Access or MFA should protect admin roles.',
    controlId: 'soc2-cc6-1',
    provider: 'azure',
  },
  {
    id: 'azure-defender',
    name: 'Microsoft Defender for Cloud',
    description: 'Defender for Cloud standard tier enabled on subscription.',
    controlId: 'nist-de-cm',
    provider: 'azure',
  },
];
