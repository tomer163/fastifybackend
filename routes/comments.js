export default (fastify, opts, done)=>{

    const { prisma } = fastify



    fastify.get('/getPostComments/:postId',async(req,rep)=>{
        try{
            const comments = await prisma.comment.findMany({
                where:{
                    postId: req.params.postId,
                },
                include:{
                    writer:{
                        select:{
                            username:true,
                            id:true
                        }
                    }
                },
                orderBy:{
                    createdAt:'asc'
                }
            })
            rep.send(comments)
        }
        catch(err){
            console.log(err)
            rep.send(err)
        }
    })



    fastify.post('/addComment/:postId',
    {
        onRequest: fastify.authenticate
    },
    async(req,rep)=>{
        try{
            const newComment = await prisma.comment.create({
                data:{
                    postId: req.params.postId,
                    userId: req.user.data,
                    content: req.body.content,
                },
                include:{
                    writer:{
                        select:{
                            username:true,
                            id:true
                        }
                    }
                }
            })
            rep.send(newComment)
        }
        catch(err){
            console.log(err)
            rep.send(err)
        }
    })



    fastify.delete('/deleteComment/:commentId',
    {
        onRequest: fastify.authenticate
    },
    async(req,rep)=>{
        try{
            const deleted = await prisma.comment.delete({
                where:{
                    id: req.params.commentId,
                    userId: req.user.data
                }
            })
            rep.send(deleted)
        }
        catch(err){
            console.log(err)
            rep.send(err)
        }
    })



    done()
}