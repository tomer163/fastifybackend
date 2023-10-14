import Fastify from "fastify"
import { PrismaClient } from "@prisma/client"
import accountRoute from './routes/account.js'
const fastify = Fastify({
    logger:true
})

export default new PrismaClient()

fastify.register(accountRoute, { prefix: '/api' })

fastify.listen({ port: 3000 }, (err, address)=>{
    if(err){
        fastify.log.error(err)
        process.exit(1)
    }
})
