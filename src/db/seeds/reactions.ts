import { db } from '@/db';
import { reactions } from '@/db/schema';

async function main() {
    const sampleReactions = [
        // Post 1 (Crush - Popular): 12 reactions - Mostly hearts
        { menfessId: 1, reactionType: 'heart', ipAddress: '192.168.1.10', createdAt: new Date('2024-01-15T10:30:00').toISOString() },
        { menfessId: 1, reactionType: 'heart', ipAddress: '192.168.1.15', createdAt: new Date('2024-01-15T11:45:00').toISOString() },
        { menfessId: 1, reactionType: 'heart', ipAddress: '192.168.1.20', createdAt: new Date('2024-01-15T14:20:00').toISOString() },
        { menfessId: 1, reactionType: 'heart', ipAddress: '192.168.1.25', createdAt: new Date('2024-01-15T16:10:00').toISOString() },
        { menfessId: 1, reactionType: 'heart', ipAddress: '192.168.1.30', createdAt: new Date('2024-01-16T09:15:00').toISOString() },
        { menfessId: 1, reactionType: 'heart', ipAddress: '192.168.1.35', createdAt: new Date('2024-01-16T13:30:00').toISOString() },
        { menfessId: 1, reactionType: 'heart', ipAddress: '192.168.1.40', createdAt: new Date('2024-01-17T10:00:00').toISOString() },
        { menfessId: 1, reactionType: 'thumbs', ipAddress: '192.168.1.45', createdAt: new Date('2024-01-15T12:00:00').toISOString() },
        { menfessId: 1, reactionType: 'thumbs', ipAddress: '192.168.1.50', createdAt: new Date('2024-01-16T15:20:00').toISOString() },
        { menfessId: 1, reactionType: 'thumbs', ipAddress: '192.168.1.55', createdAt: new Date('2024-01-17T11:30:00').toISOString() },
        { menfessId: 1, reactionType: 'laugh', ipAddress: '192.168.1.60', createdAt: new Date('2024-01-15T13:45:00').toISOString() },
        { menfessId: 1, reactionType: 'thumbs', ipAddress: '192.168.1.10', createdAt: new Date('2024-01-18T09:00:00').toISOString() },

        // Post 2 (Curhat - Popular): 10 reactions - Sad and supportive
        { menfessId: 2, reactionType: 'sad', ipAddress: '192.168.2.10', createdAt: new Date('2024-01-16T11:00:00').toISOString() },
        { menfessId: 2, reactionType: 'sad', ipAddress: '192.168.2.15', createdAt: new Date('2024-01-16T12:30:00').toISOString() },
        { menfessId: 2, reactionType: 'sad', ipAddress: '192.168.2.20', createdAt: new Date('2024-01-16T14:45:00').toISOString() },
        { menfessId: 2, reactionType: 'sad', ipAddress: '192.168.2.25', createdAt: new Date('2024-01-17T09:20:00').toISOString() },
        { menfessId: 2, reactionType: 'thumbs', ipAddress: '192.168.2.30', createdAt: new Date('2024-01-16T13:15:00').toISOString() },
        { menfessId: 2, reactionType: 'thumbs', ipAddress: '192.168.2.35', createdAt: new Date('2024-01-17T10:30:00').toISOString() },
        { menfessId: 2, reactionType: 'thumbs', ipAddress: '192.168.2.40', createdAt: new Date('2024-01-18T11:00:00').toISOString() },
        { menfessId: 2, reactionType: 'thumbs', ipAddress: '192.168.2.45', createdAt: new Date('2024-01-19T14:20:00').toISOString() },
        { menfessId: 2, reactionType: 'heart', ipAddress: '192.168.2.50', createdAt: new Date('2024-01-17T15:00:00').toISOString() },
        { menfessId: 2, reactionType: 'heart', ipAddress: '192.168.2.55', createdAt: new Date('2024-01-18T16:30:00').toISOString() },

        // Post 3 (Humor - Popular): 13 reactions - Lots of laughs
        { menfessId: 3, reactionType: 'laugh', ipAddress: '192.168.3.10', createdAt: new Date('2024-01-17T10:15:00').toISOString() },
        { menfessId: 3, reactionType: 'laugh', ipAddress: '192.168.3.15', createdAt: new Date('2024-01-17T11:30:00').toISOString() },
        { menfessId: 3, reactionType: 'laugh', ipAddress: '192.168.3.20', createdAt: new Date('2024-01-17T13:45:00').toISOString() },
        { menfessId: 3, reactionType: 'laugh', ipAddress: '192.168.3.25', createdAt: new Date('2024-01-18T09:00:00').toISOString() },
        { menfessId: 3, reactionType: 'laugh', ipAddress: '192.168.3.30', createdAt: new Date('2024-01-18T14:20:00').toISOString() },
        { menfessId: 3, reactionType: 'laugh', ipAddress: '192.168.3.35', createdAt: new Date('2024-01-19T10:30:00').toISOString() },
        { menfessId: 3, reactionType: 'rofl', ipAddress: '192.168.3.40', createdAt: new Date('2024-01-17T12:00:00').toISOString() },
        { menfessId: 3, reactionType: 'rofl', ipAddress: '192.168.3.45', createdAt: new Date('2024-01-18T11:15:00').toISOString() },
        { menfessId: 3, reactionType: 'rofl', ipAddress: '192.168.3.50', createdAt: new Date('2024-01-19T15:45:00').toISOString() },
        { menfessId: 3, reactionType: 'rofl', ipAddress: '192.168.3.55', createdAt: new Date('2024-01-20T10:00:00').toISOString() },
        { menfessId: 3, reactionType: 'thumbs', ipAddress: '192.168.3.60', createdAt: new Date('2024-01-18T16:30:00').toISOString() },
        { menfessId: 3, reactionType: 'thumbs', ipAddress: '192.168.3.65', createdAt: new Date('2024-01-19T12:00:00').toISOString() },
        { menfessId: 3, reactionType: 'thumbs', ipAddress: '192.168.3.70', createdAt: new Date('2024-01-20T13:30:00').toISOString() },

        // Post 4 (Random - Medium): 6 reactions - Mostly thumbs
        { menfessId: 4, reactionType: 'thumbs', ipAddress: '192.168.4.10', createdAt: new Date('2024-01-18T11:00:00').toISOString() },
        { menfessId: 4, reactionType: 'thumbs', ipAddress: '192.168.4.15', createdAt: new Date('2024-01-18T14:30:00').toISOString() },
        { menfessId: 4, reactionType: 'thumbs', ipAddress: '192.168.4.20', createdAt: new Date('2024-01-19T10:15:00').toISOString() },
        { menfessId: 4, reactionType: 'thumbs', ipAddress: '192.168.4.25', createdAt: new Date('2024-01-20T09:45:00').toISOString() },
        { menfessId: 4, reactionType: 'laugh', ipAddress: '192.168.4.30', createdAt: new Date('2024-01-19T13:20:00').toISOString() },
        { menfessId: 4, reactionType: 'heart', ipAddress: '192.168.4.35', createdAt: new Date('2024-01-20T16:00:00').toISOString() },

        // Post 5 (Motivasi - Popular): 11 reactions - Hearts and thumbs
        { menfessId: 5, reactionType: 'heart', ipAddress: '192.168.5.10', createdAt: new Date('2024-01-19T10:30:00').toISOString() },
        { menfessId: 5, reactionType: 'heart', ipAddress: '192.168.5.15', createdAt: new Date('2024-01-19T12:45:00').toISOString() },
        { menfessId: 5, reactionType: 'heart', ipAddress: '192.168.5.20', createdAt: new Date('2024-01-19T15:20:00').toISOString() },
        { menfessId: 5, reactionType: 'heart', ipAddress: '192.168.5.25', createdAt: new Date('2024-01-20T09:00:00').toISOString() },
        { menfessId: 5, reactionType: 'heart', ipAddress: '192.168.5.30', createdAt: new Date('2024-01-21T11:30:00').toISOString() },
        { menfessId: 5, reactionType: 'heart', ipAddress: '192.168.5.35', createdAt: new Date('2024-01-22T14:15:00').toISOString() },
        { menfessId: 5, reactionType: 'thumbs', ipAddress: '192.168.5.40', createdAt: new Date('2024-01-19T13:00:00').toISOString() },
        { menfessId: 5, reactionType: 'thumbs', ipAddress: '192.168.5.45', createdAt: new Date('2024-01-20T14:45:00').toISOString() },
        { menfessId: 5, reactionType: 'thumbs', ipAddress: '192.168.5.50', createdAt: new Date('2024-01-21T10:20:00').toISOString() },
        { menfessId: 5, reactionType: 'thumbs', ipAddress: '192.168.5.55', createdAt: new Date('2024-01-22T16:30:00').toISOString() },
        { menfessId: 5, reactionType: 'thumbs', ipAddress: '192.168.5.60', createdAt: new Date('2024-01-23T09:45:00').toISOString() },

        // Post 6 (Crush - Medium): 7 reactions
        { menfessId: 6, reactionType: 'heart', ipAddress: '192.168.6.10', createdAt: new Date('2024-01-20T11:15:00').toISOString() },
        { menfessId: 6, reactionType: 'heart', ipAddress: '192.168.6.15', createdAt: new Date('2024-01-20T14:30:00').toISOString() },
        { menfessId: 6, reactionType: 'heart', ipAddress: '192.168.6.20', createdAt: new Date('2024-01-21T09:45:00').toISOString() },
        { menfessId: 6, reactionType: 'heart', ipAddress: '192.168.6.25', createdAt: new Date('2024-01-22T13:20:00').toISOString() },
        { menfessId: 6, reactionType: 'thumbs', ipAddress: '192.168.6.30', createdAt: new Date('2024-01-21T11:00:00').toISOString() },
        { menfessId: 6, reactionType: 'thumbs', ipAddress: '192.168.6.35', createdAt: new Date('2024-01-23T10:30:00').toISOString() },
        { menfessId: 6, reactionType: 'laugh', ipAddress: '192.168.6.40', createdAt: new Date('2024-01-22T15:45:00').toISOString() },

        // Post 7 (Curhat - Medium): 5 reactions
        { menfessId: 7, reactionType: 'sad', ipAddress: '192.168.7.10', createdAt: new Date('2024-01-21T10:00:00').toISOString() },
        { menfessId: 7, reactionType: 'sad', ipAddress: '192.168.7.15', createdAt: new Date('2024-01-21T13:30:00').toISOString() },
        { menfessId: 7, reactionType: 'thumbs', ipAddress: '192.168.7.20', createdAt: new Date('2024-01-22T09:15:00').toISOString() },
        { menfessId: 7, reactionType: 'thumbs', ipAddress: '192.168.7.25', createdAt: new Date('2024-01-23T14:45:00').toISOString() },
        { menfessId: 7, reactionType: 'heart', ipAddress: '192.168.7.30', createdAt: new Date('2024-01-24T11:20:00').toISOString() },

        // Post 8 (Humor - Popular): 14 reactions
        { menfessId: 8, reactionType: 'laugh', ipAddress: '192.168.8.10', createdAt: new Date('2024-01-22T10:30:00').toISOString() },
        { menfessId: 8, reactionType: 'laugh', ipAddress: '192.168.8.15', createdAt: new Date('2024-01-22T12:45:00').toISOString() },
        { menfessId: 8, reactionType: 'laugh', ipAddress: '192.168.8.20', createdAt: new Date('2024-01-22T15:20:00').toISOString() },
        { menfessId: 8, reactionType: 'laugh', ipAddress: '192.168.8.25', createdAt: new Date('2024-01-23T09:00:00').toISOString() },
        { menfessId: 8, reactionType: 'laugh', ipAddress: '192.168.8.30', createdAt: new Date('2024-01-23T13:30:00').toISOString() },
        { menfessId: 8, reactionType: 'laugh', ipAddress: '192.168.8.35', createdAt: new Date('2024-01-24T10:15:00').toISOString() },
        { menfessId: 8, reactionType: 'laugh', ipAddress: '192.168.8.40', createdAt: new Date('2024-01-25T11:45:00').toISOString() },
        { menfessId: 8, reactionType: 'rofl', ipAddress: '192.168.8.45', createdAt: new Date('2024-01-22T14:00:00').toISOString() },
        { menfessId: 8, reactionType: 'rofl', ipAddress: '192.168.8.50', createdAt: new Date('2024-01-23T11:30:00').toISOString() },
        { menfessId: 8, reactionType: 'rofl', ipAddress: '192.168.8.55', createdAt: new Date('2024-01-24T15:00:00').toISOString() },
        { menfessId: 8, reactionType: 'rofl', ipAddress: '192.168.8.60', createdAt: new Date('2024-01-25T09:20:00').toISOString() },
        { menfessId: 8, reactionType: 'thumbs', ipAddress: '192.168.8.65', createdAt: new Date('2024-01-23T16:30:00').toISOString() },
        { menfessId: 8, reactionType: 'thumbs', ipAddress: '192.168.8.70', createdAt: new Date('2024-01-24T12:00:00').toISOString() },
        { menfessId: 8, reactionType: 'thumbs', ipAddress: '192.168.8.75', createdAt: new Date('2024-01-26T10:45:00').toISOString() },

        // Post 9 (Random - Less popular): 3 reactions
        { menfessId: 9, reactionType: 'thumbs', ipAddress: '192.168.9.10', createdAt: new Date('2024-01-23T11:00:00').toISOString() },
        { menfessId: 9, reactionType: 'thumbs', ipAddress: '192.168.9.15', createdAt: new Date('2024-01-24T14:30:00').toISOString() },
        { menfessId: 9, reactionType: 'laugh', ipAddress: '192.168.9.20', createdAt: new Date('2024-01-25T10:15:00').toISOString() },

        // Post 10 (Motivasi - Medium): 8 reactions
        { menfessId: 10, reactionType: 'heart', ipAddress: '192.168.10.10', createdAt: new Date('2024-01-24T10:00:00').toISOString() },
        { menfessId: 10, reactionType: 'heart', ipAddress: '192.168.10.15', createdAt: new Date('2024-01-24T13:30:00').toISOString() },
        { menfessId: 10, reactionType: 'heart', ipAddress: '192.168.10.20', createdAt: new Date('2024-01-25T09:45:00').toISOString() },
        { menfessId: 10, reactionType: 'heart', ipAddress: '192.168.10.25', createdAt: new Date('2024-01-26T11:20:00').toISOString() },
        { menfessId: 10, reactionType: 'thumbs', ipAddress: '192.168.10.30', createdAt: new Date('2024-01-24T15:00:00').toISOString() },
        { menfessId: 10, reactionType: 'thumbs', ipAddress: '192.168.10.35', createdAt: new Date('2024-01-25T12:30:00').toISOString() },
        { menfessId: 10, reactionType: 'thumbs', ipAddress: '192.168.10.40', createdAt: new Date('2024-01-26T14:15:00').toISOString() },
        { menfessId: 10, reactionType: 'thumbs', ipAddress: '192.168.10.45', createdAt: new Date('2024-01-27T10:45:00').toISOString() },

        // Post 11 (Crush - Less popular): 4 reactions
        { menfessId: 11, reactionType: 'heart', ipAddress: '192.168.11.10', createdAt: new Date('2024-01-25T11:30:00').toISOString() },
        { menfessId: 11, reactionType: 'heart', ipAddress: '192.168.11.15', createdAt: new Date('2024-01-26T09:45:00').toISOString() },
        { menfessId: 11, reactionType: 'thumbs', ipAddress: '192.168.11.20', createdAt: new Date('2024-01-27T13:20:00').toISOString() },
        { menfessId: 11, reactionType: 'laugh', ipAddress: '192.168.11.25', createdAt: new Date('2024-01-28T10:00:00').toISOString() },

        // Post 12 (Curhat - Less popular): 4 reactions
        { menfessId: 12, reactionType: 'sad', ipAddress: '192.168.12.10', createdAt: new Date('2024-01-26T10:15:00').toISOString() },
        { menfessId: 12, reactionType: 'sad', ipAddress: '192.168.12.15', createdAt: new Date('2024-01-27T14:30:00').toISOString() },
        { menfessId: 12, reactionType: 'thumbs', ipAddress: '192.168.12.20', createdAt: new Date('2024-01-28T11:45:00').toISOString() },
        { menfessId: 12, reactionType: 'heart', ipAddress: '192.168.12.25', createdAt: new Date('2024-01-29T09:20:00').toISOString() },

        // Post 13 (Humor - Medium): 6 reactions
        { menfessId: 13, reactionType: 'laugh', ipAddress: '192.168.13.10', createdAt: new Date('2024-01-27T10:00:00').toISOString() },
        { menfessId: 13, reactionType: 'laugh', ipAddress: '192.168.13.15', createdAt: new Date('2024-01-27T13:30:00').toISOString() },
        { menfessId: 13, reactionType: 'laugh', ipAddress: '192.168.13.20', createdAt: new Date('2024-01-28T09:45:00').toISOString() },
        { menfessId: 13, reactionType: 'rofl', ipAddress: '192.168.13.25', createdAt: new Date('2024-01-28T14:20:00').toISOString() },
        { menfessId: 13, reactionType: 'rofl', ipAddress: '192.168.13.30', createdAt: new Date('2024-01-29T11:00:00').toISOString() },
        { menfessId: 13, reactionType: 'thumbs', ipAddress: '192.168.13.35', createdAt: new Date('2024-01-30T10:30:00').toISOString() },

        // Post 14 (Random - Less popular): 2 reactions
        { menfessId: 14, reactionType: 'thumbs', ipAddress: '192.168.14.10', createdAt: new Date('2024-01-28T11:15:00').toISOString() },
        { menfessId: 14, reactionType: 'heart', ipAddress: '192.168.14.15', createdAt: new Date('2024-01-29T15:45:00').toISOString() },

        // Post 15 (Motivasi - Less popular): 4 reactions
        { menfessId: 15, reactionType: 'heart', ipAddress: '192.168.15.10', createdAt: new Date('2024-01-29T10:30:00').toISOString() },
        { menfessId: 15, reactionType: 'heart', ipAddress: '192.168.15.15', createdAt: new Date('2024-01-30T13:15:00').toISOString() },
        { menfessId: 15, reactionType: 'thumbs', ipAddress: '192.168.15.20', createdAt: new Date('2024-01-31T09:00:00').toISOString() },
        { menfessId: 15, reactionType: 'thumbs', ipAddress: '192.168.15.25', createdAt: new Date('2024-02-01T11:45:00').toISOString() },

        // Post 16 (Crush - Medium): 5 reactions
        { menfessId: 16, reactionType: 'heart', ipAddress: '192.168.16.10', createdAt: new Date('2024-01-30T10:00:00').toISOString() },
        { menfessId: 16, reactionType: 'heart', ipAddress: '192.168.16.15', createdAt: new Date('2024-01-30T14:30:00').toISOString() },
        { menfessId: 16, reactionType: 'heart', ipAddress: '192.168.16.20', createdAt: new Date('2024-01-31T11:20:00').toISOString() },
        { menfessId: 16, reactionType: 'thumbs', ipAddress: '192.168.16.25', createdAt: new Date('2024-02-01T09:45:00').toISOString() },
        { menfessId: 16, reactionType: 'laugh', ipAddress: '192.168.16.30', createdAt: new Date('2024-02-02T13:15:00').toISOString() },

        // Post 17 (Curhat - Medium): 6 reactions
        { menfessId: 17, reactionType: 'sad', ipAddress: '192.168.17.10', createdAt: new Date('2024-01-31T10:30:00').toISOString() },
        { menfessId: 17, reactionType: 'sad', ipAddress: '192.168.17.15', createdAt: new Date('2024-01-31T13:45:00').toISOString() },
        { menfessId: 17, reactionType: 'thumbs', ipAddress: '192.168.17.20', createdAt: new Date('2024-02-01T10:15:00').toISOString() },
        { menfessId: 17, reactionType: 'thumbs', ipAddress: '192.168.17.25', createdAt: new Date('2024-02-02T14:30:00').toISOString() },
        { menfessId: 17, reactionType: 'heart', ipAddress: '192.168.17.30', createdAt: new Date('2024-02-03T09:00:00').toISOString() },
        { menfessId: 17, reactionType: 'heart', ipAddress: '192.168.17.35', createdAt: new Date('2024-02-04T11:45:00').toISOString() },

        // Post 18 (Humor - Popular): 9 reactions
        { menfessId: 18, reactionType: 'laugh', ipAddress: '192.168.18.10', createdAt: new Date('2024-02-01T10:00:00').toISOString() },
        { menfessId: 18, reactionType: 'laugh', ipAddress: '192.168.18.15', createdAt: new Date('2024-02-01T13:30:00').toISOString() },
        { menfessId: 18, reactionType: 'laugh', ipAddress: '192.168.18.20', createdAt: new Date('2024-02-02T09:45:00').toISOString() },
        { menfessId: 18, reactionType: 'laugh', ipAddress: '192.168.18.25', createdAt: new Date('2024-02-03T11:20:00').toISOString() },
        { menfessId: 18, reactionType: 'rofl', ipAddress: '192.168.18.30', createdAt: new Date('2024-02-01T15:00:00').toISOString() },
        { menfessId: 18, reactionType: 'rofl', ipAddress: '192.168.18.35', createdAt: new Date('2024-02-02T12:30:00').toISOString() },
        { menfessId: 18, reactionType: 'rofl', ipAddress: '192.168.18.40', createdAt: new Date('2024-02-03T14:15:00').toISOString() },
        { menfessId: 18, reactionType: 'thumbs', ipAddress: '192.168.18.45', createdAt: new Date('2024-02-04T10:45:00').toISOString() },
        { menfessId: 18, reactionType: 'thumbs', ipAddress: '192.168.18.50', createdAt: new Date('2024-02-05T13:00:00').toISOString() },

        // Post 19 (Random - Less popular): 3 reactions
        { menfessId: 19, reactionType: 'thumbs', ipAddress: '192.168.19.10', createdAt: new Date('2024-02-02T11:30:00').toISOString() },
        { menfessId: 19, reactionType: 'thumbs', ipAddress: '192.168.19.15', createdAt: new Date('2024-02-03T14:45:00').toISOString() },
        { menfessId: 19, reactionType: 'heart', ipAddress: '192.168.19.20', createdAt: new Date('2024-02-04T10:15:00').toISOString() },

        // Post 20 (Motivasi - Medium): 7 reactions
        { menfessId: 20, reactionType: 'heart', ipAddress: '192.168.20.10', createdAt: new Date('2024-02-03T10:00:00').toISOString() },
        { menfessId: 20, reactionType: 'heart', ipAddress: '192.168.20.15', createdAt: new Date('2024-02-03T13:30:00').toISOString() },
        { menfessId: 20, reactionType: 'heart', ipAddress: '192.168.20.20', createdAt: new Date('2024-02-04T09:45:00').toISOString() },
        { menfessId: 20, reactionType: 'thumbs', ipAddress: '192.168.20.25', createdAt: new Date('2024-02-04T14:20:00').toISOString() },
        { menfessId: 20, reactionType: 'thumbs', ipAddress: '192.168.20.30', createdAt: new Date('2024-02-05T11:00:00').toISOString() },
        { menfessId: 20, reactionType: 'thumbs', ipAddress: '192.168.20.35', createdAt: new Date('2024-02-06T10:30:00').toISOString() },
        { menfessId: 20, reactionType: 'thumbs', ipAddress: '192.168.20.40', createdAt: new Date('2024-02-07T13:15:00').toISOString() },

        // Post 21 (Crush - Less popular): 2 reactions
        { menfessId: 21, reactionType: 'heart', ipAddress: '192.168.21.10', createdAt: new Date('2024-02-04T11:00:00').toISOString() },
        { menfessId: 21, reactionType: 'thumbs', ipAddress: '192.168.21.15', createdAt: new Date('2024-02-05T15:30:00').toISOString() },

        // Post 22 (Curhat - Less popular): 3 reactions
        { menfessId: 22, reactionType: 'sad', ipAddress: '192.168.22.10', createdAt: new Date('2024-02-05T10:15:00').toISOString() },
        { menfessId: 22, reactionType: 'thumbs', ipAddress: '192.168.22.15', createdAt: new Date('2024-02-06T13:45:00').toISOString() },
        { menfessId: 22, reactionType: 'heart', ipAddress: '192.168.22.20', createdAt: new Date('2024-02-07T09:30:00').toISOString() },

        // Post 23 (Humor - Medium): 5 reactions
        { menfessId: 23, reactionType: 'laugh', ipAddress: '192.168.23.10', createdAt: new Date('2024-02-06T10:00:00').toISOString() },
        { menfessId: 23, reactionType: 'laugh', ipAddress: '192.168.23.15', createdAt: new Date('2024-02-06T14:30:00').toISOString() },
        { menfessId: 23, reactionType: 'rofl', ipAddress: '192.168.23.20', createdAt: new Date('2024-02-07T11:15:00').toISOString() },
        { menfessId: 23, reactionType: 'rofl', ipAddress: '192.168.23.25', createdAt: new Date('2024-02-08T09:45:00').toISOString() },
        { menfessId: 23, reactionType: 'thumbs', ipAddress: '192.168.23.30', createdAt: new Date('2024-02-09T13:20:00').toISOString() },

        // Post 24 (Random - Medium): 4 reactions
        { menfessId: 24, reactionType: 'thumbs', ipAddress: '192.168.24.10', createdAt: new Date('2024-02-07T11:30:00').toISOString() },
        { menfessId: 24, reactionType: 'thumbs', ipAddress: '192.168.24.15', createdAt: new Date('2024-02-08T10:15:00').toISOString() },
        { menfessId: 24, reactionType: 'laugh', ipAddress: '192.168.24.20', createdAt: new Date('2024-02-09T14:45:00').toISOString() },
        { menfessId: 24, reactionType: 'heart', ipAddress: '192.168.24.25', createdAt: new Date('2024-02-10T09:00:00').toISOString() },

        // Post 25 (Motivasi - Less popular): 3 reactions
        { menfessId: 25, reactionType: 'heart', ipAddress: '192.168.25.10', createdAt: new Date('2024-02-08T10:30:00').toISOString() },
        { menfessId: 25, reactionType: 'thumbs', ipAddress: '192.168.25.15', createdAt: new Date('2024-02-09T13:45:00').toISOString() },
        { menfessId: 25, reactionType: 'thumbs', ipAddress: '192.168.25.20', createdAt: new Date('2024-02-10T11:20:00').toISOString() },

        // Post 26 (Crush - Less popular): 1 reaction
        { menfessId: 26, reactionType: 'heart', ipAddress: '192.168.26.10', createdAt: new Date('2024-02-09T10:00:00').toISOString() },

        // Post 27 (Curhat - Less popular): 2 reactions
        { menfessId: 27, reactionType: 'sad', ipAddress: '192.168.27.10', createdAt: new Date('2024-02-10T11:15:00').toISOString() },
        { menfessId: 27, reactionType: 'thumbs', ipAddress: '192.168.27.15', createdAt: new Date('2024-02-11T14:30:00').toISOString() },

        // Post 28 (Humor - Less popular): 2 reactions
        { menfessId: 28, reactionType: 'laugh', ipAddress: '192.168.28.10', createdAt: new Date('2024-02-11T10:30:00').toISOString() },
        { menfessId: 28, reactionType: 'rofl', ipAddress: '192.168.28.15', createdAt: new Date('2024-02-12T13:45:00').toISOString() },

        // Post 29 (Random - Pending): 1 reaction
        { menfessId: 29, reactionType: 'thumbs', ipAddress: '192.168.29.10', createdAt: new Date('2024-02-12T11:00:00').toISOString() },

        // Post 30 (Motivasi - Pending): 2 reactions
        { menfessId: 30, reactionType: 'heart', ipAddress: '192.168.30.10', createdAt: new Date('2024-02-13T10:15:00').toISOString() },
        { menfessId: 30, reactionType: 'thumbs', ipAddress: '192.168.30.15', createdAt: new Date('2024-02-13T14:30:00').toISOString() },
    ];

    await db.insert(reactions).values(sampleReactions);
    
    console.log('✅ Reactions seeder completed successfully - 150 reactions distributed across posts 1-30');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});