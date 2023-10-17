import bcrypt from 'bcrypt'

export default (fastify, opts, done)=>{

    const { prisma } = fastify


    //needs special access key
    fastify.get('/users', async (req,rep)=>{
        const users = await prisma.user.findMany()
        rep.send(users)
    })



    fastify.post('/signup', async (req,rep)=>{
        try{
            const salt = bcrypt.genSaltSync(3)
            const hash = bcrypt.hashSync(req.body.password, salt)
            const usermade = await prisma.user.create({
                data:{
                    username: req.body.username,
                    password: hash
                }
            })
            return rep.send(usermade)
        } catch(err){
            console.log(err)
            return rep.send(err)
        }
    })



    fastify.post('/login',async (req,rep)=>{
        try{
            const user = await prisma.user.findFirstOrThrow({
                where:{
                    username: req.body.username
                }
            })
            if(bcrypt.compareSync(req.body.password, user.password)){
                const token = fastify.jwt.sign({ data: user.id })
                return rep.send({ token })
            }
            else{
                return rep.status(401).send({ message:"couldn't connect" })
            }
        }
        catch(err){
            console.log(err)
            return rep.send(err)
        }
    })



    //needs special access key
    fastify.delete('/users/:name', async (req,rep)=>{
        try{
            const deleted = await prisma.user.delete({
                where:{
                    username: req.params.name
                }
            })
            return rep.send({ DELETED: deleted })
        }
        catch(err){
            console.log(err)
            return rep.send(err)
        }
    })


    
    done()
}