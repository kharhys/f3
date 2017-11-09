// flightplan.js
var userHome = require('user-home');
var plan = require('flightplan');
var path = require('path');
var fs = require('fs');
var pretty = require('pretty-error')

require('dotenv').config({
    path: path.resolve('config/.env')
})

const argv = require('yargs').argv

const configPath = path.resolve('f3.config.js')

console.log('flightplan on it', configPath)

// configuration
plan.target('staging', {
    host: argv.host,
    username: argv.username,
    passphrase: argv.passphrase,
    agent: process.env.SSH_AUTH_SOCK,
    privateKey: path.join(userHome, '/.ssh/id_rsa')
})

var tmpDir = 'tendapa-com-' + new Date().getTime()

function ensureRuntimeDeps(host) {
    let context = {
        step: 0,
        node: {},
        yarn: {},
        pod: {},
        nginx: {},
        mongo: {},
        app: {}
    }
    run(host, context)
}

function stashAppPod(host, ctx, next) {   
    console.log(`step ${ctx.step}: stashAppPod`)
    ctx.step += 1 
    const res = host.exec('[ -d /root/repos/tendapa.git ] && echo "exists" || echo "notfound"')
    ctx.app.exists = res.code == "0" && res.stdout.replace(/\r?\n|\r/g,"") === "exists" ? true : false
    return next()
}

function ensureAppPod(host, ctx, next) {
    console.log(`step ${ctx.step}: ensureAppPod`)
    ctx.step += 1
    if ( !ctx.app.exists ) {
        try { 
            host.log('Done ensure ensureAppPod');
            ctx.app.installed = true
        } catch (err) { 
            ctx.app.installed = false
            return next(err)
        }
    }
    return next()
}

function stashNode(host, ctx, next) {
    console.log(`step ${ctx.step}: stashNode`)
    ctx.step += 1
    try {
        host.exec('node -v')
        ctx.node.exists = true
    } catch (err) {
        host.log('Binary not found')
        ctx.node.exists = false
    }
    return next()
}

function ensureNode(host, ctx, next) {
    console.log(`step ${ctx.step}: ensureNode`)
    ctx.step += 1
    if ( !ctx.node.exists ) {
        try {
            host.log('installing node from source...')
            host.exec('curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -')
            host.exec('apt-get install  -y nodejs')
            host.log('Done ensure node');
            ctx.node.installed = true
        } catch (err) { 
            ctx.node.installed = false
            return next(err)
        }
    }
    return next()
}

function stashYarnModule(host, ctx, next) {
    console.log(`step ${ctx.step}: stashYarnModule`)
    ctx.step += 1
    try {
        host.exec('yarn -v')
        ctx.yarn.exists = true
    } catch (err) {
        host.log('yarn not found')
        ctx.yarn.exists = false
    } finally {
        return next()
    }
}

function ensureYarnModule(host, ctx, next) {
    console.log(`step ${ctx.step}: ensureYarnModule`)
    ctx.step += 1
    if ( !ctx.yarn.exists ) {
        try {
            host.log('installing yarn from npm...')
            host.exec('npm install -g yarn')
            host.log('Done installing yarn')
            ctx.yarn.installed = true
        } catch (err) { 
            ctx.yarn.installed = false
            return next(err)
        }
    }
    return next()
}

function stashPodModule(host, ctx, next) {
    console.log(`step ${ctx.step}: stashPodModule`)
    ctx.step += 1 
    try {
        host.exec('which pod')
        ctx.pod.exists = true
    } catch (err) {
        ctx.pod.exists = false
    } finally {
        return next()
    }
}

function ensurePodModule(host, ctx, next) {
    console.log(`step ${ctx.step}: ensurePodModule`)
    ctx.step += 1
    if ( !ctx.pod.exists ) {
        try {
            host.log('installing pod from npm...')
            host.exec('yarn global add git+https://github.com/yyx990803/pod.git ')
            host.log('Done ensure pod')
            ctx.pod.installed = true
        } catch (err) { 
            ctx.pod.installed = false
            return next(err)
        }
    }
    return next()
}

