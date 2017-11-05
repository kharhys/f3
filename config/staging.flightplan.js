// flightplan.js
var userHome = require('user-home');
var plan = require('flightplan');
var path = require('path');
var fs = require('fs');
var pretty = require('pretty-error')

require('dotenv').config({path: path.resolve('config/.env')})


console.log('flightplan on it', process.env.PASSPHRASE)

// configuration
plan.target('staging', {
    username: 'root',
    host: '165.227.178.113',
    agent: process.env.SSH_AUTH_SOCK,
    passphrase: process.env.PASSPHRASE,
    privateKey: path.join(userHome, '/.ssh/id_rsa')
});

// plan.target('production', [{
//     host: 'www1.tendapa.com',
//     username: 'pstadler',
//     agent: process.env.SSH_AUTH_SOCK
// }, {
//     host: 'www2.tendapa.com',
//     username: 'pstadler',
//     agent: process.env.SSH_AUTH_SOCK
// }]);

var tmpDir = 'tendapa-com-' + new Date().getTime();

// run commands on localhost
plan.remote(function(host) {

    host.log('Run default');
    host.exec('uname -a');

    host.log('Ensure node is installed')
    try {

        host.exec('node -v')

        host.log('node exists. proceeding...')
        host.log('Ensure yarn is installed')
        try {

            host.exec('yarn -v')
            host.log('yarn exists. proceeding...')
            host.log('Ensure pod is installed')
            try {

                host.exec('pod help')
                host.log('pod exists. proceeding...')

                try {
                	host.exec('pod create tendapa')
                } catch (err) {
	                host.log('app already exists')

	                // host.exec('apt-get update')
	                // host.exec('apt-get install nginx')

	                return
	            }

            } catch (err) {
                host.log('pod not found')
                installPod(host)
            }

        } catch (err) {
            host.log('yarn not found')
            installYarn(host)
        }

    } catch (err) {
        host.log('Binary not found')
        installNode(host)
    }


    //host.log('Copy files to remote hosts');
    //var filesToCopy = host.exec('git ls-files', {silent: true});
    // rsync files to all the target's remote hosts
    //host.transfer(filesToCopy, '/tmp/' + tmpDir);
});

const installNode = host => {
    host.log('Installing node from source...');
    try {
        host.exec('curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -');
        host.exec('apt-get install  -y nodejs');
        host.log('Done Install node');
    } catch (err) {
        const pe = new pretty()
        console.error('error installing node ')
        console.error(pe.render(err))
    }
}


const installYarn = host => {
    host.log('Installing yarn from npm...');
    try {
        host.exec('npm install -g yarn');
        host.log('Done Install yarn');
    } catch (err) {
        const pe = new pretty()
        console.error('error installing yarn ')
        console.error(pe.render(err))
    }
}

const installPod = host => {
    host.log('Installing pod from npm...');
    try {
        host.exec('yarn global add git+https://github.com/yyx990803/pod.git ');
        host.log('Done Install pod');
    } catch (err) {
        const pe = new pretty()
        console.error('error installing pod ')
        console.error(pe.render(err))
    }
}

var hostconfig = `
Host  staging
    Hostname 165.227.178.113
    IdentityFile ~/.ssh/id_rsa
    User root
`;

plan.local(function(host) {
	host.log('remote tasks completed successfully')	
	
	let sshconfigfile = path.join(userHome, '/.ssh/config') 
	if ( !fs.existsSync(sshconfigfile) ) {
		host.exec(`touch ${sshconfigfile}`)
		console.log('fs.existsSync', fs.existsSync(sshconfigfile))
	}

	// fs.appendFileSync(sshconfigfile, hostconfig)
})