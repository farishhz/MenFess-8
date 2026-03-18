import { db } from '@/db';
import { comments } from '@/db/schema';

async function main() {
    const sampleComments = [
        // Comments for menfess_id 1 (popular post)
        {
            menfessId: 1,
            content: 'Semangat kak! Gue juga pernah ngalamin hal yang sama, pasti bisa kok!',
            anonymousBadge: 'Anon #051',
            createdAt: new Date('2024-12-05T10:30:00').toISOString(),
            parentCommentId: null,
        },
        {
            menfessId: 1,
            content: 'Stay strong! Everything will be fine eventually 💪',
            anonymousBadge: 'Anon #052',
            createdAt: new Date('2024-12-05T11:15:00').toISOString(),
            parentCommentId: null,
        },
        {
            menfessId: 1,
            content: 'Thanks! Gue butuh support kayak gini 🥺',
            anonymousBadge: 'Anon #053',
            createdAt: new Date('2024-12-05T12:00:00').toISOString(),
            parentCommentId: 1,
        },
        {
            menfessId: 1,
            content: 'Coba deh lu langsung ngomong aja ke orangnya, daripada nyesel kemudian',
            anonymousBadge: 'Anon #054',
            createdAt: new Date('2024-12-05T14:20:00').toISOString(),
            parentCommentId: null,
        },
        {
            menfessId: 1,
            content: 'Setuju banget! Gue juga ngerasa gitu',
            anonymousBadge: 'Anon #055',
            createdAt: new Date('2024-12-06T09:00:00').toISOString(),
            parentCommentId: null,
        },

        // Comments for menfess_id 2
        {
            menfessId: 2,
            content: 'Gue support lu! Go confess your feelings!',
            anonymousBadge: 'Anon #056',
            createdAt: new Date('2024-12-05T11:00:00').toISOString(),
            parentCommentId: null,
        },
        {
            menfessId: 2,
            content: 'Tapi takut ditolak gimana dong?',
            anonymousBadge: 'Anon #057',
            createdAt: new Date('2024-12-05T12:30:00').toISOString(),
            parentCommentId: 6,
        },
        {
            menfessId: 2,
            content: 'Crush lu kelas berapa emangnya?',
            anonymousBadge: 'Anon #058',
            createdAt: new Date('2024-12-05T15:00:00').toISOString(),
            parentCommentId: null,
        },
        {
            menfessId: 2,
            content: 'Communication is key! Jelasin baik-baik pasti mereka ngerti kok',
            anonymousBadge: 'Anon #059',
            createdAt: new Date('2024-12-06T10:00:00').toISOString(),
            parentCommentId: null,
        },

        // Comments for menfess_id 3
        {
            menfessId: 3,
            content: 'Wkwkwk gue juga notice guru matematika mirip Mr Bean 😂',
            anonymousBadge: 'Anon #060',
            createdAt: new Date('2024-12-05T12:00:00').toISOString(),
            parentCommentId: null,
        },
        {
            menfessId: 3,
            content: 'HAHAHAHA this is so accurate',
            anonymousBadge: 'Anon #061',
            createdAt: new Date('2024-12-05T13:30:00').toISOString(),
            parentCommentId: null,
        },
        {
            menfessId: 3,
            content: 'Bener sih, cara jelasinnya terlalu cepet',
            anonymousBadge: 'Anon #062',
            createdAt: new Date('2024-12-05T16:00:00').toISOString(),
            parentCommentId: 10,
        },
        {
            menfessId: 3,
            content: 'Relatable banget anjir, gue juga sering gitu',
            anonymousBadge: 'Anon #063',
            createdAt: new Date('2024-12-06T11:00:00').toISOString(),
            parentCommentId: null,
        },

        // Comments for menfess_id 4
        {
            menfessId: 4,
            content: 'Emang tugas B.Indo yang mana ya? Gue juga bingung nih',
            anonymousBadge: 'Anon #064',
            createdAt: new Date('2024-12-05T13:00:00').toISOString(),
            parentCommentId: null,
        },
        {
            menfessId: 4,
            content: 'Yang tentang hikayat di buku halaman 45',
            anonymousBadge: 'Anon #065',
            createdAt: new Date('2024-12-05T14:00:00').toISOString(),
            parentCommentId: 14,
        },
        {
            menfessId: 4,
            content: 'Deadline kapan sih ini?',
            anonymousBadge: 'Anon #066',
            createdAt: new Date('2024-12-06T08:00:00').toISOString(),
            parentCommentId: null,
        },

        // Comments for menfess_id 5
        {
            menfessId: 5,
            content: 'TRUE! Finally ada yang ngomong',
            anonymousBadge: 'Anon #067',
            createdAt: new Date('2024-12-05T14:00:00').toISOString(),
            parentCommentId: null,
        },
        {
            menfessId: 5,
            content: 'Same thoughts here!',
            anonymousBadge: 'Anon #068',
            createdAt: new Date('2024-12-05T15:30:00').toISOString(),
            parentCommentId: null,
        },
        {
            menfessId: 5,
            content: 'Mungkin lu perlu istirahat dulu, jangan dipaksain nanti sakit',
            anonymousBadge: 'Anon #069',
            createdAt: new Date('2024-12-06T09:30:00').toISOString(),
            parentCommentId: null,
        },

        // Comments for menfess_id 6
        {
            menfessId: 6,
            content: 'Kapan terakhir kali lu ngobrol sama dia?',
            anonymousBadge: 'Anon #070',
            createdAt: new Date('2024-12-05T16:00:00').toISOString(),
            parentCommentId: null,
        },
        {
            menfessId: 6,
            content: 'Udah seminggu lebih ga ngobrol 😭',
            anonymousBadge: 'Anon #071',
            createdAt: new Date('2024-12-05T17:00:00').toISOString(),
            parentCommentId: 20,
        },
        {
            menfessId: 6,
            content: 'Coba lu yang duluan chat aja deh',
            anonymousBadge: 'Anon #072',
            createdAt: new Date('2024-12-06T10:30:00').toISOString(),
            parentCommentId: null,
        },

        // Comments for menfess_id 7
        {
            menfessId: 7,
            content: 'Gue juga ngerasain hal yang sama nih, susah banget move on',
            anonymousBadge: 'Anon #073',
            createdAt: new Date('2024-12-05T17:00:00').toISOString(),
            parentCommentId: null,
        },
        {
            menfessId: 7,
            content: 'Time heals everything, trust the process',
            anonymousBadge: 'Anon #074',
            createdAt: new Date('2024-12-06T11:30:00').toISOString(),
            parentCommentId: null,
        },

        // Comments for menfess_id 8
        {
            menfessId: 8,
            content: 'Wah sama dong! Gue juga ga suka banget sama dia',
            anonymousBadge: 'Anon #075',
            createdAt: new Date('2024-12-06T08:00:00').toISOString(),
            parentCommentId: null,
        },
        {
            menfessId: 8,
            content: 'Sabar ya, semoga cepet kelar semester ini',
            anonymousBadge: 'Anon #076',
            createdAt: new Date('2024-12-06T12:00:00').toISOString(),
            parentCommentId: null,
        },

        // Comments for menfess_id 9
        {
            menfessId: 9,
            content: 'Selamat ya! Pasti lu usaha keras banget',
            anonymousBadge: 'Anon #077',
            createdAt: new Date('2024-12-06T09:00:00').toISOString(),
            parentCommentId: null,
        },
        {
            menfessId: 9,
            content: 'Congrats! Share tips dong gimana caranya',
            anonymousBadge: 'Anon #078',
            createdAt: new Date('2024-12-06T13:00:00').toISOString(),
            parentCommentId: null,
        },
        {
            menfessId: 9,
            content: 'Thank you! Gue belajar konsisten tiap hari sih',
            anonymousBadge: 'Anon #079',
            createdAt: new Date('2024-12-06T14:00:00').toISOString(),
            parentCommentId: 28,
        },

        // Comments for menfess_id 10
        {
            menfessId: 10,
            content: 'Gue tau perasaan lu, kadang guru emang kayak gitu',
            anonymousBadge: 'Anon #080',
            createdAt: new Date('2024-12-06T10:00:00').toISOString(),
            parentCommentId: null,
        },
        {
            menfessId: 10,
            content: 'Coba lapor ke BK deh kalo udah parah banget',
            anonymousBadge: 'Anon #081',
            createdAt: new Date('2024-12-06T14:30:00').toISOString(),
            parentCommentId: null,
        },

        // Comments for menfess_id 11
        {
            menfessId: 11,
            content: 'Gue pernah denger tips belajar pake pomodoro technique, coba deh',
            anonymousBadge: 'Anon #082',
            createdAt: new Date('2024-12-06T11:00:00').toISOString(),
            parentCommentId: null,
        },
        {
            menfessId: 11,
            content: 'Mungkin lu kurang istirahat aja, coba tidur yang cukup',
            anonymousBadge: 'Anon #083',
            createdAt: new Date('2024-12-06T15:00:00').toISOString(),
            parentCommentId: null,
        },

        // Comments for menfess_id 12
        {
            menfessId: 12,
            content: 'Wkwkwk gue juga pernah kejadian kayak gitu, malu banget',
            anonymousBadge: 'Anon #084',
            createdAt: new Date('2024-12-06T12:00:00').toISOString(),
            parentCommentId: null,
        },
        {
            menfessId: 12,
            content: 'Take it easy, everyone makes mistakes',
            anonymousBadge: 'Anon #085',
            createdAt: new Date('2024-12-06T16:00:00').toISOString(),
            parentCommentId: null,
        },

        // Comments for menfess_id 13
        {
            menfessId: 13,
            content: 'Jangan dipikirin terlalu dalam, fokus ke hal positif aja',
            anonymousBadge: 'Anon #086',
            createdAt: new Date('2024-12-06T13:00:00').toISOString(),
            parentCommentId: null,
        },
        {
            menfessId: 13,
            content: 'Lu ga sendirian kok, banyak yang ngerasain hal serupa',
            anonymousBadge: 'Anon #087',
            createdAt: new Date('2024-12-07T08:00:00').toISOString(),
            parentCommentId: null,
        },

        // Comments for menfess_id 14
        {
            menfessId: 14,
            content: 'Gue setuju banget sama lu! Sistem ujiannya emang perlu diperbaiki',
            anonymousBadge: 'Anon #088',
            createdAt: new Date('2024-12-06T14:00:00').toISOString(),
            parentCommentId: null,
        },
        {
            menfessId: 14,
            content: 'Iya sih, tapi kita tetep harus adapt aja dulu',
            anonymousBadge: 'Anon #089',
            createdAt: new Date('2024-12-07T09:00:00').toISOString(),
            parentCommentId: 38,
        },

        // Comments for menfess_id 15
        {
            menfessId: 15,
            content: 'Makasih udah share pengalaman lu, ini helpful banget',
            anonymousBadge: 'Anon #090',
            createdAt: new Date('2024-12-06T15:00:00').toISOString(),
            parentCommentId: null,
        },

        // Comments for menfess_id 16
        {
            menfessId: 16,
            content: 'Wah keren! Gue juga mau ikutan nih',
            anonymousBadge: 'Anon #091',
            createdAt: new Date('2024-12-06T16:00:00').toISOString(),
            parentCommentId: null,
        },

        // Comments for menfess_id 17
        {
            menfessId: 17,
            content: 'Semangat! Jangan menyerah ya',
            anonymousBadge: 'Anon #092',
            createdAt: new Date('2024-12-07T08:00:00').toISOString(),
            parentCommentId: null,
        },

        // Comments for menfess_id 18
        {
            menfessId: 18,
            content: 'Hmm menarik juga sih perspektif lu',
            anonymousBadge: 'Anon #093',
            createdAt: new Date('2024-12-07T09:00:00').toISOString(),
            parentCommentId: null,
        },

        // Comments for menfess_id 19
        {
            menfessId: 19,
            content: 'Gue sependapat sama lu, temen kayak gitu emang toxic',
            anonymousBadge: 'Anon #094',
            createdAt: new Date('2024-12-07T10:00:00').toISOString(),
            parentCommentId: null,
        },

        // Comments for menfess_id 20
        {
            menfessId: 20,
            content: 'Good luck! Pasti lu bisa ace the exam',
            anonymousBadge: 'Anon #095',
            createdAt: new Date('2024-12-07T11:00:00').toISOString(),
            parentCommentId: null,
        },

        // Comments for menfess_id 21-30 (1-2 comments each)
        {
            menfessId: 21,
            content: 'Noted! Thanks for the info',
            anonymousBadge: 'Anon #096',
            createdAt: new Date('2024-12-07T12:00:00').toISOString(),
            parentCommentId: null,
        },
        {
            menfessId: 23,
            content: 'Gue juga kepikiran hal yang sama',
            anonymousBadge: 'Anon #097',
            createdAt: new Date('2024-12-07T13:00:00').toISOString(),
            parentCommentId: null,
        },
        {
            menfessId: 25,
            content: 'Hahaha lucu banget cerita lu',
            anonymousBadge: 'Anon #098',
            createdAt: new Date('2024-12-07T14:00:00').toISOString(),
            parentCommentId: null,
        },
        {
            menfessId: 27,
            content: 'Stay positive! Everything happens for a reason',
            anonymousBadge: 'Anon #099',
            createdAt: new Date('2024-12-07T15:00:00').toISOString(),
            parentCommentId: null,
        },
        {
            menfessId: 30,
            content: 'Gue doain semoga lancar semuanya ya!',
            anonymousBadge: 'Anon #100',
            createdAt: new Date('2024-12-07T16:00:00').toISOString(),
            parentCommentId: null,
        },
    ];

    await db.insert(comments).values(sampleComments);
    
    console.log('✅ Comments seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});