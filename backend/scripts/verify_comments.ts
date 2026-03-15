import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Querying database for comments...');
    const comments = await prisma.comment.findMany({
        include: {
            user: {
                select: { name: true, personalEmail: true }
            },
            post: {
                select: { title: true }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    console.log(`\nFound ${comments.length} comments in the database:`);

    if (comments.length === 0) {
        console.log("No comments found. (This is expected if the frontend is using Mock Data)");
    } else {
        comments.forEach(c => {
            console.log(`- [${c.createdAt.toISOString()}] ${c.user.name} on "${c.post.title || 'Untitled'}": ${c.content}`);
        });
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