function stashNginx(host, ctx, next) {
    console.log(`step ${ctx.step}: stashNginx`)
    ctx.step += 1 
    try {
        host.exec('which nginx')
        ctx.nginx.exists = true
    } catch (err) {
        host.log('nginx not installed')
        ctx.nginx.exists = false
    } finally {
        return next()
    }
}

function ensureNginx(host, ctx, next) {
    console.log(`step ${ctx.step}: ensureNginx`)
    ctx.step += 1
    if ( !ctx.nginx.exists ) {        
        try {
            host.log('installing nginx from apt...')
            host.exec('apt-get update')
            host.exec('apt-get install -y nginx') 
            ctx.nginx.installed = true
        } catch (err) { 
            ctx.nginx.installed = false
            return next(err)
        }
    } 
    return next()
}

function stashMongo(host, ctx, next) {
    console.log(`step ${ctx.step}: stashMongo`)
    ctx.step += 1
    try {
        host.exec('which mongo')
        ctx.mongo.exists = true
    } catch (err) {
        host.log('mongo not installed')
        ctx.mongo.exists = false
    } finally {
        return next()
    }
}

function ensureMongo(host, ctx, next) {
    console.log(`step ${ctx.step}: ensureMongo`)
    ctx.step += 1
    if ( !ctx.mongo.exists ) {        
        try {
            // import the key for the official MongoDB repository
            host.log('add apt key...')
            host.exec('apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 0C49F3730359A14518585931BC711F9BA15703C6')

            // add MongoDB repository details to apt
            const mongourl = "http://repo.mongodb.org/apt/ubuntu/dists/xenial/mongodb-org/3.5"
            host.exec(`echo "deb [ arch=amd64,arm64 ] ${mongourl} multiverse" | tee /etc/apt/sources.list.d/mongodb-org-3.4.list`)
            host.exec('apt-get update')

            // install themongodb-org meta-package, which includes the daemon, configuration and init scripts
            host.log('installing mongo from apt...')
            host.exec('apt-get install -y mongodb-org') 

            // start mongo daemon
            host.exec('systemctl start mongod')
            host.exec('systemctl status mongod')
            host.exec('systemctl enable mongod')

            ctx.mongo.installed = true
        } catch (err) { 
            ctx.mongo.installed = false
            return next(err)
        }
    } 
    return next()
}

const run = (host, ctx) => {

    var Usey = require('usey')
    var app = Usey()

    app.use(stashNode)
    app.use(ensureNode)

    app.use(stashYarnModule)
    app.use(ensureYarnModule)

    app.use(stashPodModule)
    app.use(ensurePodModule)

    app.use(stashNginx)
    app.use(ensureNginx)

    app.use(stashAppPod)
    app.use(ensureAppPod)

    app.use(stashMongo)
    app.use(ensureMongo)

    app.use(function (host, ctx, next) {
        console.log('======all done======')
        return next()
    })

    app(host, ctx, function(err, host, ctx) {
        if (err) {
            console.log('app error handler')
            const pe = new pretty()
            console.error(pe.render(err))
        }
        console.log(ctx)
        return
    })
}


// run commands on remote
plan.remote(function(host) {
    host.log('Run default')
    host.exec('uname -a')

    ensureRuntimeDeps(host)    
    host.log('All Runtime dependecies exists on remote host')
    // process.exit()
    //var filesToCopy = host.exec('git ls-files', {silent: true});
    // rsync files to all the target's remote hosts
    //host.transfer(filesToCopy, '/tmp/' + tmpDir);
})

var hostconfig = `
Host  staging
    Hostname ${argv.host}
    IdentityFile ~/.ssh/id_rsa
    User root
`;

plan.local(function(host) {
    host.log('remote tasks completed successfully')

    try {
        host.exec('pwd')
        host.exec('git status')
        console.log('gitstatus ')
    } catch (err) {
        console.log('git init? ', configPath)
    }

    // let sshconfigfile = path.join(userHome, '/.ssh/config')
    // if (!fs.existsSync(sshconfigfile)) {
    //     host.exec(`touch ${sshconfigfile}`)
    //     console.log('fs.existsSync', fs.existsSync(sshconfigfile))
    // }

    // fs.appendFileSync(sshconfigfile, hostconfig)
})