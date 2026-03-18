import { db } from '@/db';
import { bannedWords } from '@/db/schema';

async function main() {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const getRandomDateInLast30Days = (dayOffset: number) => {
        const date = new Date(thirtyDaysAgo.getTime() + dayOffset * 24 * 60 * 60 * 1000);
        return date.toISOString();
    };

    const sampleBannedWords = [
        // Profanity words (5)
        {
            word: 'anjing',
            createdAt: getRandomDateInLast30Days(1),
        },
        {
            word: 'babi',
            createdAt: getRandomDateInLast30Days(2),
        },
        {
            word: 'kontol',
            createdAt: getRandomDateInLast30Days(3),
        },
        {
            word: 'bangsat',
            createdAt: getRandomDateInLast30Days(5),
        },
        {
            word: 'tai',
            createdAt: getRandomDateInLast30Days(7),
        },
        
        // Bullying-related terms (3)
        {
            word: 'tolol',
            createdAt: getRandomDateInLast30Days(10),
        },
        {
            word: 'goblok',
            createdAt: getRandomDateInLast30Days(12),
        },
        {
            word: 'bodoh',
            createdAt: getRandomDateInLast30Days(15),
        },
        
        // Hate speech terms (4)
        {
            word: 'kafir',
            createdAt: getRandomDateInLast30Days(18),
        },
        {
            word: 'cina',
            createdAt: getRandomDateInLast30Days(20),
        },
        {
            word: 'pribumi',
            createdAt: getRandomDateInLast30Days(22),
        },
        {
            word: 'antek',
            createdAt: getRandomDateInLast30Days(24),
        },
        
        // Inappropriate slang terms (3)
        {
            word: 'jancok',
            createdAt: getRandomDateInLast30Days(26),
        },
        {
            word: 'memek',
            createdAt: getRandomDateInLast30Days(28),
        },
        {
            word: 'kampret',
            createdAt: getRandomDateInLast30Days(29),
        },
    ];

    await db.insert(bannedWords).values(sampleBannedWords);
    
    console.log('✅ Banned words seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});