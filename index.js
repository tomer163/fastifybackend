import 'dotenv/config'

import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import Fastify from "fastify"

//routes
import accountRoute from './routes/accounts.js'
import postsRoute from './routes/posts.js'

//plugins & others
import jwt from './plugins/jwt.js'
import fastifyMultipart from '@fastify/multipart'
import { PrismaClient } from "@prisma/client"
import fastifyStatic from '@fastify/static'


const fastify = Fastify({
    logger:true
})

fastify.register(fastifyStatic,{
    root: join(dirname(fileURLToPath(import.meta.url)),"public"),
    prefix:'/public/',
    wildcard: true
})

//plugins & decorations
fastify.register(jwt)
fastify.register(fastifyMultipart,{
    limits:{
        fileSize: 100000000
    }
})

fastify.decorate('prisma', new PrismaClient())


//routes
fastify.register(accountRoute, { prefix: '/api' })
fastify.register(postsRoute, { prefix: '/api' })


fastify.listen({ port: 3000 }, (err, address)=>{
    if(err){
        fastify.log.error(err)
        process.exit(1)
    }
})
