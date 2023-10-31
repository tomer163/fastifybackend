import 'dotenv/config'
import * as fs from 'node:fs'
import { pipeline } from 'node:stream/promises'
import { randomBytes } from 'node:crypto'

export default (fastify, opts, done)=>{

    const { prisma } = fastify


    
    fastify.get('/allPosts', async(req,rep)=>{
        try{
            const posts = await prisma.post.findMany({
                include:{
                    images:true,
                    author:{
                        select:{
                            username:true
                        }
                    }
                },
                orderBy: {
                    createdAt:'desc'
                }
            })
            return rep.send(posts)
        }
        catch(err){
            console.log(err)
            return rep.send(err)
        }
    })


    //fix needed: change prisma.user to prisma.post
    fastify.get('/postsByCurUser',
    {
        onRequest: fastify.authenticate
    },
    async(req,rep)=>{
        try{
            console.log(req.user)
            const user = await prisma.user.findFirstOrThrow({
                where:{
                    id: req.user.data
                },
                include:{
                    posts:{
                        include:{
                            images:true
                        },
                        orderBy: {
                            createdAt:'desc'
                        }
                    }
                }
            })
            return rep.send(user)
        }
        catch(err){
            console.log(err)
            return rep.send(err)
        }
    })



    fastify.post('/createPostForCurUser',
    {
        onRequest: fastify.authenticate
    },
    async(req,rep)=>{
        try{
            const parts = await req.parts()
            let namearr = []
            let title
            let description
            for await (const part of parts){
                if(part.type === 'file'){
                    const newPath = randomBytes(16).toString('hex') + '.' + part.filename.split('.')[part.filename.split('.').length-1]
                    await pipeline(part.file, fs.createWriteStream(`./public/images/${newPath}`))
                    namearr.push({path: `${process.env.DOMAIN}:${process.env.PORT}/public/images/${newPath}`, title: part.fieldname})
                }
                else if(part.fieldname === 'title'){
                    title = part.value
                }
                else if(part.fieldname === 'description'){
                    description = part.value
                }
            }
            const createdPost = await prisma.post.create({
                data:{
                    title: title,
                    description: description,
                    userId: req.user.data,
                    images:{
                        createMany: {
                            data: namearr
                        }
                    }
                },
                include:{
                    author:true,
                    images:true
                }
            })
            rep.send(createdPost)
        }
        catch(err){
            console.log(err)
            rep.send(err)
        }
    })



    // fastify.put('/updateCurUserPost/:postId',
    // {
    //     onRequest: fastify.authenticate
    // },
    // async(req,rep)=>{
    //     const updatedPost = await prisma.post.update({
    //         where:{
    //             userId: req.user.data
    //         },
    //         data:{
    //             title: req.body.title,
    //             url: req.body.url
    //         }
    //     })
    // })



    fastify.delete('/deleteCurUserPost/:postId',
    {
        onRequest: fastify.authenticate
    },
    async(req,rep)=>{
        try{
            const postImages = await prisma.post.findFirstOrThrow({
                where: {
                    id: req.params.postId,
                    userId: req.user.data
                },
                include:{
                    images: true
                }
            })
            console.log(postImages)
            postImages.images.forEach(image => {
                fs.unlink('./public' + image.path.split('public')[1] ,(err)=>{
                    if(err) console.log(err)
                })
            })
            const deletedPost = await prisma.post.delete({
                where:{
                    id: req.params.postId
                }
            })
            rep.send(deletedPost)
        }
        catch(err){
            console.log(err)
            rep.send(err)
        }
    })



    done()
}