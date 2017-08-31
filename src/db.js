const IPFS = require('ipfs')
const Repo = require('ipfs-repo')
const OrbitDB = require('orbit-db')


//Create the IPFS repo
const repo = new Repo('/acailly/test')

repo.exists((err, exists) => {

    if(exists){
        console.log('repo already exists')
        
        start(repo)
    }
    else{        
        console.log('repo doesn\'t exists, creating one')

        repo.init({}, (err) => {
            if (err) {
              throw err
            }
          
            start(repo)
        })
    }
})

function start(repo){
    repo.open((err) => {
        if (err) {
          throw err
        }
    
        console.log('repo is ready')
    
        startIPFS(repo)
    })
}

function startIPFS(repo){
    // Create the IPFS node instance
    const ipfs = new IPFS({
        repo: repo,
        EXPERIMENTAL: { // enable experimental features
            pubsub: true
        }
    })
    ipfs.on('error', (e) => console.error('IPFS error:', e))
    ipfs.on('ready', () => {
        console.log('IPFS node is ready \\o/')

        const orbitdb = new OrbitDB(ipfs)
    
        const db = orbitdb.kvstore('locations')
        
        db.events.on('synced', () => refresh(db))

        db.events.on('sync', () => console.log('sync'))
        db.events.on('load', () => console.log('load'))
        db.events.on('write', () => console.log('write'))
        db.events.on('load.progress', () => console.log('load.progress'))
        db.events.on('error', () => console.log('error'))

        db.load()
        
        db.events.on('ready', () => {
            setInterval(() => increment(db), 2000)
        })

        // stopping a node
        // ipfs.stop(() => {
        //     console.log('IPFS node is offline')
        // })
    })
}

function refresh(db){
    const counter = db.get('counter')
    console.log('COUNTER', counter)
}

function increment(db){
    const counter = db.get('counter') || 0
    db.put('counter', counter + 1)
    console.log('INCREMENT COUNTER')
    refresh(db)
}
