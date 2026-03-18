import { db } from '@/db';
import { rateLimits } from '@/db/schema';

async function main() {
    const sampleRateLimits = [
        // 12 IPs with submission_count: 1 (casual users)
        {
            ip_address: '192.168.1.45',
            submission_count: 1,
            last_reset: new Date('2024-01-15T00:30:00').toISOString(),
        },
        {
            ip_address: '192.168.1.78',
            submission_count: 1,
            last_reset: new Date('2024-01-16T01:15:00').toISOString(),
        },
        {
            ip_address: '192.168.2.23',
            submission_count: 1,
            last_reset: new Date('2024-01-17T00:45:00').toISOString(),
        },
        {
            ip_address: '192.168.2.156',
            submission_count: 1,
            last_reset: new Date('2024-01-18T01:30:00').toISOString(),
        },
        {
            ip_address: '192.168.3.67',
            submission_count: 1,
            last_reset: new Date('2024-01-19T00:20:00').toISOString(),
        },
        {
            ip_address: '192.168.3.189',
            submission_count: 1,
            last_reset: new Date('2024-01-20T01:45:00').toISOString(),
        },
        {
            ip_address: '192.168.4.34',
            submission_count: 1,
            last_reset: new Date('2024-01-21T00:15:00').toISOString(),
        },
        {
            ip_address: '192.168.4.112',
            submission_count: 1,
            last_reset: new Date('2024-01-15T01:00:00').toISOString(),
        },
        {
            ip_address: '192.168.5.89',
            submission_count: 1,
            last_reset: new Date('2024-01-16T00:25:00').toISOString(),
        },
        {
            ip_address: '192.168.5.201',
            submission_count: 1,
            last_reset: new Date('2024-01-17T01:20:00').toISOString(),
        },
        {
            ip_address: '192.168.6.56',
            submission_count: 1,
            last_reset: new Date('2024-01-18T00:50:00').toISOString(),
        },
        {
            ip_address: '192.168.6.143',
            submission_count: 1,
            last_reset: new Date('2024-01-19T01:10:00').toISOString(),
        },
        // 5 IPs with submission_count: 2 (regular users)
        {
            ip_address: '192.168.1.123',
            submission_count: 2,
            last_reset: new Date('2024-01-20T00:35:00').toISOString(),
        },
        {
            ip_address: '192.168.2.87',
            submission_count: 2,
            last_reset: new Date('2024-01-21T01:25:00').toISOString(),
        },
        {
            ip_address: '192.168.3.145',
            submission_count: 2,
            last_reset: new Date('2024-01-16T00:40:00').toISOString(),
        },
        {
            ip_address: '192.168.4.98',
            submission_count: 2,
            last_reset: new Date('2024-01-17T01:05:00').toISOString(),
        },
        {
            ip_address: '192.168.5.167',
            submission_count: 2,
            last_reset: new Date('2024-01-18T00:30:00').toISOString(),
        },
        // 2 IPs with submission_count: 3 (active users)
        {
            ip_address: '192.168.1.234',
            submission_count: 3,
            last_reset: new Date('2024-01-19T01:55:00').toISOString(),
        },
        {
            ip_address: '192.168.2.176',
            submission_count: 3,
            last_reset: new Date('2024-01-20T00:10:00').toISOString(),
        },
        // 1 IP with submission_count: 4 (very active user)
        {
            ip_address: '192.168.3.99',
            submission_count: 4,
            last_reset: new Date('2024-01-21T01:40:00').toISOString(),
        },
    ];

    await db.insert(rateLimits).values(sampleRateLimits);
    
    console.log('✅ Rate limits seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});