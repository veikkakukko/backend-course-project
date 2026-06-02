const express = require("express");
const router = express.Router();
const prisma = require("../lib/prisma");


// GET api/topfive
// Get five players with the highest number of correct attempts
router.get('/', async (req, res) => {

    // get attempt groups by userIds, take top 5 and order descending
    const topAttempts = await prisma.attempt.groupBy({
        by: ['userId'],
        where: { correctness: true },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 5,
    });

    // get names for those userIds
    const topUsernames = await prisma.user.findMany({
        where: { id: { in: topAttempts.map( a => a.userId ) } },
        select: { id: true, name: true },
    });

    // map names and numbers of attempts together
    const result = topAttempts.map( a => ({
        name: topUsernames.find( u => u.id === a.userId ).name,
        successful_attempts: a._count.id
    }));

    res.json(result);

});  


module.exports = router;