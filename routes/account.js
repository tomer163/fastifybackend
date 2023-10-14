// import { PrismaClient } from '@prisma/client'
import prisma from '../index.js'
export default (fastify, opts, done)=>{

    fastify.post('/signup', async (req,rep)=>{
        try{
            const usermade = await prisma.user.create({
                data:{
                    username: req.body.username,
                    password: req.body.password
                }
            })
            return rep.send(usermade)
        } catch(err){
            console.log(err)
            return rep.send(err)
        }
    })

    fastify.get('/users', async (req,rep)=>{
        const users = await prisma.user.findMany()
        rep.send(users)
    })


    done()
}