export type ThreatStatus = 'malicious' | 'clean' | 'unknown';

export type ThreatCategory = 'botnet' | 'c2' | 'phishing' | 'malware' | 'spam' | 'other';

export interface ThreatCheckRequest {
  ip?: string;
  url?: string;
  domain?: string;
}

export interface ThreatCheckResult {
  ip?: string;
  url?: string;
  domain?: string;
  status: ThreatStatus;
  blacklisted: boolean;
  category?: ThreatCategory;
  confidence: number;
  source_feed?: string;
  checked_at: string;
  cache_hit?: boolean;
}

export interface BulkCheckRequest {
  items: ThreatCheckRequest[];
}

export interface BulkCheckResponse {
  results: ThreatCheckResult[];
  checked_at: string;
}

export interface FeedSyncResponse {
  since: string;
  synced_at: string;
  added: number;
  updated: number;
  removed: number;
  iocs: Array<{
    ioc_type: string;
    value: string;
    category: string;
    blacklisted: boolean;
    confidence: number;
    source_feed: string;
    updated_at: string;
  }>;
}

export interface TrafficInspectionPayload {
  circuit_id: string;
  src_ip: string;
  dest_ip?: string;
  url?: string;
  domain?: string;
  direction?: 'inbound' | 'outbound';
}

export interface PolicyDecision {
  circuit_id: string;
  src_ip: string;
  dest_ip?: string;
  url?: string;
  domain?: string;
  verdict: 'allow' | 'block';
  reason: string;
  threat?: ThreatCheckResult;
  cache_hit: boolean;
  fail_mode: 'fail_open' | 'fail_closed';
  checked_at: string;
}

export interface GatewayContext {
  requestId: string;
  clientId?: string;
  startTime: number;
}
