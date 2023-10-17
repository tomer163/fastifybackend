import 'dotenv/config'

import jwt from "@fastify/jwt"
import fp from 'fastify-plugin'

export default fp( async(fastify,opts)=>{
    fastify.register(jwt,{
        secret: process.env.JWT_SECRET
    })
    
    fastify.decorate("authenticate", async function(req, rep) {
        try {
            await req.jwtVerify()
        }
        catch (err) {
            return rep.send(err)
        }
    })
})