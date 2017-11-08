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

console.log('flightplan on it', argv.passphrase)

// configuration
plan.target('staging', {
    host: argv.host,
    username: argv.username,
    passphrase: argv.passphrase,
    agent: process.env.SSH_AUTH_SOCK,
    privateKey: path.join(userHome, '/.ssh/id_rsa')
})

var tmpDir = 'tendapa-com-' + new Date().getTime()

function stashAppPod(host, ctx, next) {    
    const res = host.exec('[ -d /root/repos/tendapa.git ] && echo "exists" || echo "notfound"')
    ctx.app.exists = res.code == "0" && res.stdout.replace(/\r?\n|\r/g,"") === "exists" ? true : false
    return next()
}

function ensureRuntimeDeps(host) {
    let context = {
        step: 0,
        node: {},
        yarn: {},
        pod: {},
        nginx: {},
        app: {}
    }
    run(host, context)
}

function stashNode(host, ctx, next) {
    ctx.step += 1
    console.log('step 1: Ensure node and npm')
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
    ctx.step += 1
    console.log('step 2: Ensure yarn npm moduld')
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
    ctx.step += 1
    console.log('step 3: Ensure pod npm moduld')
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
    ctx.step += 1
    console.log('step 4: Ensure nginx')
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

    app.use(function (host, ctx, next) {
        console.log('======alll done======')
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
    Hostname 165.227.178.113
    IdentityFile ~/.ssh/id_rsa
    User root
`;

plan.local(function(host) {
    host.log('remote tasks completed successfully')

    let sshconfigfile = path.join(userHome, '/.ssh/config')
    if (!fs.existsSync(sshconfigfile)) {
        host.exec(`touch ${sshconfigfile}`)
        console.log('fs.existsSync', fs.existsSync(sshconfigfile))
    }

    // fs.appendFileSync(sshconfigfile, hostconfig)
})