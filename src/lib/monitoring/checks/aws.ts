import 'server-only';
import {
  CloudTrailClient,
  DescribeTrailsCommand,
  GetTrailStatusCommand,
} from '@aws-sdk/client-cloudtrail';
import { IAMClient, GetAccountPasswordPolicyCommand, GetAccountSummaryCommand, ListUsersCommand, ListAccessKeysCommand } from '@aws-sdk/client-iam';
import { S3Client, ListBucketsCommand, GetPublicAccessBlockCommand, GetBucketPolicyStatusCommand } from '@aws-sdk/client-s3';
import { getAwsMonitorConfig } from '../config';
import type { MonitorCheckOutcome } from '../types';
import { AWS_CHECKS } from './definitions';

function awsClients() {
  const { region } = getAwsMonitorConfig();
  const credentials = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  };
  return {
    iam: new IAMClient({ region, credentials }),
    s3: new S3Client({ region, credentials }),
    cloudtrail: new CloudTrailClient({ region, credentials }),
  };
}

export async function runAwsChecks(): Promise<MonitorCheckOutcome[]> {
  const config = getAwsMonitorConfig();
  if (!config.configured) {
    throw new Error('AWS monitoring not configured. Set AWS_MONITOR_ENABLED=true and credentials in .env');
  }

  const { iam, s3, cloudtrail } = awsClients();
  const outcomes: MonitorCheckOutcome[] = [];

  for (const check of AWS_CHECKS) {
    try {
      outcomes.push(await runSingleAwsCheck(check.id, { iam, s3, cloudtrail }));
    } catch (err) {
      outcomes.push({
        checkId: check.id,
        checkName: check.name,
        controlId: check.controlId,
        status: 'error',
        message: err instanceof Error ? err.message : 'Check failed',
        remediation: 'Verify IAM permissions for the monitoring role.',
      });
    }
  }

  return outcomes;
}

async function runSingleAwsCheck(
  checkId: string,
  clients: {
    iam: IAMClient;
    s3: S3Client;
    cloudtrail: CloudTrailClient;
  }
): Promise<MonitorCheckOutcome> {
  const def = AWS_CHECKS.find((c) => c.id === checkId)!;

  switch (checkId) {
    case 'aws-root-mfa': {
      const summary = await clients.iam.send(new GetAccountSummaryCommand({}));
      const enabled = summary.SummaryMap?.AccountMFAEnabled === 1;
      return {
        checkId,
        checkName: def.name,
        controlId: def.controlId,
        status: enabled ? 'pass' : 'fail',
        message: enabled ? 'Root MFA is enabled.' : 'Root account does not have MFA enabled.',
        remediation: 'Enable hardware or virtual MFA on the AWS root account immediately.',
      };
    }
    case 'aws-password-policy': {
      try {
        const policy = await clients.iam.send(new GetAccountPasswordPolicyCommand({}));
        const p = policy.PasswordPolicy;
        const ok =
          (p?.MinimumPasswordLength ?? 0) >= 12 &&
          p?.RequireSymbols &&
          p?.RequireNumbers &&
          p?.RequireUppercaseCharacters;
        return {
          checkId,
          checkName: def.name,
          controlId: def.controlId,
          status: ok ? 'pass' : 'fail',
          message: ok
            ? 'Password policy meets minimum requirements.'
            : 'Password policy missing length ≥12 or complexity requirements.',
          remediation: 'Update IAM account password policy to require 12+ chars and complexity.',
        };
      } catch {
        return {
          checkId,
          checkName: def.name,
          controlId: def.controlId,
          status: 'fail',
          message: 'No IAM account password policy configured.',
          remediation: 'Create an IAM password policy with minimum length and complexity.',
        };
      }
    }
    case 'aws-cloudtrail': {
      const trails = await clients.cloudtrail.send(new DescribeTrailsCommand({}));
      if (!trails.trailList?.length) {
        return {
          checkId,
          checkName: def.name,
          controlId: def.controlId,
          status: 'fail',
          message: 'No CloudTrail trails found.',
          remediation: 'Enable CloudTrail in all regions with log file validation.',
        };
      }
      let logging = false;
      for (const trail of trails.trailList) {
        if (!trail.Name) continue;
        const status = await clients.cloudtrail.send(
          new GetTrailStatusCommand({ Name: trail.Name })
        );
        if (status.IsLogging) {
          logging = true;
          break;
        }
      }
      return {
        checkId,
        checkName: def.name,
        controlId: def.controlId,
        status: logging ? 'pass' : 'fail',
        message: logging ? 'CloudTrail is actively logging.' : 'CloudTrail trails exist but none are logging.',
        remediation: 'Start CloudTrail logging and enable multi-region trail.',
      };
    }
    case 'aws-s3-public': {
      const buckets = await clients.s3.send(new ListBucketsCommand({}));
      const publicBuckets: string[] = [];
      for (const bucket of buckets.Buckets ?? []) {
        if (!bucket.Name) continue;
        try {
          const block = await clients.s3.send(
            new GetPublicAccessBlockCommand({ Bucket: bucket.Name })
          );
          const cfg = block.PublicAccessBlockConfiguration;
          const blocked =
            cfg?.BlockPublicAcls &&
            cfg?.BlockPublicPolicy &&
            cfg?.IgnorePublicAcls &&
            cfg?.RestrictPublicBuckets;
          if (!blocked) publicBuckets.push(bucket.Name);
        } catch {
          try {
            const policyStatus = await clients.s3.send(
              new GetBucketPolicyStatusCommand({ Bucket: bucket.Name })
            );
            if (policyStatus.PolicyStatus?.IsPublic) publicBuckets.push(bucket.Name);
          } catch {
            // skip buckets we cannot read
          }
        }
      }
      return {
        checkId,
        checkName: def.name,
        controlId: def.controlId,
        status: publicBuckets.length === 0 ? 'pass' : 'fail',
        message:
          publicBuckets.length === 0
            ? 'No publicly accessible S3 buckets detected.'
            : `Public or unblocked buckets: ${publicBuckets.slice(0, 5).join(', ')}${publicBuckets.length > 5 ? '…' : ''}`,
        remediation: 'Enable S3 Block Public Access on all buckets and review bucket policies.',
      };
    }
    case 'aws-access-key-age': {
      const users = await clients.iam.send(new ListUsersCommand({}));
      const stale: string[] = [];
      const maxAgeMs = 90 * 24 * 60 * 60 * 1000;
      const now = Date.now();
      for (const user of users.Users ?? []) {
        for (const key of user.PasswordLastUsed ? [] : []) {
          void key;
        }
        const keys = await clients.iam.send(
          new ListAccessKeysCommand({ UserName: user.UserName })
        );
        for (const ak of keys.AccessKeyMetadata ?? []) {
          if (ak.CreateDate && now - ak.CreateDate.getTime() > maxAgeMs) {
            stale.push(`${user.UserName}:${ak.AccessKeyId}`);
          }
        }
      }
      return {
        checkId,
        checkName: def.name,
        controlId: def.controlId,
        status: stale.length === 0 ? 'pass' : 'fail',
        message:
          stale.length === 0
            ? 'No IAM access keys older than 90 days.'
            : `Stale access keys: ${stale.slice(0, 5).join(', ')}`,
        remediation: 'Rotate or remove IAM access keys older than 90 days.',
      };
    }
    default:
      return {
        checkId,
        checkName: def.name,
        controlId: def.controlId,
        status: 'skipped',
        message: 'Unknown check',
        remediation: '',
      };
  }
}
